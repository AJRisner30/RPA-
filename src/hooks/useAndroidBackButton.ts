import { useEffect, useRef } from 'react';

/**
 * Android Hardware & Gesture Back Button Hook
 * Integrates with HTML5 History API to provide native Android back-navigation.
 * Instead of accidentally exiting or breaking the app when the officer swipes back on Android,
 * this hook closes open modals or returns to the primary Workouts tab.
 */
export function useAndroidBackButton({
  hasOpenModal = false,
  onCloseModal,
  activeTab = 'workouts',
  onSelectTab,
}: {
  hasOpenModal?: boolean;
  onCloseModal?: () => void;
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
}) {
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    // If a modal opens or tab changes from workouts, push a state to history so back button intercepts
    const shouldPushState = hasOpenModal || activeTab !== 'workouts';

    if (shouldPushState && !isNavigatingRef.current) {
      window.history.pushState({ patrolReadyState: true }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      isNavigatingRef.current = true;

      if (hasOpenModal && onCloseModal) {
        onCloseModal();
      } else if (activeTab !== 'workouts' && onSelectTab) {
        onSelectTab('workouts');
      }

      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasOpenModal, onCloseModal, activeTab, onSelectTab]);
}
