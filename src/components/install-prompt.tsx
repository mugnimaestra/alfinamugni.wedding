/**
 * PWA Install Prompt Component
 * Custom installation prompt with Indonesian wedding context
 */

import { component$, useSignal, useVisibleTask$, useStore, $ } from '@builder.io/qwik';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface InstallPromptState {
  isVisible: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  showBenefits: boolean;
  dismissedPermanently: boolean;
  lastShown: number;
  interactionCount: number;
}

export const InstallPrompt = component$(() => {
  const deferredPrompt = useSignal<BeforeInstallPromptEvent | null>(null);
  const installState = useStore<InstallPromptState>({
    isVisible: false,
    canInstall: false,
    isInstalled: false,
    showBenefits: false,
    dismissedPermanently: false,
    lastShown: 0,
    interactionCount: 0,
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    // Load stored preferences
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem('wedding-pwa-install-prefs');
        if (stored) {
          const prefs = JSON.parse(stored);
          installState.dismissedPermanently = prefs.dismissedPermanently || false;
          installState.lastShown = prefs.lastShown || 0;
          installState.interactionCount = prefs.interactionCount || 0;
        }
      } catch (error) {
        console.warn('[InstallPrompt] Failed to load preferences:', error);
      }
    };

    // Check if already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (already installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSInstalled = (navigator as NavigatorWithStandalone).standalone === true;

      installState.isInstalled = isStandalone || isIOSInstalled;
    };

    // Show prompt with conditions
    const maybeShowPrompt = () => {
      if (installState.isInstalled || installState.dismissedPermanently) {
        return;
      }

      // Don't show too frequently
      const now = Date.now();
      const daysSinceLastShown = (now - installState.lastShown) / (1000 * 60 * 60 * 24);

      if (daysSinceLastShown < 3) {
        return;
      }

      // Show after user has engaged with the site
      if (installState.interactionCount >= 3) {
        installState.isVisible = true;
        installState.lastShown = now;
        savePreferences();
      }
    };

    const savePreferences = () => {
      try {
        const prefs = {
          dismissedPermanently: installState.dismissedPermanently,
          lastShown: installState.lastShown,
          interactionCount: installState.interactionCount,
        };
        localStorage.setItem('wedding-pwa-install-prefs', JSON.stringify(prefs));
      } catch (error) {
        console.warn('[InstallPrompt] Failed to save preferences:', error);
      }
    };

    // Track user interactions
    const trackInteraction = () => {
      installState.interactionCount++;
      if (installState.interactionCount === 3) {
        // Wait a bit before showing to avoid interrupting user flow
        setTimeout(maybeShowPrompt, 2000);
      }
      savePreferences();
    };

    // Event listeners
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.value = e as BeforeInstallPromptEvent;
      installState.canInstall = true;
    };

    const handleAppInstalled = () => {
      installState.isInstalled = true;
      installState.isVisible = false;
      deferredPrompt.value = null;
      console.log('[InstallPrompt] PWA was installed');
    };

    // Initialize
    loadPreferences();
    checkIfInstalled();

    // Set up event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Track basic interactions
    document.addEventListener('click', trackInteraction, { passive: true });
    document.addEventListener('scroll', trackInteraction, { passive: true });

    cleanup(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('scroll', trackInteraction);
    });
  });

  const handleInstall = $(async () => {
    if (!deferredPrompt.value) return;

    try {
      await deferredPrompt.value.prompt();
      const choiceResult = await deferredPrompt.value.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('[InstallPrompt] User accepted the install prompt');
        installState.isVisible = false;
      } else {
        console.log('[InstallPrompt] User dismissed the install prompt');
        // Don't show again for a while
        installState.lastShown = Date.now();
        installState.isVisible = false;
      }

      deferredPrompt.value = null;
    } catch (error) {
      console.error('[InstallPrompt] Error during installation:', error);
    }
  });

  const handleDismiss = $(() => {
    installState.isVisible = false;
    installState.lastShown = Date.now();

    // Save dismissal
    try {
      const prefs = {
        dismissedPermanently: installState.dismissedPermanently,
        lastShown: installState.lastShown,
        interactionCount: installState.interactionCount,
      };
      localStorage.setItem('wedding-pwa-install-prefs', JSON.stringify(prefs));
    } catch (error) {
      console.warn('[InstallPrompt] Failed to save dismissal:', error);
    }
  });

  const handleDismissPermanently = $(() => {
    installState.dismissedPermanently = true;
    installState.isVisible = false;

    try {
      const prefs = {
        dismissedPermanently: true,
        lastShown: Date.now(),
        interactionCount: installState.interactionCount,
      };
      localStorage.setItem('wedding-pwa-install-prefs', JSON.stringify(prefs));
    } catch (error) {
      console.warn('[InstallPrompt] Failed to save permanent dismissal:', error);
    }
  });

  const toggleBenefits = $(() => {
    installState.showBenefits = !installState.showBenefits;
  });

  if (!installState.isVisible || installState.isInstalled) {
    return null;
  }

  return (
    <div class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div class="bg-gradient-to-r from-wedding-brown to-wedding-accent text-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div class="p-4 pb-3">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span class="text-2xl">💒</span>
              </div>
              <div>
                <h3 class="font-semibold text-lg">Alfina & Mugni</h3>
                <p class="text-white/80 text-sm">Wedding App</p>
              </div>
            </div>
            <button
              onClick$={handleDismiss}
              class="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          <p class="text-white/90 text-sm mb-3">
            Instal aplikasi pernikahan kami untuk akses cepat dan mudah ke semua informasi wedding!
          </p>

          {/* Benefits toggle */}
          <button
            onClick$={toggleBenefits}
            class="text-white/80 text-xs underline mb-3 hover:text-white transition-colors"
          >
            {installState.showBenefits ? 'Sembunyikan' : 'Lihat'} keuntungan instalasi →
          </button>

          {/* Benefits list */}
          {installState.showBenefits && (
            <div class="bg-white/10 rounded-lg p-3 mb-3 text-sm">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs">📱</span>
                  <span class="text-white/90">Akses langsung dari layar utama</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs">⚡</span>
                  <span class="text-white/90">Loading lebih cepat dan hemat data</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs">📤</span>
                  <span class="text-white/90">RSVP tetap tersimpan saat offline</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs">📷</span>
                  <span class="text-white/90">Upload foto langsung dari kamera</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs">🔔</span>
                  <span class="text-white/90">Notifikasi update acara pernikahan</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div class="px-4 pb-4">
          <div class="space-y-2">
            <button
              onClick$={handleInstall}
              disabled={!installState.canInstall}
              class="w-full bg-white text-wedding-brown font-semibold py-3 px-4 rounded-lg
                     hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {installState.canInstall ? '📱 Pasang Aplikasi' : '📱 Siap untuk Dipasang'}
            </button>

            <div class="flex gap-2">
              <button
                onClick$={handleDismiss}
                class="flex-1 bg-white/20 text-white py-2 px-3 rounded-lg text-sm
                       hover:bg-white/30 transition-colors"
              >
                Nanti saja
              </button>
              <button
                onClick$={handleDismissPermanently}
                class="flex-1 bg-white/10 text-white/80 py-2 px-3 rounded-lg text-sm
                       hover:bg-white/20 hover:text-white transition-colors"
              >
                Jangan tampilkan lagi
              </button>
            </div>
          </div>
        </div>

        {/* Indonesian context note */}
        <div class="bg-black/20 px-4 py-2 text-xs text-white/70 text-center">
          💝 Khusus untuk tamu undangan Alfina & Mugni - 29 November 2025, Jakarta
        </div>
      </div>
    </div>
  );
});

export default InstallPrompt;