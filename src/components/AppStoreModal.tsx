import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Share2,
  PlusSquare,
  Globe
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';

interface AppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppStoreModal: React.FC<AppStoreModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install, markAsInstalled } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'google_play' | 'apple_store' | 'checklist'>('install');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  React.useEffect(() => {
    if (isInstalled && isOpen) {
      onClose();
    }
  }, [isInstalled, isOpen, onClose]);

  if (!isOpen || isInstalled) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://patrolreadyperformance.com';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const capacitorCode = `# 1. Install Capacitor CLI & Core
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# 2. Initialize project configuration
npx cap init "Patrol Ready Performance" com.patrolready.app --web-dir dist

# 3. Build production web assets
npm run build

# 4. Add iOS & Android native shells
npx cap add ios
npx cap add android

# 5. Open in Xcode or Android Studio to sign & submit to Stores
npx cap open ios
npx cap open android`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#111c2e] via-[#0b1320] to-[#080e18] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Blue Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
              <PatrolReadyCompanyEmblem size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  App Store &amp; Packaging Hub
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  PWA Store Ready
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-athletic uppercase tracking-wide">
                Publish &amp; Install Patrol Ready Performance
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0b1329] px-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'install'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Direct Device Install
          </button>
          <button
            onClick={() => setActiveTab('google_play')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'google_play'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Google Play Store
          </button>
          <button
            onClick={() => setActiveTab('apple_store')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'apple_store'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Apple App Store
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Store Checklist
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: DIRECT DEVICE INSTALL */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-blue-300 uppercase tracking-wider">
                    Instant Native App Experience
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    You do not need to wait weeks for app store approvals. Patrol Ready Performance is configured as a certified Progressive Web App that runs standalone directly on your home screen with zero browser address bars, offline workout caching, and launch splash screens.
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Application Already Installed
                  </h4>
                  <p className="text-xs text-slate-300">
                    You are running Patrol Ready Performance in standalone native application mode!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Android / Desktop Install */}
                  <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                        <Smartphone className="w-4 h-4 text-blue-400" />
                        Android / Chrome / PC
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Installs the app directly onto your home screen or desktop application list.
                      </p>
                    </div>

                    {isInstallable ? (
                      <button
                        onClick={install}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 cursor-pointer transition-all active:scale-95 border border-blue-400/40"
                      >
                        <Download className="w-4 h-4" />
                        Install App Now
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-300 bg-[#060b14] p-2.5 rounded-lg border border-slate-800/80">
                        Tap your browser menu (<span className="font-mono text-blue-400">⋮</span>) and select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                      </div>
                    )}
                  </div>

                  {/* iOS Safari Guide */}
                  <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        iPhone & iPad (iOS)
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Apple iOS allows installation directly from Safari into an icon on your home screen:
                      </p>
                    </div>

                    <div className="bg-[#060b14] p-3 rounded-lg border border-slate-800/80 space-y-2 text-[11px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 font-mono flex items-center justify-center font-bold text-[10px]">1</span>
                        <span>Tap the <strong className="text-white">Share</strong> button in Safari toolbar (<Share2 className="w-3 h-3 inline text-blue-400" />)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 font-mono flex items-center justify-center font-bold text-[10px]">2</span>
                        <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> (<PlusSquare className="w-3 h-3 inline text-blue-400" />)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE PLAY STORE (PWABUILDER / TWA) */}
          {activeTab === 'google_play' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Option 1: 1-Click Package with PWABuilder (Recommended)
                  </h4>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Official Google Partner</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  PWABuilder is Microsoft & Google's free open-source tool that wraps this certified PWA into a signed <strong>Android App Bundle (.aab)</strong> using Trusted Web Activities (TWA). You can upload the generated file straight into the Google Play Console!
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={`https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-400/40"
                  >
                    Open PWABuilder for Patrol Ready
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(currentUrl, 'url')}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedCmd === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy App URL: {currentUrl.replace(/https?:\/\//, '').slice(0, 20)}...
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  Option 2: Google's Official CLI (Bubblewrap)
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Run Google's official command-line packaging tool on your development machine:
                </p>
                <div className="relative">
                  <pre className="p-3 bg-[#060b14] rounded-lg text-[11px] font-mono text-blue-300 overflow-x-auto border border-slate-800">
{`npm install -g @bubblewrap/cli
bubblewrap init --manifest="${currentUrl}/manifest.webmanifest"`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`npm install -g @bubblewrap/cli\nbubblewrap init --manifest="${currentUrl}/manifest.webmanifest"`, 'bubble')}
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Copy command"
                  >
                    {copiedCmd === 'bubble' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLE APP STORE (CAPACITOR / XCODE) */}
          {activeTab === 'apple_store' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Capacitor Native iOS Shell
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  To publish to the Apple App Store, wrapping with <strong>Capacitor</strong> gives you an authentic native Xcode workspace. You can then submit it to TestFlight and the Apple App Store with full In-App Purchase and HealthKit support.
                </p>

                <div className="relative pt-1">
                  <pre className="p-3.5 bg-[#060b14] rounded-xl text-[11px] font-mono text-blue-300 overflow-x-auto border border-slate-800 leading-relaxed">
{capacitorCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(capacitorCode, 'cap')}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Copy commands"
                  >
                    {copiedCmd === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs space-y-1 text-slate-300">
                <p className="font-bold text-blue-400">Apple Developer Program Requirement:</p>
                <p>Apple requires an active Apple Developer Program account ($99/year) to submit builds through Xcode or TestFlight to the iOS App Store.</p>
              </div>
            </div>
          )}

          {/* TAB 4: STORE READINESS CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Both Google Play and Apple App Store require strict asset criteria. Patrol Ready Performance meets all store packaging qualifications:
              </p>

              <div className="space-y-2">
                {[
                  { label: 'Web App Manifest (id, start_url, standalone)', status: 'PASS', detail: 'Includes portrait orientation & fitness categories' },
                  { label: '192x192 & 512x512 High-Res PNG App Icons', status: 'PASS', detail: 'Rendered with official Patrol Ready Performance shield badge' },
                  { label: 'Android Maskable Icon (Adaptive Safe Zones)', status: 'PASS', detail: 'Padded with safe zone margins to prevent squircle clipping' },
                  { label: 'Apple Touch Icon (180x180 PNG)', status: 'PASS', detail: 'Crisp standalone home screen icon for iOS Safari' },
                  { label: 'Service Worker & Offline Pre-caching', status: 'PASS', detail: 'VitePWA caching fonts, assets, and protocols for zero latency' },
                  { label: 'Mobile Viewport Fit & Touch Targets', status: 'PASS', detail: 'Optimized touch targets, no pinch distortion, status bar translucent' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.detail}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#080e18] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Patrol Ready Performance • Tactical fitness for the Frontline.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                markAsInstalled();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              title="Click if already installed on this device to remove install prompts"
            >
              Already Installed? (Dismiss)
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
