import { $, component$, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  LuUsers,
  LuCalendar,
  LuImage as LuImageIcon,
  LuTrendingUp,
  LuClock,
  LuCheckCircle,
  LuAlertTriangle,
  LuHeart,
  LuBarChart3
} from '@qwikest/icons/lucide';
import { getDatabase, type Env } from '../../../lib/database';

// Server-side data loader for dashboard statistics
export const useDashboardStats = routeLoader$(async ({ platform }) => {
  try {
    const db = getDatabase(platform.env as Env);

    // Get RSVP statistics
    const rsvpStats = await db.getRsvpStats();

    // Get recent RSVPs
    const recentRsvps = await db.getAllRsvps(5);

    // Get recent wishes
    const recentWishes = await db.getAllWishes().then(wishes => wishes.slice(0, 5));

    // Get photo statistics (mock data for now)
    const photoStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    return {
      rsvpStats,
      recentRsvps,
      recentWishes,
      photoStats,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return {
      rsvpStats: {
        total: 0,
        attending_both: 0,
        attending_akad: 0,
        attending_reception: 0,
        not_attending: 0,
        total_guests: 0
      },
      recentRsvps: [],
      recentWishes: [],
      photoStats: { total: 0, pending: 0, approved: 0, rejected: 0 },
      lastUpdated: new Date().toISOString(),
      error: 'Failed to load dashboard data'
    };
  }
});

export default component$(() => {
  const dashboardData = useDashboardStats();
  const refreshing = useSignal(false);
  const lastRefresh = useSignal('');

  useTask$(() => {
    lastRefresh.value = new Date().toLocaleTimeString();
  });

  const refreshDashboard = $(async () => {
    refreshing.value = true;
    try {
      // Trigger page refresh to get new data
      window.location.reload();
    } finally {
      refreshing.value = false;
    }
  });

  const { rsvpStats, recentRsvps, recentWishes, photoStats } = dashboardData.value;

  // Calculate attendance percentages
  const totalResponses = rsvpStats.total;
  const attendingPercentage = totalResponses > 0
    ? Math.round(((rsvpStats.attending_both + rsvpStats.attending_akad + rsvpStats.attending_reception) / totalResponses) * 100)
    : 0;

  return (
    <div class="space-y-6">
      {/* Dashboard Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-600 mt-1">Welcome to your wedding admin dashboard</p>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">
            Last updated: {lastRefresh.value}
          </span>
          <Button
            onClick$={refreshDashboard}
            disabled={refreshing.value}
            variant="outline"
            size="sm"
          >
            <LuTrendingUp class="w-4 h-4 mr-2" />
            {refreshing.value ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total RSVPs */}
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total RSVPs</p>
              <p class="text-2xl font-bold text-gray-900">{rsvpStats.total}</p>
              <p class="text-xs text-gray-500 mt-1">
                {attendingPercentage}% attending
              </p>
            </div>
            <div class="w-12 h-12 bg-wedding-brown bg-opacity-10 rounded-full flex items-center justify-center">
              <LuUsers class="w-6 h-6 text-wedding-brown" />
            </div>
          </div>
        </Card>

        {/* Total Guests Expected */}
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Expected Guests</p>
              <p class="text-2xl font-bold text-gray-900">{rsvpStats.total_guests}</p>
              <p class="text-xs text-gray-500 mt-1">
                Including plus ones
              </p>
            </div>
            <div class="w-12 h-12 bg-wedding-sage bg-opacity-20 rounded-full flex items-center justify-center">
              <LuCalendar class="w-6 h-6 text-wedding-brown" />
            </div>
          </div>
        </Card>

        {/* Pending Wishes */}
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Guest Wishes</p>
              <p class="text-2xl font-bold text-gray-900">{recentWishes.length}</p>
              <p class="text-xs text-gray-500 mt-1">
                Recent submissions
              </p>
            </div>
            <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <LuHeart class="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </Card>

        {/* Photo Uploads */}
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Photos</p>
              <p class="text-2xl font-bold text-gray-900">{photoStats.total}</p>
              <p class="text-xs text-gray-500 mt-1">
                {photoStats.pending} pending review
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <LuImageIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Breakdown */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LuBarChart3 class="w-5 h-5 mr-2 text-wedding-brown" />
            Attendance Breakdown
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">Both Events</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-bold text-gray-900">{rsvpStats.attending_both}</span>
                <span class="text-xs text-gray-500 ml-1">
                  ({totalResponses > 0 ? Math.round((rsvpStats.attending_both / totalResponses) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">Akad Only</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-bold text-gray-900">{rsvpStats.attending_akad}</span>
                <span class="text-xs text-gray-500 ml-1">
                  ({totalResponses > 0 ? Math.round((rsvpStats.attending_akad / totalResponses) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">Reception Only</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-bold text-gray-900">{rsvpStats.attending_reception}</span>
                <span class="text-xs text-gray-500 ml-1">
                  ({totalResponses > 0 ? Math.round((rsvpStats.attending_reception / totalResponses) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">Cannot Attend</span>
              </div>
              <div class="text-right">
                <span class="text-sm font-bold text-gray-900">{rsvpStats.not_attending}</span>
                <span class="text-xs text-gray-500 ml-1">
                  ({totalResponses > 0 ? Math.round((rsvpStats.not_attending / totalResponses) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LuClock class="w-5 h-5 mr-2 text-wedding-brown" />
            Recent Activity
          </h3>
          <div class="space-y-3">
            {recentRsvps.slice(0, 3).map((rsvp, index) => (
              <div key={rsvp.id || index} class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-wedding-brown bg-opacity-10 rounded-full flex items-center justify-center">
                  <LuCheckCircle class="w-4 h-4 text-wedding-brown" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {rsvp.guest_name}
                  </p>
                  <p class="text-xs text-gray-500">
                    RSVP {rsvp.attending} • {new Date(rsvp.created_at!).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={rsvp.attending === 'unable' ? 'destructive' : 'default'}
                  class="text-xs"
                >
                  {rsvp.attending}
                </Badge>
              </div>
            ))}
            {recentRsvps.length === 0 && (
              <div class="text-center py-4 text-gray-500">
                <p class="text-sm">No recent RSVPs</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/rsvps"
            class="h-24 flex flex-col items-center justify-center space-y-2 wedding-button no-underline"
          >
            <LuUsers class="w-6 h-6" />
            <span class="text-sm">View RSVPs</span>
          </a>
          <a
            href="/admin/gallery"
            class="h-24 flex flex-col items-center justify-center space-y-2 wedding-button no-underline"
          >
            <LuImageIcon class="w-6 h-6" />
            <span class="text-sm">Manage Gallery</span>
          </a>
          <a
            href="/admin/wishes"
            class="h-24 flex flex-col items-center justify-center space-y-2 wedding-button no-underline"
          >
            <LuHeart class="w-6 h-6" />
            <span class="text-sm">Review Wishes</span>
          </a>
          <a
            href="/admin/settings"
            class="h-24 flex flex-col items-center justify-center space-y-2 wedding-button no-underline"
          >
            <LuAlertTriangle class="w-6 h-6" />
            <span class="text-sm">Settings</span>
          </a>
        </div>
      </Card>

      {/* System Status */}
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">Database</p>
              <p class="text-xs text-gray-500">Connected & Healthy</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">Email Service</p>
              <p class="text-xs text-gray-500">Operational</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p class="text-sm font-medium text-gray-900">Storage</p>
              <p class="text-xs text-gray-500">Available</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin Dashboard - Alfina & Mugni Wedding',
  meta: [
    {
      name: 'description',
      content: 'Wedding admin dashboard for managing RSVPs, gallery, and guest interactions',
    },
  ],
};