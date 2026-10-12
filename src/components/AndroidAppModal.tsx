import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Zap,
  HardDrive,
  Eye,
  Radio,
  FileCode2,
  Terminal,
  FolderDown,
  Layers
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAndroidHaptics } from '../hooks/useAndroidHaptics';
import { PatrolReadyCompanyEmblem } from './BrandingLogos';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, install, markAsInstalled } = usePWAInstall();
  const { tap, success, alert } = useAndroidHaptics();
  const [activeTab, setActiveTab] = useState<'install' | 'features' | 'apk_twa'>('install');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    tap();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleInstallClick = async () => {
    tap();
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        success();
      }
    } else {
      markAsInstalled();
      success();
    }
  };

  const bubblewrapSnippet = `# 1. Install Google's official Bubblewrap CLI for Android
npm install -g @bubblewrap/cli

# 2. Build the signed Android APK & Google Play App Bundle (AAB)
bubblewrap build --manifest android/twa-manifest.json

# 3. Output files ready for distribution or Google Play Store:
# -> app-release-signed.apk (Direct sideload on Android phones)
# -> app-release-bundle.aab (Upload directly to Google Play Console)`;

  const twaManifestSnippet = `{
  "packageId": "com.patrolready.performance",
  "host": "patrolreadyperformance.com",
  "name": "Patrol Ready Performance",
  "launcherName": "PatrolReady",
  "themeColor": "#0B1320",
  "navigationColor": "#070B12",
  "backgroundColor": "#070B12",
  "display": "standalone",
  "orientation": "portrait",
  "iconUrl": "https://patrolreadyperformance.com/pwa-512x512.png",
  "maskableIconUrl": "https://patrolreadyperformance.com/pwa-maskable-512x512.png",
  "shortcuts": [
    { "name": "Workouts", "url": "/?tab=workouts" },
    { "name": "Officer Portal", "url": "/?tab=officer_portal" },
    { "name": "Readiness", "url": "/?tab=calculator" }
  ]
}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#101b2d] via-[#0b1320] to-[#070b12] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android Green / Tactical Blue Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                  Android Native Edition
                </span>
                {isInstalled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    App Installed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    WebAPK &amp; TWA Ready
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-athletic uppercase tracking-wide">
                Patrol Ready Performance Android App
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              tap();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-[#080d16] px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => {
              tap();
              setActiveTab('install');
            }}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'install'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install on Android</span>
          </button>

          <button
            type="button"
            onClick={() => {
              tap();
              setActiveTab('features');
            }}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'features'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Android Capabilities</span>
          </button>

          <button
            type="button"
            onClick={() => {
              tap();
              setActiveTab('apk_twa');
            }}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'apk_twa'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>APK &amp; Play Store Files</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[70vh]">
          {/* TAB 1: INSTALL ON ANDROID */}
          {activeTab === 'install' && (
            <div className="space-y-5">
              {/* Status Banner */}
              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Running as Installed Android App</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Patrol Ready Performance is active in standalone mode with full hardware screen wake-lock, tactical vibration feedback, and offline caching.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-blue-950/60 border border-emerald-500/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wide text-white flex items-center gap-2">
                        <span>Direct Android WebAPK Install</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500 text-black font-black">
                          RECOMMENDED
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Installs Patrol Ready Performance directly to your Android Home Screen and App Drawer with high-res badge logo and no browser search bar.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4 stroke-[3]" />
                      <span>{isInstallable ? 'Install Android App' : 'Add to Android Home'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step by Step Manual Android Guide */}
              <div className="p-4 rounded-xl bg-[#0e1624] border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Manual Installation Steps on Android Devices</span>
                </h4>
                
                <ol className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span>Open this application in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android device.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span>Tap the three dots <strong>⋮ menu</strong> located in the top-right or bottom-right corner of the browser.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span>Select <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                    <span>Confirm by tapping <strong>Install</strong>. Android will build a native WebAPK with the Patrol Ready badge icon in your app drawer!</span>
                  </li>
                </ol>
              </div>

              {/* Home Screen App Shortcuts Info */}
              <div className="p-4 rounded-xl bg-[#0e1624] border border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Android Long-Press App Shortcuts</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Once installed on your Android home screen, long-press the <strong>Patrol Ready</strong> app icon to instantly jump to:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                  <div className="p-2.5 rounded-lg bg-[#142033] border border-slate-700/60 text-center">
                    <div className="text-xs font-bold text-white">Today's Workout</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Direct into duty lifting</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#142033] border border-slate-700/60 text-center">
                    <div className="text-xs font-bold text-amber-300">Officer Portal</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Private assigned protocol</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#142033] border border-slate-700/60 text-center">
                    <div className="text-xs font-bold text-blue-300">Readiness Test</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tactical PT calculation</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID CAPABILITIES */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Wake Lock */}
                <div className="p-4 rounded-xl bg-[#0e1624] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                    <Zap className="w-4 h-4" />
                    <span>Android Screen Wake-Lock</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Keeps the Android display actively awake during active workout sets and rest timers so your screen never turns black while exercising.
                  </p>
                </div>

                {/* 2. Haptics */}
                <div className="p-4 rounded-xl bg-[#0e1624] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wide">
                    <Radio className="w-4 h-4" />
                    <span>Tactical Vibration Haptics</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Subtle tactile feedback for button clicks, set completion, rest timer alerts, and navigation taps using Android's hardware vibration engine.
                  </p>
                </div>

                {/* 3. Back Button Intercept */}
                <div className="p-4 rounded-xl bg-[#0e1624] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wide">
                    <Smartphone className="w-4 h-4" />
                    <span>Hardware Back Button Support</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Android edge-swipe gestures and hardware back buttons smoothly close open sheets, questionnaires, and modals instead of closing the app.
                  </p>
                </div>

                {/* 4. Offline First Storage */}
                <div className="p-4 rounded-xl bg-[#0e1624] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                    <HardDrive className="w-4 h-4" />
                    <span>Offline Tactical Cache</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Programs, calculators, warm-ups, and logs are cached offline with Service Workers so you can train in basement gyms or remote patrol areas.
                  </p>
                </div>
              </div>

              {/* Adaptive Maskable Icons */}
              <div className="p-4 rounded-xl bg-[#0e1624] border border-slate-800 flex items-center gap-4">
                <img 
                  src="/pwa-maskable-512x512.png" 
                  alt="Maskable Android Icon" 
                  className="w-14 h-14 rounded-2xl border border-slate-700 shadow-md bg-[#0A0E17] shrink-0" 
                />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Android Adaptive Icon (Maskable Safe Zone)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Engineered with 80% safe-zone margin conforming to Android 14+ squircle, teardrop, and circle adaptive icon masks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APK & PLAY STORE FILES */}
          {activeTab === 'apk_twa' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                This project includes production-ready configuration files in the <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">android/</code> directory to compile an official Android <strong>.apk</strong> or Google Play <strong>.aab</strong> bundle using Google's Bubblewrap CLI:
              </p>

              {/* Build Command Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    1-Command APK Build (Terminal):
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bubblewrapSnippet, 'bubblewrap')}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'bubblewrap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'bubblewrap' ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#070b12] border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  {bubblewrapSnippet}
                </pre>
              </div>

              {/* TWA Manifest snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
                    android/twa-manifest.json:
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(twaManifestSnippet, 'twa')}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'twa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'twa' ? 'Copied!' : 'Copy Config'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#070b12] border border-slate-800 rounded-xl text-[10px] font-mono text-slate-400 overflow-x-auto max-h-40 leading-relaxed">
                  {twaManifestSnippet}
                </pre>
              </div>

              {/* Digital Asset Links */}
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Screen Without URL Bar:</strong> Digital Asset Links is configured at <code className="text-blue-300">/.well-known/assetlinks.json</code> to verify domain ownership and hide browser chrome automatically when running as an Android app.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#080d16] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PatrolReadyCompanyEmblem size="xs" />
            <span className="text-xs text-slate-400 font-athletic uppercase">
              Patrol Ready Tactical Systems
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              tap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
