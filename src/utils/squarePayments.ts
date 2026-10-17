import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AthleteProfile, SquareConfig, SubscriptionRecord } from '../types';
import { getCurrentAthlete, updateAthleteProfile } from './athleteAuth';
import { saveAthleteToFirestore } from './firebaseSync';

// Local storage cache keys
const STORAGE_SQUARE_CONFIG_KEY = 'prp_square_config_v1';
const STORAGE_TIER_OVERRIDE_KEY = 'rpa_tier_simulation_override_v1';

// Default initial config with Sandbox & Production links
export const DEFAULT_SQUARE_CONFIG: SquareConfig = {
  environment: 'sandbox',
  // Sandbox URLs (or placeholders ready for Coach AJ's live links)
  standardPlanUrl: 'https://sandbox.square.link/u/prp-standard-15',
  proPlanUrl: 'https://sandbox.square.link/u/prp-pro-30',
  applicationId: 'sandbox-sq0idb-demo',
  locationId: 'L8DEMOPATROL',
  updatedAt: new Date().toISOString(),
};

/**
 * Information requirements explaining what Coach AJ / Admin needs from Square
 * to complete live or sandbox recurring subscriptions.
 */
export const SQUARE_REQUIREMENTS_CHECKLIST = [
  {
    step: 1,
    title: 'Square Developer / Merchant Account',
    description: 'Active Square account at squareup.com (or developer.squareup.com for Sandbox testing).',
    action: 'Create or sign in to your Square Dashboard',
    link: 'https://developer.squareup.com/',
  },
  {
    step: 2,
    title: 'Create Recurring Payment Links in Square',
    description: 'Navigate to Payments > Payment Links in your Square Dashboard. Create two recurring links: Standard ($15/mo) and Pro ($30/mo).',
    action: 'Create Standard ($15/mo) & Pro ($30/mo) links',
    link: 'https://squareup.com/dashboard/payment-links',
  },
  {
    step: 3,
    title: 'Configure Redirect Return URL in Square',
    description: 'In your Square Payment Link settings, set the Redirect URL back to your app URL with ?payment=success&tier=pro (or tier=standard). Square will return athletes back directly after checkout.',
    action: 'Set Redirect URL in Square Payment Link settings',
    link: 'https://developer.squareup.com/docs/checkout-api',
  },
  {
    step: 4,
    title: 'Paste Links into Coach Admin Portal',
    description: 'Paste your generated Square Payment Link URLs directly into the Square Payment Configuration card in the Officer Portal.',
    action: 'Update URLs in Officer Portal > Square Config',
  },
];

/**
 * Loads current Square configuration from localStorage or Firestore
 */
export function getCachedSquareConfig(): SquareConfig {
  try {
    const raw = localStorage.getItem(STORAGE_SQUARE_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_SQUARE_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SQUARE_CONFIG;
}

/**
 * Subscribes to real-time Square configuration changes in Firestore
 */
export function subscribeToSquareConfig(
  onUpdate: (config: SquareConfig) => void
): Unsubscribe {
  const path = 'settings/square_config';
  try {
    const configDocRef = doc(db, 'settings', 'square_config');
    return onSnapshot(
      configDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SquareConfig>;
          const merged: SquareConfig = {
            environment: data.environment || 'sandbox',
            standardPlanUrl: data.standardPlanUrl || DEFAULT_SQUARE_CONFIG.standardPlanUrl,
            proPlanUrl: data.proPlanUrl || DEFAULT_SQUARE_CONFIG.proPlanUrl,
            applicationId: data.applicationId || DEFAULT_SQUARE_CONFIG.applicationId,
            locationId: data.locationId || DEFAULT_SQUARE_CONFIG.locationId,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          };
          try {
            localStorage.setItem(STORAGE_SQUARE_CONFIG_KEY, JSON.stringify(merged));
          } catch {}
          onUpdate(merged);
        } else {
          onUpdate(getCachedSquareConfig());
        }
      },
      (err) => {
        // Fallback to cached config if Firestore permission isn't ready
        onUpdate(getCachedSquareConfig());
      }
    );
  } catch (err) {
    onUpdate(getCachedSquareConfig());
    return () => {};
  }
}

/**
 * Saves updated Square configuration to Firestore and local storage (Coach AJ / Admin)
 */
export async function saveSquareConfig(config: SquareConfig, adminEmail?: string): Promise<void> {
  const path = 'settings/square_config';
  const cleanConfig: SquareConfig = {
    environment: config.environment || 'sandbox',
    standardPlanUrl: config.standardPlanUrl.trim() || DEFAULT_SQUARE_CONFIG.standardPlanUrl,
    proPlanUrl: config.proPlanUrl.trim() || DEFAULT_SQUARE_CONFIG.proPlanUrl,
    applicationId: config.applicationId?.trim() || undefined,
    locationId: config.locationId?.trim() || undefined,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || 'risnerathletics@gmail.com',
  };

  try {
    localStorage.setItem(STORAGE_SQUARE_CONFIG_KEY, JSON.stringify(cleanConfig));
    const configDocRef = doc(db, 'settings', 'square_config');
    await setDoc(configDocRef, cleanConfig);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Builds the Square checkout URL with return parameters
 */
export function buildSquareCheckoutUrl(
  tier: 'standard' | 'pro',
  athlete?: AthleteProfile | null,
  config?: SquareConfig | null
): string {
  const currentConfig = config || getCachedSquareConfig();
  const baseUrl = tier === 'pro' ? currentConfig.proPlanUrl : currentConfig.standardPlanUrl;
  
  if (typeof window === 'undefined') return baseUrl;

  // Build redirect URL back to app with completion query
  const returnUrl = new URL(window.location.origin);
  returnUrl.searchParams.set('payment', 'success');
  returnUrl.searchParams.set('tier', tier);
  if (athlete?.id) {
    returnUrl.searchParams.set('user', athlete.id);
  }
  returnUrl.searchParams.set('session_id', `sq_${Date.now().toString(36)}`);

  try {
    const urlObj = new URL(baseUrl);
    // Add client tracking reference if supported by link
    if (athlete?.id) {
      urlObj.searchParams.set('client_reference_id', athlete.id);
    }
    // Also include return parameter hint
    urlObj.searchParams.set('redirect_url', returnUrl.toString());
    return urlObj.toString();
  } catch {
    // If not a valid parseable absolute URL, return baseUrl
    return baseUrl;
  }
}

/**
 * Immediately unlocks Standard or Pro tier upon Square checkout completion.
 * Updates local cache, auth simulation override, and Firestore athlete document.
 */
export async function activateAthleteSubscription(
  tier: 'standard' | 'pro' | 'enterprise',
  userId: string,
  options?: {
    orderId?: string;
    paymentId?: string;
    environment?: 'sandbox' | 'production';
  }
): Promise<SubscriptionRecord> {
  const amount = tier === 'pro' ? 30 : tier === 'enterprise' ? 99 : 15;
  const subRecord: SubscriptionRecord = {
    tier,
    status: 'active_subscriber',
    provider: 'square',
    squareOrderId: options?.orderId || `sq_ord_${Date.now().toString(36)}`,
    squarePaymentId: options?.paymentId || `sq_pay_${Date.now().toString(36)}`,
    subscribedAt: new Date().toISOString(),
    amount,
    currency: 'USD',
    environment: options?.environment || 'sandbox',
  };

  // 1. Instantly write to localStorage tier override so useUserTier unlocks immediately
  try {
    const tierOverride = {
      tier,
      status: 'active_subscriber',
      provider: 'square',
      activatedAt: subRecord.subscribedAt,
    };
    localStorage.setItem(STORAGE_TIER_OVERRIDE_KEY, JSON.stringify(tierOverride));
  } catch (err) {
    console.warn('[Square] Could not persist tier override to localStorage:', err);
  }

  // 2. Update athlete profile locally
  try {
    const current = getCurrentAthlete();
    if (current && (current.id === userId || !current.id)) {
      const updatedAthlete: AthleteProfile = {
        ...current,
        subscription: subRecord,
      };
      updateAthleteProfile(current.id, updatedAthlete);
    }
  } catch (err) {
    console.warn('[Square] Local athlete profile update error:', err);
  }

  // 3. Persist to Firestore /athletes/{userId}
  try {
    const current = getCurrentAthlete();
    const athleteToSave: AthleteProfile = {
      ...(current || {
        id: userId,
        name: 'Patrol Officer',
        email: '',
        avatarColor: 'from-blue-600 to-indigo-800',
        joinedDate: new Date().toISOString().split('T')[0],
        experienceLevel: 'Intermediate',
        primaryGoal: 'Tactical Conditioning & Pursuit',
      }),
      subscription: subRecord,
    };
    await saveAthleteToFirestore(athleteToSave, userId);
  } catch (err) {
    console.warn('[Square] Firestore subscription save note:', err);
  }

  return subRecord;
}
