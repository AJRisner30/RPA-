# Square Payment Integration for Patrol Ready Performance

A complete blueprint to integrate Square recurring payment links into the subscription tiers, allowing officers and athletes to subscribe to the Standard ($15/mo) and Pro ($30/mo) plans with instant automatic tier unlocking upon checkout completion.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following architectural decisions in Phase 1:
> - **Integration Method**: Square Payment Links for recurring subscriptions (hosted checkout with full PCI compliance, Apple Pay, Google Pay, and Cash App Pay).
> - **Environment**: Square Sandbox credentials & test links initially, with straightforward switching to live production links.
> - **Account Upgrades**: Automatic immediate tier upgrade (`tier: 'pro' | 'standard'`, `status: 'active_subscriber'`) upon return from Square checkout confirmation.

- **Confirmed Decision 1**: Standardized on Square hosted subscription payment links to ensure zero server-side secret exposure, full cardholder data isolation, and instant compatibility across mobile and desktop.
- **Confirmed Decision 2**: Automatic detection of Square return callback via URL query parameters (`?payment=success&tier={tier}&transaction_id={id}`), syncing status to Firestore and activating `active_subscriber`.
- **Open Action for User**: In Square Dashboard, create the two recurring subscription payment links and set their return URL to the app URL. The app will provide working Sandbox test links and an Admin configuration panel for Coach AJ to update them anytime.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces static `mailto:` plan requests with seamless Square Checkout buttons for the **Standard Plan ($15/mo)** and **Pro Plan ($30/mo)**. When athletes click "Subscribe with Square", they are directed to the secure Square checkout page. Upon completion, Square redirects back to Patrol Ready Performance, where the app automatically validates the transaction parameters, upgrades their account tier in Firestore, and confirms active subscription status.
- **Target Audience / Persona**: Patrol officers, tactical athletes, and law enforcement recruits subscribing individually to structured programming and auto-overload features.
- **Key Value**: Frictionless monetization for Coach Aryan "AJ" Risner without managing sensitive card data or maintaining complex server billing infrastructure, while athletes get immediate access to Pro auto-overload, timer telemetry, and advanced analytics.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Pricing Modal ] ────> [ Click 'Subscribe with Square' ] ────> [ Square Checkout Page ]
        ▲                                                                │
        │                                                                │ Completes Payment
        │                                                                ▼
[ Pro Feature Unlocked ] <─── [ Confirmation Modal ] <─── [ Return to App (?payment=success) ]
```

1. **Plan Selection (`PricingTiersModal.tsx`)**:
   - The user opens the Membership Plans modal via the top bar badge or the 14-day trial banner.
   - For **Standard ($15/mo)**: Displays a clean "Subscribe with Square ($15/mo)" button featuring the official Square mark.
   - For **Pro ($30/mo)**: Features a high-visibility amber CTA "Subscribe with Square ($30/mo)" with a 14-day risk-free guarantee note.
   - For **Enterprise (Agency Wide)**: Retains the direct agency contact button for departmental quote inquiries.
2. **Checkout Transition**:
   - Clicking the button redirects the user to the secure Square checkout link with custom query tracking (`reference_id` tied to the athlete's UID).
3. **Return & Automated Activation**:
   - Square redirects the user back to the application with `?payment=success&tier=pro&order_id={id}`.
   - The app intercepts the parameters, persists the upgraded subscription state (`active_subscriber`, `tier: 'pro'`) to the user's Firestore profile, clears trial expiration limits, and shows a celebratory tactical confirmation modal:
     - *"Subscription Confirmed: Pro Frontline Tier Activated"*.
   - All locked Pro features (Auto-Overload Engine, real-time rest timers, anaerobic graph metrics) instantly unlock.
4. **Coach Administrative Configuration (`OfficerPortalTab.tsx`)**:
   - Coach AJ has a dedicated "Square Payment Configuration" panel inside the Officer Portal Admin area to view, test, and swap out the Sandbox and Production Square links for Standard and Pro tiers without redeploying code.

### Visual Identity & Theme
- **Color Discipline**: Consistent with the Patrol Ready Performance dark tactical palette (`#080e18` background, `#0f172a` container surfaces, electric blue `#3b82f6` accents, and amber `#f59e0b` Pro accents).
- **Square Payment Button Styling**: Square brand badge with subtle metallic sheen, crisp white text, and security verification chip ("256-Bit Encrypted Square Checkout").
- **Zero-Pill Compliance**: Plan pricing and metadata rendered cleanly with typographic separators (`$30/mo · Billed Monthly · Cancel Anytime`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Square Hosted Payment Links vs. Embedded Web Payments SDK**:
  - *Chosen Approach*: Square Payment Links.
  - *Why*: Recurring subscription management on Square requires customer and card-on-file tokens, which demand a secure PCI-compliant backend with Square secret tokens. Hosted Payment Links handle recurring subscription billing, card updates, Apple Pay, Google Pay, and Cash App Pay natively on Square's infrastructure with zero backend secrets in the client.
  - *Alternatives Considered*: Embedded SDK (requires custom server routes with secret API keys and webhook listeners, which breaks client-side architecture).
- **Decision 2: Automated Client-Side Callback Handler vs. Webhook Daemon**:
  - *Chosen Approach*: URL callback handler (`?payment=success&tier=...`) paired with Firestore persistence.
  - *Why*: Provides instant real-time feedback to the officer upon completing checkout without requiring long-running server webhook relays.
  - *Alternatives Considered*: Polling Firestore; introduces latency and requires external cloud function triggers.
- **Decision 3: Configurable Square Links in Firestore**:
  - *Chosen Approach*: Storing the active payment link URLs in Firestore with fallback constants.
  - *Why*: Allows Coach AJ to switch from Sandbox testing links to live Production links directly from the app UI as soon as live Square credentials are ready.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PATROL READY PERFORMANCE                        │
│                                                                        │
│   ┌─────────────────────┐             ┌────────────────────────────┐   │
│   │ PricingTiersModal   │             │   Square Return Listener   │   │
│   │ - Standard ($15/mo) │             │   - Parses ?payment=success│   │
│   │ - Pro Tier ($30/mo) │             │   - Validates tier & uid   │   │
│   └──────────┬──────────┘             └─────────────┬──────────────┘   │
│              │                                      │                  │
│              ▼                                      ▼                  │
│   ┌─────────────────────┐             ┌────────────────────────────┐   │
│   │ squarePayments.ts   │             │       useUserTier.ts       │   │
│   │ - getPaymentUrl()   │             │   - Updates subscription   │   │
│   │ - Sandbox / Prod    │             │   - Unlocks Pro features   │   │
│   └──────────┬──────────┘             └─────────────┬──────────────┘   │
│              │                                      │                  │
└──────────────┼──────────────────────────────────────┼──────────────────┘
               │                                      │
               ▼                                      ▼
    ┌────────────────────┐                 ┌──────────────────────┐
    │  Square Checkout   │                 │  Firestore Database  │
    │  (Hosted Billing)  │                 │  /athletes/{uid}     │
    │  - Credit Cards    │                 │  tier: 'pro'         │
    │  - Apple / Google  │                 │  status: 'active'    │
    │  - Cash App Pay    │                 └──────────────────────┘
    └────────────────────┘
```

### Data Model & State Schema

1. **Athlete Profile Firestore Schema (`/athletes/{uid}`)**:
   ```typescript
   export interface SubscriptionRecord {
     tier: 'standard' | 'pro' | 'enterprise';
     status: 'active_subscriber' | 'trialing' | 'canceled';
     provider: 'square';
     squareOrderId?: string;
     subscribedAt: string; // ISO string
     amount: number; // 15 or 30
     currency: 'USD';
   }
   ```
2. **Square Configuration Schema (`/settings/square_config`)**:
   ```typescript
   export interface SquareConfig {
     environment: 'sandbox' | 'production';
     standardPlanUrl: string;
     proPlanUrl: string;
     applicationId?: string;
     locationId?: string;
     updatedAt: string;
   }
   ```

### Step-by-Step Implementation Sequence

1. **Utility Service (`src/utils/squarePayments.ts`)**:
   - Helper to build checkout URLs with query parameters: `redirect_url`, `client_reference_id` (athlete UID), and plan metadata.
   - Pre-configured Sandbox test links so the user can test the full checkout flow immediately.
   - Callback handler to verify payment tokens and update the athlete's subscription in Firestore.
2. **Hook Upgrade (`src/hooks/useUserTier.ts`)**:
   - Add `activateSubscription(tier, providerDetails)` to immediately elevate user tier to `pro` or `standard` with status `active_subscriber`.
   - Update Firestore profile and local cache synchronously.
3. **Modal Modernization (`src/components/PricingTiersModal.tsx`)**:
   - Replace `mailto:` buttons with active Square Checkout actions.
   - Add visual badges for Apple Pay, Google Pay, and Cash App Pay supported by Square.
   - Add a direct "Test Sandbox Activation" shortcut for development validation.
4. **Return Listener & Celebration Modal (`src/components/SquareConfirmationModal.tsx` & `src/App.tsx`)**:
   - In `App.tsx`, listen for `?payment=success` on boot.
   - Automatically execute tier upgrade and display a confirmation dialog showing plan benefits.
5. **Coach Square Config Tool (`src/components/OfficerPortalTab.tsx`)**:
   - Provide an admin UI card where Coach AJ can paste custom Square payment links for Standard and Pro plans.
