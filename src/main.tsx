import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerSW} from 'virtual:pwa-register';

// Register PWA Service Worker for offline capability & automatic background updates
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[Overland PWA] New update available.');
  },
  onOfflineReady() {
    console.log('[Overland PWA] App is cached and ready for offline use.');
  },
  onRegisteredSW(swScriptUrl, registration) {
    console.log('[Overland PWA] Service worker active:', swScriptUrl, registration);
  },
  onRegisterError(error) {
    console.warn('[Overland PWA] Service worker registration error, attempting direct /sw.js:', error);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[Overland PWA] Direct /sw.js fallback registration error:', err);
      });
    }
  },
});

// Direct service worker fallback guarantee for standard browser PWA install checks
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('[Overland PWA] Standalone registration fallback note:', err);
        });
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

