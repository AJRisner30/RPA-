import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { auth as authTrigger } from 'firebase-functions/v1';
import * as crypto from 'crypto';

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Valid subscription tiers supported by the RBAC engine
 */
export type SubscriptionTier = 'standard' | 'pro' | 'enterprise';

/**
 * Valid account subscription statuses
 */
export type AccountStatus = 'trialing' | 'active_subscriber' | 'past_due' | 'canceled' | 'unpaid';

/**
 * Expected Webhook Request Payload format
 */
export interface SubscriptionWebhookPayload {
  userId: string;
  tier: SubscriptionTier;
  status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  subscriptionId?: string;
  customerEmail?: string;
  priceId?: string;
  currentPeriodEnd?: number | string;
}

/**
 * Verify webhook request HMAC SHA256 signature or shared secret header
 */
function verifyWebhookSignature(req: any, secret: string): boolean {
  if (!secret) {
    const authHeader = req.headers['authorization'];
    return !!authHeader && authHeader.replace('Bearer ', '') === 'dev-webhook-secret';
  }

  const incomingSecret = req.headers['x-webhook-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (incomingSecret === secret) {
    return true;
  }

  const incomingSignature = req.headers['x-webhook-signature'] as string | undefined;
  if (incomingSignature && req.rawBody) {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');

    const bufferA = Buffer.from(incomingSignature, 'utf8');
    const bufferB = Buffer.from(computedSignature, 'utf8');
    if (bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB)) {
      return true;
    }
  }

  return false;
}

/**
 * Cloud Function Auth Trigger: onUserCreated
 * 
 * Automatically triggers upon account creation in Firebase Auth.
 * Injects:
 * - tier: "pro" (unlocks all premium features during risk-free trial)
 * - status: "trialing"
 * - trialEnd: exact unix epoch timestamp (in seconds) set to 14 days from current server time
 */
export const onUserCreated = authTrigger.user().onCreate(async (user) => {
  const serverTimeSeconds = Math.floor(Date.now() / 1000);
  const FOURTEEN_DAYS_SECONDS = 14 * 24 * 60 * 60; // exactly 1,209,600 seconds
  const trialEndSeconds = serverTimeSeconds + FOURTEEN_DAYS_SECONDS;

  console.log(`[RBAC Auth Trigger] New user registered: ${user.uid} (${user.email || 'no email'}). Initializing 14-day Pro trial.`);

  try {
    // 1. Prepare initial claims with 14-day trial
    const customClaims = {
      tier: 'pro' as SubscriptionTier,
      status: 'trialing' as AccountStatus,
      trialEnd: trialEndSeconds,
      trialStartedAt: serverTimeSeconds,
    };

    // 2. Set Custom Claims in Firebase Auth
    await admin.auth().setCustomUserClaims(user.uid, customClaims);

    // 3. Mirror trial state in Firestore for auditing and indexing
    const db = admin.firestore();
    const batch = db.batch();

    const userDocRef = db.collection('users').doc(user.uid);
    batch.set(
      userDocRef,
      {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        tier: 'pro',
        status: 'trialing',
        trialEnd: admin.firestore.Timestamp.fromMillis(trialEndSeconds * 1000),
        trialEndSeconds: trialEndSeconds,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const subDocRef = db.collection('subscriptions').doc(user.uid);
    batch.set(
      subDocRef,
      {
        userId: user.uid,
        tier: 'pro',
        status: 'trialing',
        trialEnd: admin.firestore.Timestamp.fromMillis(trialEndSeconds * 1000),
        trialEndSeconds: trialEndSeconds,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();

    console.log(`[RBAC Auth Trigger] Successfully provisioned 14-day trial for user ${user.uid}. Trial ends at unix ${trialEndSeconds}.`);
  } catch (err) {
    console.error(`[RBAC Auth Trigger] Failed to initialize trial claims for user ${user.uid}:`, err);
    throw err;
  }
});

/**
 * Cloud Function Webhook: subscriptionWebhook
 * 
 * Securely updates Firebase Auth Custom User Claims when subscription events occur.
 * Marks paying subscribers as status: "active_subscriber".
 */
export const subscriptionWebhook = onRequest(
  {
    cors: false,
    region: 'us-central1',
    maxInstances: 10,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed. Use POST for subscription webhooks.',
      });
      return;
    }

    const webhookSecret = process.env.SUBSCRIPTION_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || '';

    const isValidRequest = verifyWebhookSignature(req, webhookSecret);
    if (!isValidRequest && process.env.NODE_ENV === 'production') {
      console.error('[RBAC Webhook] Unauthorized request received: Invalid or missing webhook signature.');
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid webhook signature or secret header.',
      });
      return;
    }

    try {
      const payload: SubscriptionWebhookPayload = req.body;

      if (!payload || typeof payload !== 'object') {
        res.status(400).json({
          success: false,
          error: 'Bad Request: Missing or invalid JSON body.',
        });
        return;
      }

      const { userId, tier, status, subscriptionId, customerEmail } = payload;

      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Bad Request: "userId" is required and must be a valid Firebase Auth UID string.',
        });
        return;
      }

      const validTiers: SubscriptionTier[] = ['standard', 'pro', 'enterprise'];
      let targetTier: SubscriptionTier = tier;
      let targetStatus: AccountStatus = 'active_subscriber';

      if (status === 'canceled' || status === 'unpaid') {
        targetTier = 'standard';
        targetStatus = 'canceled';
      } else if (status === 'past_due') {
        targetStatus = 'past_due';
      } else if (status === 'trialing') {
        targetStatus = 'trialing';
      }

      if (!validTiers.includes(targetTier)) {
        res.status(400).json({
          success: false,
          error: `Bad Request: Invalid tier "${tier}". Must be one of: ${validTiers.join(', ')}.`,
        });
        return;
      }

      let existingUser: admin.auth.UserRecord;
      try {
        existingUser = await admin.auth().getUser(userId);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          res.status(404).json({
            success: false,
            error: `User with UID "${userId}" not found in Firebase Auth.`,
          });
          return;
        }
        throw authError;
      }

      // Preserve existing custom claims to avoid clobbering other roles
      const existingClaims = existingUser.customClaims || {};

      const newClaims = {
        ...existingClaims,
        tier: targetTier,
        status: targetStatus,
        tierUpdatedAt: Date.now(),
      };

      await admin.auth().setCustomUserClaims(userId, newClaims);

      console.log(`[RBAC Webhook] Updated custom claims for user ${userId} to tier: "${targetTier}", status: "${targetStatus}".`);

      const db = admin.firestore();
      const batch = db.batch();

      const subscriptionRef = db.collection('subscriptions').doc(userId);
      batch.set(
        subscriptionRef,
        {
          userId,
          tier: targetTier,
          status: targetStatus,
          subscriptionId: subscriptionId || null,
          customerEmail: customerEmail || existingUser.email || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const userRef = db.collection('users').doc(userId);
      batch.set(
        userRef,
        {
          tier: targetTier,
          status: targetStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      await batch.commit();

      res.status(200).json({
        success: true,
        message: `Custom claims and subscription updated to tier "${targetTier}" with status "${targetStatus}".`,
        data: {
          userId,
          tier: targetTier,
          status: targetStatus,
          claims: newClaims,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[RBAC Webhook] Error processing subscription webhook:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error while updating custom claims.',
      });
    }
  }
);
