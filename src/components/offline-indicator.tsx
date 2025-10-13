/**
 * Offline Indicator Component
 * Network status display with Indonesian messages and queue management
 */

import { component$, useSignal, useVisibleTask$, useStore } from '@builder.io/qwik';
import { getOfflineQueueStats } from '../sw-plugins/offline-queue';
import { type NetworkConnectionAPI } from '../utils/network-utils';

interface NetworkStatus {
  isOnline: boolean;
  effectiveType: string;
  downlink: number;
  saveData: boolean;
  carrier: string;
}

interface QueueStatus {
  count: number;
  oldestTimestamp: number | null;
}

export const OfflineIndicator = component$(() => {
  const networkStatus = useStore<NetworkStatus>({
    isOnline: true,
    effectiveType: '4g',
    downlink: 26.1,
    saveData: false,
    carrier: 'unknown',
  });

  const queueStatus = useStore<QueueStatus>({
    count: 0,
    oldestTimestamp: null,
  });

  const isVisible = useSignal(false);
  const lastUpdateTime = useSignal(Date.now());

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const updateNetworkStatus = () => {
      networkStatus.isOnline = navigator.onLine;

      let connection: NetworkConnectionAPI['connection'] | null = null;
      if ('connection' in navigator) {
        connection = (navigator as NetworkConnectionAPI).connection;
        networkStatus.effectiveType = connection?.effectiveType || '4g';
        networkStatus.downlink = connection?.downlink || 26.1;
        networkStatus.saveData = connection?.saveData || false;
      }

      // Detect Indonesian carrier (heuristic)
      networkStatus.carrier = detectIndonesianCarrier(networkStatus.downlink,
        connection && 'rtt' in connection && connection.rtt !== undefined ? connection.rtt : 50);

      lastUpdateTime.value = Date.now();

      // Show indicator when offline or on slow connection
      isVisible.value = !networkStatus.isOnline ||
        networkStatus.effectiveType === '2g' ||
        networkStatus.effectiveType === 'slow-2g' ||
        networkStatus.saveData;
    };

    const updateQueueStatus = async () => {
      try {
        const status = await getOfflineQueueStats();
        queueStatus.count = status.totalItems;
        queueStatus.oldestTimestamp = status.oldestItem ? status.oldestItem.getTime() : null;
      } catch (error) {
        console.warn('[OfflineIndicator] Failed to get queue status:', error);
      }
    };

    // Initial status update
    updateNetworkStatus();
    updateQueueStatus();

    // Network event listeners
    const handleOnline = () => {
      updateNetworkStatus();
      updateQueueStatus();
    };

    const handleOffline = () => {
      updateNetworkStatus();
    };

    // Connection change listener (if available)
    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes on supported browsers
    if ('connection' in navigator) {
      const conn = (navigator as NetworkConnectionAPI).connection;
      conn?.addEventListener('change', handleConnectionChange);
    }

    // Update queue status periodically
    const queueInterval = setInterval(updateQueueStatus, 10000); // Every 10 seconds

    cleanup(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if ('connection' in navigator) {
        const conn = (navigator as NetworkConnectionAPI).connection;
        conn?.removeEventListener?.('change', handleConnectionChange);
      }

      clearInterval(queueInterval);
    });
  });

  const detectIndonesianCarrier = (downlink: number, rtt: number): string => {
    if (downlink > 20 && rtt < 50) return 'telkomsel';
    if (downlink > 15 && rtt < 80) return 'xl-axiata';
    if (downlink > 10 && rtt < 100) return 'indosat';
    if (downlink > 5) return 'tri-3';
    return 'unknown';
  };

  const getNetworkIcon = () => {
    if (!networkStatus.isOnline) return '📵';

    switch (networkStatus.effectiveType) {
      case 'slow-2g':
      case '2g':
        return '📶';
      case '3g':
        return '📶📶';
      case '4g':
        return '📶📶📶';
      default:
        return '📶';
    }
  };

  const getStatusMessage = () => {
    if (!networkStatus.isOnline) {
      return queueStatus.count > 0
        ? `Offline - ${queueStatus.count} pesan dalam antrian`
        : 'Offline - Data akan tersimpan untuk dikirim nanti';
    }

    if (networkStatus.saveData) {
      return 'Mode hemat data aktif - Kualitas gambar dikurangi';
    }

    if (networkStatus.effectiveType === '2g' || networkStatus.effectiveType === 'slow-2g') {
      return 'Koneksi lambat - Mengoptimalkan untuk jaringan 2G';
    }

    if (networkStatus.effectiveType === '3g') {
      return 'Koneksi 3G - Mengkompresi gambar untuk performa optimal';
    }

    if (queueStatus.count > 0) {
      return `Online - Mengirim ${queueStatus.count} pesan tertunda`;
    }

    return '';
  };

  const getCarrierDisplayName = (carrier: string): string => {
    switch (carrier) {
      case 'telkomsel':
        return 'Telkomsel';
      case 'xl-axiata':
        return 'XL Axiata';
      case 'indosat':
        return 'Indosat Ooredoo';
      case 'tri-3':
        return 'Tri (3)';
      default:
        return 'Operator tidak dikenal';
    }
  };

  const getTimeSinceUpdate = (): string => {
    const diff = Date.now() - lastUpdateTime.value;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds} detik lalu`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;

    const hours = Math.floor(minutes / 60);
    return `${hours} jam lalu`;
  };

  const getQueueAge = (): string => {
    if (!queueStatus.oldestTimestamp) return '';

    const diff = Date.now() - queueStatus.oldestTimestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `sejak ${minutes} menit lalu`;

    const hours = Math.floor(minutes / 60);
    return `sejak ${hours} jam lalu`;
  };

  if (!isVisible.value && queueStatus.count === 0) {
    return null;
  }

  return (
    <div class={`
      fixed top-16 left-4 right-4 z-50 mx-auto max-w-sm
      bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg
      transition-all duration-300 ease-in-out
      ${isVisible.value ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-90'}
    `}>
      <div class="p-3">
        {/* Network Status Header */}
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">{getNetworkIcon()}</span>
            <span class={`
              text-sm font-medium
              ${networkStatus.isOnline ? 'text-green-600' : 'text-red-600'}
            `}>
              {networkStatus.isOnline ? 'Terhubung' : 'Offline'}
            </span>
          </div>

          <div class="text-xs text-gray-500">
            {getTimeSinceUpdate()}
          </div>
        </div>

        {/* Status Message */}
        {getStatusMessage() && (
          <div class="text-sm text-gray-700 mb-2">
            {getStatusMessage()}
          </div>
        )}

        {/* Network Details */}
        {networkStatus.isOnline && (
          <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div class="flex justify-between">
              <span>Kecepatan:</span>
              <span>{networkStatus.downlink.toFixed(1)} Mbps</span>
            </div>
            <div class="flex justify-between">
              <span>Jaringan:</span>
              <span class="uppercase">{networkStatus.effectiveType}</span>
            </div>
            <div class="flex justify-between">
              <span>Operator:</span>
              <span>{getCarrierDisplayName(networkStatus.carrier)}</span>
            </div>
            {networkStatus.saveData && (
              <div class="flex justify-between">
                <span>Mode:</span>
                <span>Hemat Data</span>
              </div>
            )}
          </div>
        )}

        {/* Queue Information */}
        {queueStatus.count > 0 && (
          <div class="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-blue-600">📤</span>
                <span class="text-sm font-medium text-blue-700">
                  {queueStatus.count} dalam antrian
                </span>
              </div>
              {queueStatus.oldestTimestamp && (
                <span class="text-xs text-blue-600">
                  {getQueueAge()}
                </span>
              )}
            </div>
            <div class="text-xs text-blue-600 mt-1">
              {networkStatus.isOnline ?
                'Sedang mengirim...' :
                'Akan dikirim saat terhubung'
              }
            </div>
          </div>
        )}

        {/* Indonesian Cultural Context */}
        {!networkStatus.isOnline && (
          <div class="mt-3 text-xs text-gray-600 italic border-t pt-2">
            💝 RSVP dan pesan Anda akan tersimpan dengan aman dan dikirim
            saat koneksi kembali tersambung
          </div>
        )}
      </div>
    </div>
  );
});

export default OfflineIndicator;