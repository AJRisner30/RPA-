import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Helper to accurately detect if running standalone / installed
  const checkIsInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;

    // 1. Display mode standalone / fullscreen / minimal-ui / window-controls-overlay
    try {
      const isStandaloneDisplay =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches;
      if (isStandaloneDisplay) return true;
    } catch {}

    // 2. iOS Safari standalone boolean
    if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
      return true;
    }

    // 3. Android Trusted Web Activity / Native App referrers
    if (document.referrer && (document.referrer.startsWith('android-app://') || document.referrer.includes('installed'))) {
      return true;
    }

    // 4. Stored record of successful installation on this origin
    try {
      if (localStorage.getItem('pwa_installed') === 'true' || sessionStorage.getItem('pwa_installed') === 'true') {
        return true;
      }
    } catch {}

    // 5. Query parameter indicators (e.g., launched from home screen / shortcut)
    try {
      const search = window.location.search || '';
      if (search.includes('source=pwa') || search.includes('installed=true') || search.includes('mode=standalone')) {
        try {
          localStorage.setItem('pwa_installed', 'true');
        } catch {}
        return true;
      }
    } catch {}

    return false;
  };

  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsInstalled());
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Re-verify current installed status
    const currentInstalled = checkIsInstalled();
    if (currentInstalled) {
      setIsInstalled(true);
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Watch for standalone display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        try {
          localStorage.setItem('pwa_installed', 'true');
        } catch {}
      }
    };
    mediaQuery.addEventListener?.('change', handleMediaChange);

    // Handle beforeinstallprompt event (Chromium / Edge / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // If already marked installed, ignore prompt
      if (checkIsInstalled()) {
        setIsInstalled(true);
        return;
      }
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Handle appinstalled event fired by browser once installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('pwa_installed', 'true');
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener?.('change', handleMediaChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        try {
          localStorage.setItem('pwa_installed', 'true');
        } catch {}
        return true;
      }
    } catch (err) {
      console.warn('[PWA Install] Prompt error:', err);
    }
    return false;
  };

  const markAsInstalled = () => {
    setIsInstalled(true);
    setDeferredPrompt(null);
    try {
      localStorage.setItem('pwa_installed', 'true');
      sessionStorage.setItem('pwa_installed', 'true');
    } catch {}
  };

  return {
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOS,
    install,
    markAsInstalled,
  };
}
