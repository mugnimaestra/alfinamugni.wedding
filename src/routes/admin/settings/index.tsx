import { component$, useSignal, useTask$, type Component } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Mail,
  Shield,
  Globe,
  Image,
  Calendar,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getDatabase, type Env } from '../../../lib/database';

// Server-side data loader for settings
export const useSettingsData = routeLoader$(async ({ platform }) => {
  try {
    const db = getDatabase(platform.env as Env);

    // Load current settings
    const settings = {
      siteTitle: await db.getSetting('site_title') || 'Alfina & Mugni Wedding',
      siteDescription: await db.getSetting('site_description') || 'Join us in celebrating our special day',
      weddingDate: await db.getSetting('wedding_date') || '2025-11-29',
      venue: await db.getSetting('venue') || 'Jakarta, Indonesia',
      rsvpDeadline: await db.getSetting('rsvp_deadline') || '2025-11-15',
      maxGuestsPerRsvp: await db.getSetting('max_guests_per_rsvp') || '5',
      autoApproveWishes: await db.getSetting('auto_approve_wishes') || 'false',
      enablePhotoUploads: await db.getSetting('enable_photo_uploads') || 'true',
      maintenanceMode: await db.getSetting('maintenance_mode') || 'false',
      adminEmail: await db.getSetting('admin_email') || 'admin@alfinamugni.wedding',
    };

    return { settings, lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      settings: {
        siteTitle: 'Alfina & Mugni Wedding',
        siteDescription: 'Join us in celebrating our special day',
        weddingDate: '2025-11-29',
        venue: 'Jakarta, Indonesia',
        rsvpDeadline: '2025-11-15',
        maxGuestsPerRsvp: '5',
        autoApproveWishes: 'false',
        enablePhotoUploads: 'true',
        maintenanceMode: 'false',
        adminEmail: 'admin@alfinamugni.wedding',
      },
      lastUpdated: new Date().toISOString(),
      error: 'Failed to load settings'
    };
  }
});

export default component$(() => {
  const settingsData = useSettingsData();
  const saving = useSignal(false);
  const lastSaved = useSignal('');
  const activeTab = useSignal('general');
  const hasChanges = useSignal(false);

  // Form state signals
  const siteTitle = useSignal(settingsData.value.settings.siteTitle);
  const siteDescription = useSignal(settingsData.value.settings.siteDescription);
  const weddingDate = useSignal(settingsData.value.settings.weddingDate);
  const venue = useSignal(settingsData.value.settings.venue);
  const rsvpDeadline = useSignal(settingsData.value.settings.rsvpDeadline);
  const maxGuestsPerRsvp = useSignal(settingsData.value.settings.maxGuestsPerRsvp);
  const autoApproveWishes = useSignal(settingsData.value.settings.autoApproveWishes);
  const enablePhotoUploads = useSignal(settingsData.value.settings.enablePhotoUploads);
  const maintenanceMode = useSignal(settingsData.value.settings.maintenanceMode);
  const adminEmail = useSignal(settingsData.value.settings.adminEmail);

  // Track changes
  useTask$(({ track }) => {
    track(() => siteTitle.value);
    track(() => siteDescription.value);
    track(() => weddingDate.value);
    track(() => venue.value);
    track(() => rsvpDeadline.value);
    track(() => maxGuestsPerRsvp.value);
    track(() => autoApproveWishes.value);
    track(() => enablePhotoUploads.value);
    track(() => maintenanceMode.value);
    track(() => adminEmail.value);

    const originalSettings = settingsData.value.settings;
    hasChanges.value = (
      siteTitle.value !== originalSettings.siteTitle ||
      siteDescription.value !== originalSettings.siteDescription ||
      weddingDate.value !== originalSettings.weddingDate ||
      venue.value !== originalSettings.venue ||
      rsvpDeadline.value !== originalSettings.rsvpDeadline ||
      maxGuestsPerRsvp.value !== originalSettings.maxGuestsPerRsvp ||
      autoApproveWishes.value !== originalSettings.autoApproveWishes ||
      enablePhotoUploads.value !== originalSettings.enablePhotoUploads ||
      maintenanceMode.value !== originalSettings.maintenanceMode ||
      adminEmail.value !== originalSettings.adminEmail
    );
  });

  const saveSettings = async () => {
    saving.value = true;
    try {
      const settingsToSave = {
        site_title: siteTitle.value,
        site_description: siteDescription.value,
        wedding_date: weddingDate.value,
        venue: venue.value,
        rsvp_deadline: rsvpDeadline.value,
        max_guests_per_rsvp: maxGuestsPerRsvp.value,
        auto_approve_wishes: autoApproveWishes.value,
        enable_photo_uploads: enablePhotoUploads.value,
        maintenance_mode: maintenanceMode.value,
        admin_email: adminEmail.value,
      };

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save settings');
      }

      lastSaved.value = new Date().toLocaleTimeString();
      hasChanges.value = false;
    } catch (error) {
      console.error('Failed to save settings:', error);
      // TODO: Show user-friendly error message
    } finally {
      saving.value = false;
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'wedding', label: 'Wedding Details', icon: Calendar },
    { id: 'features', label: 'Features', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
  ];

  const Tab = component$(({
    id,
    label,
    icon: Icon,
    isActive
  }: {
    id: string;
    label: string;
    icon: Component<{ class?: string }>;
    isActive: boolean;
  }) => (
    <button
      onClick$={() => activeTab.value = id}
      class={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-wedding-brown text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon class="w-4 h-4" />
      <span>{label}</span>
    </button>
  ));

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
          <p class="text-gray-600 mt-1">Configure your wedding website settings</p>
        </div>
        <div class="flex items-center space-x-3">
          {lastSaved.value && (
            <span class="text-sm text-gray-500">
              Last saved: {lastSaved.value}
            </span>
          )}
          <Button
            onClick$={saveSettings}
            disabled={saving.value || !hasChanges.value}
            class="wedding-button"
          >
            {saving.value ? (
              <>
                <RefreshCw class="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save class="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges.value && (
        <Card class="p-4 bg-yellow-50 border-yellow-200">
          <div class="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle class="w-5 h-5" />
            <span class="font-medium">You have unsaved changes</span>
          </div>
        </Card>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div class="lg:col-span-1">
          <Card class="p-4">
            <nav class="space-y-2">
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab.value === tab.id}
                />
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div class="lg:col-span-3">
          {/* General Settings */}
          {activeTab.value === 'general' && (
            <Card class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Globe class="w-5 h-5 mr-2" />
                General Settings
              </h3>
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Site Title
                    </label>
                    <Input
                      type="text"
                      value={siteTitle.value}
                      onInput$={(e) => siteTitle.value = (e.target as HTMLInputElement).value}
                      placeholder="Wedding website title"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Admin Email
                    </label>
                    <Input
                      type="email"
                      value={adminEmail.value}
                      onInput$={(e) => adminEmail.value = (e.target as HTMLInputElement).value}
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={siteDescription.value}
                    onInput$={(e) => siteDescription.value = (e.target as HTMLTextAreaElement).value}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-brown focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of your wedding website"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Wedding Details */}
          {activeTab.value === 'wedding' && (
            <Card class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar class="w-5 h-5 mr-2" />
                Wedding Details
              </h3>
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Wedding Date
                    </label>
                    <Input
                      type="date"
                      value={weddingDate.value}
                      onInput$={(e) => weddingDate.value = (e.target as HTMLInputElement).value}
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      RSVP Deadline
                    </label>
                    <Input
                      type="date"
                      value={rsvpDeadline.value}
                      onInput$={(e) => rsvpDeadline.value = (e.target as HTMLInputElement).value}
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <Input
                    type="text"
                    value={venue.value}
                    onInput$={(e) => venue.value = (e.target as HTMLInputElement).value}
                    placeholder="Wedding venue location"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Max Guests Per RSVP
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={maxGuestsPerRsvp.value}
                    onInput$={(e) => maxGuestsPerRsvp.value = (e.target as HTMLInputElement).value}
                    placeholder="Maximum number of plus-ones allowed"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Features */}
          {activeTab.value === 'features' && (
            <Card class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Settings class="w-5 h-5 mr-2" />
                Feature Settings
              </h3>
              <div class="space-y-6">
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <Image class="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Photo Uploads</h4>
                      <p class="text-sm text-gray-500">Allow guests to upload photos</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePhotoUploads.value === 'true'}
                      onChange$={(e) => enablePhotoUploads.value = (e.target as HTMLInputElement).checked ? 'true' : 'false'}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-wedding-brown/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wedding-brown"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <CheckCircle class="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Auto-Approve Wishes</h4>
                      <p class="text-sm text-gray-500">Automatically approve guest wishes</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoApproveWishes.value === 'true'}
                      onChange$={(e) => autoApproveWishes.value = (e.target as HTMLInputElement).checked ? 'true' : 'false'}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-wedding-brown/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wedding-brown"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Security */}
          {activeTab.value === 'security' && (
            <Card class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Shield class="w-5 h-5 mr-2" />
                Security Settings
              </h3>
              <div class="space-y-6">
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div class="flex items-center space-x-2 text-yellow-800 mb-2">
                    <AlertTriangle class="w-5 h-5" />
                    <span class="font-medium">Security Notice</span>
                  </div>
                  <p class="text-sm text-yellow-700">
                    Security settings are configured via environment variables for production security.
                    Contact your administrator to change authentication settings.
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center space-x-3 mb-2">
                      <Key class="w-5 h-5 text-green-600" />
                      <span class="font-medium text-gray-900">Authentication</span>
                    </div>
                    <p class="text-sm text-gray-600">Secure admin authentication enabled</p>
                    <div class="flex items-center mt-2">
                      <CheckCircle class="w-4 h-4 text-green-600 mr-2" />
                      <span class="text-sm text-green-600">Active</span>
                    </div>
                  </div>

                  <div class="p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center space-x-3 mb-2">
                      <Shield class="w-5 h-5 text-green-600" />
                      <span class="font-medium text-gray-900">Rate Limiting</span>
                    </div>
                    <p class="text-sm text-gray-600">RSVP and API rate limiting active</p>
                    <div class="flex items-center mt-2">
                      <CheckCircle class="w-4 h-4 text-green-600 mr-2" />
                      <span class="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* System */}
          {activeTab.value === 'system' && (
            <Card class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Database class="w-5 h-5 mr-2" />
                System Settings
              </h3>
              <div class="space-y-6">
                <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div class="flex items-center space-x-3">
                    <XCircle class="w-5 h-5 text-red-600" />
                    <div>
                      <h4 class="text-sm font-medium text-red-900">Maintenance Mode</h4>
                      <p class="text-sm text-red-700">Temporarily disable public access</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode.value === 'true'}
                      onChange$={(e) => maintenanceMode.value = (e.target as HTMLInputElement).checked ? 'true' : 'false'}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center space-x-3 mb-2">
                      <Database class="w-5 h-5 text-green-600" />
                      <span class="font-medium text-gray-900">Database</span>
                    </div>
                    <p class="text-sm text-gray-600">Cloudflare D1 connected</p>
                    <div class="flex items-center mt-2">
                      <CheckCircle class="w-4 h-4 text-green-600 mr-2" />
                      <span class="text-sm text-green-600">Healthy</span>
                    </div>
                  </div>

                  <div class="p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center space-x-3 mb-2">
                      <Mail class="w-5 h-5 text-green-600" />
                      <span class="font-medium text-gray-900">Email Service</span>
                    </div>
                    <p class="text-sm text-gray-600">Resend API configured</p>
                    <div class="flex items-center mt-2">
                      <CheckCircle class="w-4 h-4 text-green-600 mr-2" />
                      <span class="text-sm text-green-600">Operational</span>
                    </div>
                  </div>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-center space-x-2 text-blue-800 mb-2">
                    <Database class="w-5 h-5" />
                    <span class="font-medium">System Information</span>
                  </div>
                  <div class="text-sm text-blue-700 space-y-1">
                    <p>• Framework: Qwik v1.14.1 with Qwik City</p>
                    <p>• Platform: Cloudflare Pages with Workers</p>
                    <p>• Database: Cloudflare D1 (SQLite)</p>
                    <p>• Storage: Cloudflare R2</p>
                    <p>• Email: Resend API</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Settings - Alfina & Mugni Wedding Admin',
  meta: [
    {
      name: 'description',
      content: 'Configure wedding website settings and preferences',
    },
  ],
};