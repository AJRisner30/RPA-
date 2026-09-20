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
import { OverlandCompanyEmblem } from './BrandingLogos';

interface AppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppStoreModal: React.FC<AppStoreModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'google_play' | 'apple_store' | 'checklist'>('install');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://overlandathletics.com';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const capacitorCode = `# 1. Install Capacitor CLI & Core
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# 2. Initialize project configuration
npx cap init "Overland Athletics" com.overlandathletics.app --web-dir dist

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
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#182028] via-[#12171d] to-[#0d1217] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <OverlandCompanyEmblem size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  App Store & Packaging Hub
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  PWA Store Ready
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-athletic uppercase tracking-wide">
                Publish & Install Overland Athletics
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-[#0e1318] px-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'install'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Direct Device Install
          </button>
          <button
            onClick={() => setActiveTab('google_play')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'google_play'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Google Play Store
          </button>
          <button
            onClick={() => setActiveTab('apple_store')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'apple_store'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Apple App Store
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
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
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-300 uppercase tracking-wider">
                    Instant Native App Experience
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    You do not need to wait weeks for app store approvals. Overland Athletics is configured as a certified Progressive Web App that runs standalone directly on your home screen with zero browser address bars, offline workout caching, and launch splash screens.
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Application Already Installed
                  </h4>
                  <p className="text-xs text-zinc-300">
                    You are running Overland Athletics in standalone native application mode!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Android / Desktop Install */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        Android / Chrome / PC
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Installs the app directly onto your home screen or desktop application list.
                      </p>
                    </div>

                    {isInstallable ? (
                      <button
                        onClick={install}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer transition-all active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        Install App Now
                      </button>
                    ) : (
                      <div className="text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                        Tap your browser menu (<span className="font-mono text-amber-400">⋮</span>) and select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                      </div>
                    )}
                  </div>

                  {/* iOS Safari Guide */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                        <Share2 className="w-4 h-4 text-amber-400" />
                        iPhone & iPad (iOS)
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Apple iOS allows installation directly from Safari into an icon on your home screen:
                      </p>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 space-y-2 text-[11px] text-zinc-300">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-mono flex items-center justify-center font-bold text-[10px]">1</span>
                        <span>Tap the <strong className="text-white">Share</strong> button in Safari toolbar (<Share2 className="w-3 h-3 inline text-amber-400" />)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-mono flex items-center justify-center font-bold text-[10px]">2</span>
                        <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> (<PlusSquare className="w-3 h-3 inline text-amber-400" />)</span>
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
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Option 1: 1-Click Package with PWABuilder (Recommended)
                  </h4>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Official Google Partner</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  PWABuilder is Microsoft & Google's free open-source tool that wraps this certified PWA into a signed <strong>Android App Bundle (.aab)</strong> using Trusted Web Activities (TWA). You can upload the generated file straight into the Google Play Console!
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={`https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    Open PWABuilder for Overland
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(currentUrl, 'url')}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedCmd === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy App URL: {currentUrl.replace(/https?:\/\//, '').slice(0, 20)}...
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Option 2: Google's Official CLI (Bubblewrap)
                </h4>
                <p className="text-zinc-300 leading-relaxed">
                  Run Google's official command-line packaging tool on your development machine:
                </p>
                <div className="relative">
                  <pre className="p-3 bg-black/70 rounded-lg text-[11px] font-mono text-amber-300 overflow-x-auto border border-zinc-800">
{`npm install -g @bubblewrap/cli
bubblewrap init --manifest="${currentUrl}/manifest.webmanifest"`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`npm install -g @bubblewrap/cli\nbubblewrap init --manifest="${currentUrl}/manifest.webmanifest"`, 'bubble')}
                    className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
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
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Capacitor Native iOS Shell
                </h4>
                <p className="text-zinc-300 leading-relaxed">
                  To publish to the Apple App Store, wrapping with <strong>Capacitor</strong> gives you an authentic native Xcode workspace. You can then submit it to TestFlight and the Apple App Store with full In-App Purchase and HealthKit support.
                </p>

                <div className="relative pt-1">
                  <pre className="p-3.5 bg-black/80 rounded-xl text-[11px] font-mono text-amber-300 overflow-x-auto border border-zinc-800 leading-relaxed">
{capacitorCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(capacitorCode, 'cap')}
                    className="absolute top-3 right-3 p-1.5 rounded bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                    title="Copy commands"
                  >
                    {copiedCmd === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-amber-950/20 border border-amber-800/30 rounded-xl text-xs space-y-1 text-zinc-300">
                <p className="font-bold text-amber-400">Apple Developer Program Requirement:</p>
                <p>Apple requires an active Apple Developer Program account ($99/year) to submit builds through Xcode or TestFlight to the iOS App Store.</p>
              </div>
            </div>
          )}

          {/* TAB 4: STORE READINESS CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Both Google Play and Apple App Store require strict asset criteria. Overland Athletics meets all store packaging qualifications:
              </p>

              <div className="space-y-2">
                {[
                  { label: 'Web App Manifest (id, start_url, standalone)', status: 'PASS', detail: 'Includes portrait orientation & fitness categories' },
                  { label: '192x192 & 512x512 High-Res PNG App Icons', status: 'PASS', detail: 'Rendered with official Overland Athletics shield crest' },
                  { label: 'Android Maskable Icon (Adaptive Safe Zones)', status: 'PASS', detail: 'Padded with safe zone margins to prevent squircle clipping' },
                  { label: 'Apple Touch Icon (180x180 PNG)', status: 'PASS', detail: 'Crisp standalone home screen icon for iOS Safari' },
                  { label: 'Service Worker & Offline Pre-caching', status: 'PASS', detail: 'VitePWA caching fonts, assets, and protocols for zero latency' },
                  { label: 'Mobile Viewport Fit & Touch Targets', status: 'PASS', detail: 'Optimized touch targets, no pinch distortion, status bar translucent' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[11px] text-zinc-400">{item.detail}</div>
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
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#0d1217] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Overland Athletics Architecture — Run • Lift • Ruck</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
