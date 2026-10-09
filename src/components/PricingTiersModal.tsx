import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, Lock, RefreshCw, CheckCircle, XCircle, 
  Sparkles, Database, Code2, AlertTriangle, X, Check, Clock,
  CreditCard, ExternalLink, Mail
} from 'lucide-react';
import { useUserTier } from '../hooks/useUserTier';
import { auth, db } from '../firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

interface PricingTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature?: (feature: string) => void;
}

export const PricingTiersModal: React.FC<PricingTiersModalProps> = ({ isOpen, onClose }) => {
  const { 
    tier, 
    status, 
    trialDaysRemaining, 
    isTrialActive, 
    isTrialExpired, 
    isTrialExpiringSoon,
    isActiveSubscriber,
    claims, 
    refreshClaims, 
    setSimulatedOverride 
  } = useUserTier();

  const [activeTab, setActiveTab] = useState<'tiers' | 'rulesTest' | 'webhookDoc' | 'simulator'>('tiers');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string; data?: any }>({
    status: 'idle',
    message: '',
  });
  const [refreshing, setRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleTestFirestoreMetrics = async () => {
    if (!auth.currentUser) {
      setTestResult({
        status: 'error',
        message: 'Must be logged in to test Firestore RBAC security rules.',
      });
      return;
    }

    setTestResult({ status: 'testing', message: 'Testing Firestore rules on /performance_metrics/test-metric...' });

    try {
      const metricRef = doc(collection(db, 'performance_metrics'), `test-metric-${auth.currentUser.uid}`);
      
      // Attempt write
      await setDoc(metricRef, {
        userId: auth.currentUser.uid,
        testTime: new Date().toISOString(),
        testedTier: tier,
        testedStatus: status,
        metric: 'auto_overload_benchmarks',
        value: 100,
      });

      // Attempt read
      const snapshot = await getDoc(metricRef);
      setTestResult({
        status: 'success',
        message: `[200 OK] Access Granted! Your claim tier is "${tier}" and status is "${status}". Firestore read and write to /performance_metrics succeeded.`,
        data: snapshot.data(),
      });
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `[PERMISSION_DENIED] Access Blocked by Security Rules! Reason: ${err.message || 'Missing or insufficient permissions.'} Only users with tier: "pro" AND (status: "active_subscriber" OR request.time < trialEnd) are permitted.`,
      });
    }
  };

  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshClaims();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#090d16] border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1527]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white font-athletic">
                  Tier Access &amp; 14-Day Free Trial
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {tier} Tier
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
                  isActiveSubscriber
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : isTrialActive
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                    : 'bg-red-950/80 border-red-500 text-red-300'
                }`}>
                  {isActiveSubscriber ? 'Active Subscriber' : isTrialActive ? `Trial (${trialDaysRemaining}d left)` : 'Trial Expired'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                14-Day Risk-Free Trial • Firebase Auth Custom Claims RBAC
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0a101e] px-6 gap-4 text-xs font-mono font-bold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('tiers')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tiers'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Pricing Tiers &amp; Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'simulator'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            14-Day Trial Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rulesTest')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rulesTest'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Firestore Rules Tester
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webhookDoc')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'webhookDoc'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Auth Trigger &amp; Webhook
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'tiers' && (
            <div className="space-y-6">
              {/* Active Trial Notice */}
              {isTrialActive && (
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-white">14-Day Risk-Free Trial Active:</strong> You currently have full access to all Pro features ({trialDaysRemaining} days remaining).
                    </span>
                  </div>
                  <span className="font-mono text-blue-300 font-bold px-2 py-0.5 rounded bg-blue-900/60 shrink-0">
                    {trialDaysRemaining}d Left
                  </span>
                </div>
              )}

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Standard Tier ($15) */}
                <div className={`rounded-2xl p-5 border flex flex-col justify-between ${
                  tier === 'standard' && !isTrialActive
                    ? 'bg-slate-900/90 border-slate-700 shadow-md ring-1 ring-slate-600' 
                    : 'bg-[#0b101c]/60 border-slate-800/80'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold uppercase text-slate-400">Standard</span>
                      {tier === 'standard' && !isTrialActive && (
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Active</span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-white font-athletic mb-1">
                      $15<span className="text-xs font-normal text-slate-400 font-sans">/mo</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Core workout logging &amp; training protocols.</p>

                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        <span>All 4 Tactical Training Protocols</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        <span>Standard Workout &amp; Set Logging</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500 line-through">
                        <X className="w-3.5 h-3.5 text-red-500/70" />
                        <span>Auto-Overload Engine</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500 line-through">
                        <X className="w-3.5 h-3.5 text-red-500/70" />
                        <span>Firestore performance_metrics collection</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSimulatedOverride({ tier: 'standard', status: 'active_subscriber', trialEndOffsetDays: -1 })}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Select Standard ($15/mo)
                    </button>
                  </div>
                </div>

                {/* Pro Tier ($30) with 14-Day Free Trial */}
                <div className={`rounded-2xl p-5 border flex flex-col justify-between relative ${
                  tier === 'pro' 
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-black border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30' 
                    : 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-amber-500/40'
                }`}>
                  <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-black font-mono uppercase px-2.5 py-0.5 rounded-full shadow-md">
                    14-Day Free Trial
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold uppercase text-amber-400">Pro Tier</span>
                      {(tier === 'pro' || isTrialActive) && (
                        <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                          {isTrialActive ? 'Trialing' : 'Active'}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-white font-athletic mb-1">
                      $30<span className="text-xs font-normal text-slate-400 font-sans">/mo</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Complete auto-regulation &amp; tactical telemetry.</p>

                    <ul className="space-y-2 text-xs text-slate-200">
                      <li className="flex items-center gap-2 font-medium">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Auto-Overload Engine</strong> (Linear &amp; Stepped)</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>performance_metrics</strong> Firestore Collection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Tactical Readiness Scoring Analysis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Advanced Biometrics &amp; Max HR Zones</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSimulatedOverride({ tier: 'pro', status: 'active_subscriber', trialEndOffsetDays: 30 })}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                    >
                      Activate Pro ($30/mo)
                    </button>
                  </div>
                </div>

                {/* Enterprise Tier */}
                <div className={`rounded-2xl p-5 border flex flex-col justify-between ${
                  tier === 'enterprise' 
                    ? 'bg-slate-900/90 border-blue-500 shadow-md ring-1 ring-blue-500' 
                    : 'bg-[#0b101c]/60 border-slate-800/80'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold uppercase text-blue-400">Enterprise</span>
                      {tier === 'enterprise' && (
                        <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">Active</span>
                      )}
                    </div>
                    <div className="text-lg font-black text-white font-athletic mb-1 leading-tight">
                      AGENCY WIDE
                    </div>
                    <p className="text-xs text-blue-300/90 italic font-medium my-3 p-2.5 bg-blue-950/40 border border-blue-800/40 rounded-xl leading-relaxed">
                      "Contact directly for specific pricing and all the benefits of agency wide tracking"
                    </p>

                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400" />
                        <span>All Pro Tier Features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400" />
                        <span>Department Tactical Roster</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400" />
                        <span>Direct API &amp; Webhook Export</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <a
                      href="mailto:risnerathletics@gmail.com?subject=Agency%20Wide%20Tracking%20Inquiry"
                      className="w-full py-2 bg-blue-900/50 hover:bg-blue-800/60 border border-blue-500/40 text-blue-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact Directly</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Interactive 14-Day Trial &amp; RBAC Simulator
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSimulatedOverride(null)}
                    className="text-xs font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Reset to Real Token Claims
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Test and observe how the frontend <code className="text-amber-300 font-mono">&lt;TrialBanner /&gt;</code> and protected wrapper <code className="text-amber-300 font-mono">&lt;RequireTier /&gt;</code> react to trial phases and status changes:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSimulatedOverride({ tier: 'pro', status: 'trialing', trialEndOffsetDays: 14 })}
                    className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-blue-500/40 hover:border-blue-400 rounded-xl text-left transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-blue-400 font-mono">1. Fresh 14-Day Trial</div>
                    <div className="text-[11px] text-zinc-400 mt-1">14 days left. All Pro features unlocked. Subdued top badge.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimulatedOverride({ tier: 'pro', status: 'trialing', trialEndOffsetDays: 2 })}
                    className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-amber-500/50 hover:border-amber-400 rounded-xl text-left transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-amber-400 font-mono">2. Expiring Soon (&lt; 3 Days)</div>
                    <div className="text-[11px] text-zinc-400 mt-1">2 days remaining. Triggers prominent warning banner on screen!</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimulatedOverride({ tier: 'pro', status: 'trialing', trialEndOffsetDays: -1 })}
                    className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-red-500/50 hover:border-red-400 rounded-xl text-left transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-red-400 font-mono">3. Expired Trial (Past trialEnd)</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Trial expired without subscription. Automatically redirects to checkout!</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimulatedOverride({ tier: 'pro', status: 'active_subscriber', trialEndOffsetDays: 30 })}
                    className="p-3 bg-zinc-950 hover:bg-zinc-900 border border-emerald-500/50 hover:border-emerald-400 rounded-xl text-left transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-emerald-400 font-mono">4. Active Pro Subscriber ($30)</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Paid subscriber. Full permanent access. Banner hidden.</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rulesTest' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Live Firestore Security Rule Verification
                </h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Testing read &amp; write access to <code className="text-amber-300 font-mono">/performance_metrics</code>. The deployed Firestore rule enforces:
                </p>
                <div className="bg-black/60 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 mb-4 overflow-x-auto">
                  <span className="text-purple-400">match</span> /performance_metrics/&#123;metricId&#125; &#123;<br />
                  &nbsp;&nbsp;<span className="text-purple-400">allow</span> read, write: <span className="text-purple-400">if</span> isSignedIn() &&<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;(request.auth.token.tier == <span className="text-emerald-300">'pro'</span> || request.auth.token.tier == <span className="text-emerald-300">'enterprise'</span>) &&<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;(request.auth.token.status == <span className="text-emerald-300">'active_subscriber'</span> || request.time &lt; trialEnd);<br />
                  &#125;
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestFirestoreMetrics}
                    disabled={testResult.status === 'testing'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Run Collection Access Test</span>
                  </button>

                  <div className="text-xs text-slate-400 font-mono">
                    Claim Tier: <span className="text-amber-300 uppercase font-bold">{tier}</span> • Status: <span className="text-blue-300 uppercase font-bold">{status}</span>
                  </div>
                </div>
              </div>

              {testResult.status !== 'idle' && (
                <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
                  testResult.status === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : testResult.status === 'error'
                    ? 'bg-red-950/40 border-red-500/50 text-red-300'
                    : 'bg-blue-950/40 border-blue-500/50 text-blue-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {testResult.status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                    {testResult.status === 'testing' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.data && (
                    <pre className="p-2 bg-black/60 rounded text-[11px] overflow-x-auto text-emerald-200">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'webhookDoc' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Auth Trigger &amp; Webhook Specification
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon account creation, the <code className="text-amber-300 font-mono">onUserCreated</code> trigger injects <code className="text-emerald-300 font-mono">status: "trialing"</code> and <code className="text-emerald-300 font-mono">trialEnd</code> (14 days from registration). When a subscription is purchased, <code className="text-blue-300 font-mono">subscriptionWebhook</code> updates <code className="text-emerald-300 font-mono">status: "active_subscriber"</code>.
                </p>

                <div className="text-xs font-mono font-bold text-slate-300">Generated Claims Object:</div>
                <pre className="p-3 bg-black/70 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`// Claims injected on account creation:
{
  "tier": "pro",
  "status": "trialing",
  "trialEnd": 1742457600 // exactly 14 days in seconds from creation
}

// Claims updated upon subscription payment:
{
  "tier": "pro",
  "status": "active_subscriber",
  "tierUpdatedAt": 1741248000
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0d1527]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>14-Day Free Trial • Pro ($30/mo) • Standard ($15/mo)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
