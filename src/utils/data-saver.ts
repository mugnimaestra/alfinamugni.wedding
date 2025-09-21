/**
 * Data Saver Mode Implementation
 * Optimized for Indonesian mobile data plans and network conditions
 */

import { getNetworkInfo, type NetworkInfo } from './network-utils';

export interface DataSaverSettings {
  enabled: boolean;
  level: 'light' | 'medium' | 'aggressive';
  autoEnable: boolean;
  thresholds: {
    lowBattery: number; // Battery percentage threshold
    slowNetwork: number; // Network speed threshold (Mbps)
    highLatency: number; // RTT threshold (ms)
  };
  limits: {
    imageQuality: number; // 0-1
    maxImageWidth: number;
    maxVideoQuality: string;
    prefetchDisabled: boolean;
    animationsReduced: boolean;
  };
}

export interface DataUsageStats {
  sessionStart: number;
  totalBytes: number;
  imageBytes: number;
  videoBytes: number;
  apiBytes: number;
  estimatedCost: number; // in Indonesian Rupiah
  carrierPlan: IndonesianDataPlan;
}

export interface IndonesianDataPlan {
  name: string;
  costPerMB: number; // Rupiah per MB
  dailyLimit?: number; // MB per day
  monthlyLimit?: number; // MB per month
  carrier: string;
  type: 'prepaid' | 'postpaid';
}

// Indonesian mobile data plans database
const INDONESIAN_DATA_PLANS: Record<string, IndonesianDataPlan[]> = {
  telkomsel: [
    { name: 'SimPATI Freedom U', costPerMB: 83, dailyLimit: 100, carrier: 'Telkomsel', type: 'prepaid' },
    { name: 'Kartu Halo Hybrid', costPerMB: 50, monthlyLimit: 5000, carrier: 'Telkomsel', type: 'postpaid' },
    { name: 'SimPATI Yellow', costPerMB: 100, dailyLimit: 50, carrier: 'Telkomsel', type: 'prepaid' },
  ],
  indosat: [
    { name: 'IM3 Freedom Internet', costPerMB: 75, dailyLimit: 150, carrier: 'Indosat', type: 'prepaid' },
    { name: 'Matrix Auto', costPerMB: 60, monthlyLimit: 3000, carrier: 'Indosat', type: 'postpaid' },
  ],
  xl: [
    { name: 'XL Hotrod', costPerMB: 70, dailyLimit: 200, carrier: 'XL', type: 'prepaid' },
    { name: 'XL Postpaid', costPerMB: 45, monthlyLimit: 8000, carrier: 'XL', type: 'postpaid' },
  ],
  tri: [
    { name: 'Tri Always On', costPerMB: 65, dailyLimit: 100, carrier: 'Tri', type: 'prepaid' },
    { name: 'Tri Internet+', costPerMB: 55, monthlyLimit: 2000, carrier: 'Tri', type: 'postpaid' },
  ],
  smartfren: [
    { name: 'Unlimited Nonstop', costPerMB: 80, dailyLimit: 75, carrier: 'Smartfren', type: 'prepaid' },
  ],
};

export class DataSaverManager {
  private settings: DataSaverSettings;
  private usageStats: DataUsageStats;
  private networkInfo: NetworkInfo | null = null;
  private observers: ((settings: DataSaverSettings) => void)[] = [];

  constructor() {
    this.settings = this.loadSettings();
    this.usageStats = this.loadUsageStats();
    this.init();
  }

  private loadSettings(): DataSaverSettings {
    const defaultSettings: DataSaverSettings = {
      enabled: false,
      level: 'medium',
      autoEnable: true,
      thresholds: {
        lowBattery: 20,
        slowNetwork: 5, // 5 Mbps
        highLatency: 200, // 200ms
      },
      limits: {
        imageQuality: 0.6,
        maxImageWidth: 800,
        maxVideoQuality: '480p',
        prefetchDisabled: true,
        animationsReduced: true,
      },
    };

    try {
      const stored = localStorage.getItem('wedding-data-saver-settings');
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('[DataSaver] Failed to load settings:', error);
    }

    return defaultSettings;
  }

  private loadUsageStats(): DataUsageStats {
    const today = new Date().toDateString();
    const defaultStats: DataUsageStats = {
      sessionStart: Date.now(),
      totalBytes: 0,
      imageBytes: 0,
      videoBytes: 0,
      apiBytes: 0,
      estimatedCost: 0,
      carrierPlan: INDONESIAN_DATA_PLANS.telkomsel[0], // Default plan
    };

    try {
      const stored = localStorage.getItem('wedding-data-usage-stats');
      if (stored) {
        const stats = JSON.parse(stored);
        const statsDate = new Date(stats.sessionStart).toDateString();

        // Reset stats if it's a new day
        if (statsDate === today) {
          return { ...defaultStats, ...stats };
        }
      }
    } catch (error) {
      console.warn('[DataSaver] Failed to load usage stats:', error);
    }

    return defaultStats;
  }

  private async init(): Promise<void> {
    // Get current network info
    this.networkInfo = await getNetworkInfo();

    // Detect carrier plan
    if (this.networkInfo.carrier) {
      const plans = INDONESIAN_DATA_PLANS[this.networkInfo.carrier.code.toLowerCase()];
      if (plans && plans.length > 0) {
        // Use postpaid plan if available, otherwise first plan
        const plan = plans.find(p => p.type === 'postpaid') || plans[0];
        this.usageStats.carrierPlan = plan;
      }
    }

    // Auto-enable data saver if conditions are met
    if (this.settings.autoEnable) {
      this.checkAutoEnable();
    }

    // Set up network monitoring
    this.monitorNetwork();

    // Save initial state
    this.saveSettings();
    this.saveUsageStats();
  }

  private async checkAutoEnable(): Promise<void> {
    if (!this.networkInfo) return;

    const shouldEnable =
      // Slow network
      (this.networkInfo.downlink && this.networkInfo.downlink < this.settings.thresholds.slowNetwork) ||
      // High latency
      (this.networkInfo.rtt && this.networkInfo.rtt > this.settings.thresholds.highLatency) ||
      // Save data mode enabled
      this.networkInfo.saveData ||
      // Low battery
      (this.networkInfo.batteryLevel && this.networkInfo.batteryLevel < this.settings.thresholds.lowBattery) ||
      // Peak hours with fair/poor coverage
      (this.networkInfo.timeOfDay === 'peak' &&
       this.networkInfo.carrier &&
       ['fair', 'poor'].includes(this.networkInfo.carrier.coverage));

    if (shouldEnable && !this.settings.enabled) {
      this.enableDataSaver('medium');
      console.log('[DataSaver] Auto-enabled due to network conditions');
    }
  }

  private monitorNetwork(): void {
    // Monitor network changes
    const handleNetworkChange = async () => {
      this.networkInfo = await getNetworkInfo();
      if (this.settings.autoEnable) {
        this.checkAutoEnable();
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleNetworkChange);
    }

    // Monitor battery changes
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          if (this.settings.autoEnable && battery.level * 100 < this.settings.thresholds.lowBattery) {
            this.enableDataSaver('aggressive');
          }
        });
      });
    }
  }

  enableDataSaver(level: 'light' | 'medium' | 'aggressive' = 'medium'): void {
    this.settings.enabled = true;
    this.settings.level = level;

    // Update limits based on level
    switch (level) {
      case 'light':
        this.settings.limits = {
          imageQuality: 0.7,
          maxImageWidth: 1200,
          maxVideoQuality: '720p',
          prefetchDisabled: false,
          animationsReduced: false,
        };
        break;

      case 'medium':
        this.settings.limits = {
          imageQuality: 0.5,
          maxImageWidth: 800,
          maxVideoQuality: '480p',
          prefetchDisabled: true,
          animationsReduced: true,
        };
        break;

      case 'aggressive':
        this.settings.limits = {
          imageQuality: 0.3,
          maxImageWidth: 600,
          maxVideoQuality: '360p',
          prefetchDisabled: true,
          animationsReduced: true,
        };
        break;
    }

    this.saveSettings();
    this.notifyObservers();

    console.log(`[DataSaver] Enabled with ${level} level`);
  }

  disableDataSaver(): void {
    this.settings.enabled = false;
    this.saveSettings();
    this.notifyObservers();

    console.log('[DataSaver] Disabled');
  }

  trackDataUsage(bytes: number, type: 'image' | 'video' | 'api' = 'api'): void {
    this.usageStats.totalBytes += bytes;

    switch (type) {
      case 'image':
        this.usageStats.imageBytes += bytes;
        break;
      case 'video':
        this.usageStats.videoBytes += bytes;
        break;
      case 'api':
        this.usageStats.apiBytes += bytes;
        break;
    }

    // Calculate estimated cost
    const megabytes = bytes / (1024 * 1024);
    this.usageStats.estimatedCost += megabytes * this.usageStats.carrierPlan.costPerMB;

    this.saveUsageStats();

    // Check if approaching data limits
    this.checkDataLimits();
  }

  private checkDataLimits(): void {
    const totalMB = this.usageStats.totalBytes / (1024 * 1024);
    const plan = this.usageStats.carrierPlan;

    let warningThreshold = 0;
    let limitMB = 0;

    if (plan.dailyLimit) {
      limitMB = plan.dailyLimit;
      warningThreshold = limitMB * 0.8; // 80% of daily limit
    } else if (plan.monthlyLimit) {
      limitMB = plan.monthlyLimit;
      warningThreshold = limitMB * 0.8; // 80% of monthly limit
    }

    if (limitMB > 0 && totalMB > warningThreshold) {
      if (!this.settings.enabled) {
        this.enableDataSaver('aggressive');
        console.warn('[DataSaver] Auto-enabled due to data limit approach');
      } else if (this.settings.level !== 'aggressive') {
        this.enableDataSaver('aggressive');
        console.warn('[DataSaver] Switched to aggressive mode due to data usage');
      }
    }
  }

  getImageQuality(): number {
    if (!this.settings.enabled) return 0.8;
    return this.settings.limits.imageQuality;
  }

  getMaxImageWidth(): number {
    if (!this.settings.enabled) return 1920;
    return this.settings.limits.maxImageWidth;
  }

  shouldPrefetch(): boolean {
    if (!this.settings.enabled) return true;
    return !this.settings.limits.prefetchDisabled;
  }

  shouldUseAnimations(): boolean {
    if (!this.settings.enabled) return true;
    return !this.settings.limits.animationsReduced;
  }

  getUsageStats(): DataUsageStats {
    return { ...this.usageStats };
  }

  getSettings(): DataSaverSettings {
    return { ...this.settings };
  }

  estimateDailyCost(): number {
    const now = Date.now();
    const sessionDuration = now - this.usageStats.sessionStart;
    const dailyDuration = 24 * 60 * 60 * 1000; // 24 hours in ms

    if (sessionDuration === 0) return 0;

    const dailyUsageEstimate = (this.usageStats.totalBytes / sessionDuration) * dailyDuration;
    const dailyMB = dailyUsageEstimate / (1024 * 1024);

    return dailyMB * this.usageStats.carrierPlan.costPerMB;
  }

  getDataSaverRecommendation(): { level: 'light' | 'medium' | 'aggressive' | 'none'; reason: string } {
    if (!this.networkInfo) {
      return { level: 'none', reason: 'Network information not available' };
    }

    const reasons: string[] = [];

    // Check network conditions
    if (this.networkInfo.effectiveType === '2g' || this.networkInfo.effectiveType === 'slow-2g') {
      reasons.push('Jaringan 2G sangat lambat');
      return { level: 'aggressive', reason: reasons.join(', ') };
    }

    if (this.networkInfo.saveData) {
      reasons.push('Mode hemat data aktif');
      return { level: 'medium', reason: reasons.join(', ') };
    }

    if (this.networkInfo.downlink && this.networkInfo.downlink < 5) {
      reasons.push('Kecepatan internet lambat');
    }

    if (this.networkInfo.rtt && this.networkInfo.rtt > 200) {
      reasons.push('Latensi tinggi');
    }

    if (this.networkInfo.batteryLevel && this.networkInfo.batteryLevel < 20) {
      reasons.push('Baterai rendah');
    }

    if (this.networkInfo.timeOfDay === 'peak') {
      reasons.push('Jam sibuk jaringan');
    }

    if (this.networkInfo.carrier && this.networkInfo.carrier.coverage === 'poor') {
      reasons.push('Sinyal lemah');
    }

    const dailyCost = this.estimateDailyCost();
    if (dailyCost > 10000) { // 10,000 Rupiah per day
      reasons.push('Estimasi biaya tinggi');
    }

    if (reasons.length >= 3) {
      return { level: 'aggressive', reason: reasons.join(', ') };
    } else if (reasons.length >= 2) {
      return { level: 'medium', reason: reasons.join(', ') };
    } else if (reasons.length >= 1) {
      return { level: 'light', reason: reasons.join(', ') };
    }

    return { level: 'none', reason: 'Kondisi jaringan baik' };
  }

  subscribe(callback: (settings: DataSaverSettings) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.settings));
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('wedding-data-saver-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('[DataSaver] Failed to save settings:', error);
    }
  }

  private saveUsageStats(): void {
    try {
      localStorage.setItem('wedding-data-usage-stats', JSON.stringify(this.usageStats));
    } catch (error) {
      console.warn('[DataSaver] Failed to save usage stats:', error);
    }
  }

  // Reset daily stats
  resetDailyStats(): void {
    this.usageStats = {
      sessionStart: Date.now(),
      totalBytes: 0,
      imageBytes: 0,
      videoBytes: 0,
      apiBytes: 0,
      estimatedCost: 0,
      carrierPlan: this.usageStats.carrierPlan,
    };
    this.saveUsageStats();
  }
}

// Global instance
let dataSaverManager: DataSaverManager;

export function getDataSaverManager(): DataSaverManager {
  if (!dataSaverManager) {
    dataSaverManager = new DataSaverManager();
  }
  return dataSaverManager;
}

// Utility functions for easy access
export function isDataSaverEnabled(): boolean {
  return getDataSaverManager().getSettings().enabled;
}

export function getImageQuality(): number {
  return getDataSaverManager().getImageQuality();
}

export function getMaxImageWidth(): number {
  return getDataSaverManager().getMaxImageWidth();
}

export function shouldPrefetch(): boolean {
  return getDataSaverManager().shouldPrefetch();
}

export function shouldUseAnimations(): boolean {
  return getDataSaverManager().shouldUseAnimations();
}

export function trackDataUsage(bytes: number, type: 'image' | 'video' | 'api' = 'api'): void {
  getDataSaverManager().trackDataUsage(bytes, type);
}

export function enableDataSaver(level?: 'light' | 'medium' | 'aggressive'): void {
  getDataSaverManager().enableDataSaver(level);
}

export function disableDataSaver(): void {
  getDataSaverManager().disableDataSaver();
}

export function getDataSaverRecommendation() {
  return getDataSaverManager().getDataSaverRecommendation();
}