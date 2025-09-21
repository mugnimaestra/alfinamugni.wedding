import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  MoreVertical,
  Eye,
  Edit
} from 'lucide-react';
import { getDatabase, type Env } from '../../../lib/database';

// Server-side data loader for RSVP data
export const useRsvpData = routeLoader$(async ({ platform, url }) => {
  try {
    const db = getDatabase(platform.env as Env);

    // Get query parameters for filtering and pagination
    const searchParams = new URLSearchParams(url.search);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get RSVPs with pagination
    const rsvps = await db.getAllRsvps(limit, offset);

    // Get statistics
    const stats = await db.getRsvpStats();

    return {
      rsvps,
      stats,
      pagination: {
        page,
        limit,
        total: stats.total,
        totalPages: Math.ceil(stats.total / limit)
      },
      filters: {
        status,
        search
      }
    };
  } catch (error) {
    console.error('Failed to load RSVP data:', error);
    return {
      rsvps: [],
      stats: {
        total: 0,
        attending_both: 0,
        attending_akad: 0,
        attending_reception: 0,
        not_attending: 0,
        total_guests: 0
      },
      pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
      filters: { status: 'all', search: '' },
      error: 'Failed to load RSVP data'
    };
  }
});

export default component$(() => {
  const rsvpData = useRsvpData();
  const searchQuery = useSignal('');
  const statusFilter = useSignal('all');
  const selectedRsvps = useSignal<Set<number>>(new Set());
  const showDetails = useSignal<number | null>(null);

  const { rsvps, stats, pagination } = rsvpData.value;

  // Filter RSVPs based on search and status
  const filteredRsvps = useSignal(rsvps);

  useTask$(({ track }) => {
    track(() => searchQuery.value);
    track(() => statusFilter.value);

    let filtered = rsvps;

    // Apply status filter
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(rsvp => rsvp.attending === statusFilter.value);
    }

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(rsvp =>
        rsvp.guest_name.toLowerCase().includes(query) ||
        rsvp.email.toLowerCase().includes(query) ||
        (rsvp.phone && rsvp.phone.toLowerCase().includes(query)) ||
        (rsvp.plus_one_name && rsvp.plus_one_name.toLowerCase().includes(query))
      );
    }

    filteredRsvps.value = filtered;
  });

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedRsvps.value);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    selectedRsvps.value = newSelection;
  };

  const selectAll = () => {
    if (selectedRsvps.value.size === filteredRsvps.value.length) {
      selectedRsvps.value = new Set();
    } else {
      selectedRsvps.value = new Set(filteredRsvps.value.map(rsvp => rsvp.id!));
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Attending', 'Plus One Count', 'Plus One Name', 'Meal Preference', 'Plus One Meal', 'Accommodation', 'Special Requests', 'Dietary Restrictions', 'Created At'];

    const data = filteredRsvps.value.map(rsvp => [
      rsvp.guest_name,
      rsvp.email,
      rsvp.phone || '',
      rsvp.attending,
      rsvp.plus_one_count.toString(),
      rsvp.plus_one_name || '',
      rsvp.meal_preference || '',
      rsvp.plus_one_meal || '',
      rsvp.accommodation_needed ? 'Yes' : 'No',
      rsvp.special_requests || '',
      rsvp.dietary_restrictions || '',
      new Date(rsvp.created_at!).toLocaleDateString()
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wedding-rsvps-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (attending: string) => {
    switch (attending) {
      case 'both':
        return <Badge variant="default" class="bg-green-100 text-green-800">Both Events</Badge>;
      case 'akad':
        return <Badge variant="secondary" class="bg-blue-100 text-blue-800">Akad Only</Badge>;
      case 'reception':
        return <Badge variant="secondary" class="bg-purple-100 text-purple-800">Reception Only</Badge>;
      case 'unable':
        return <Badge variant="destructive" class="bg-red-100 text-red-800">Cannot Attend</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">RSVP Management</h1>
          <p class="text-gray-600 mt-1">Manage and track wedding RSVPs</p>
        </div>
        <div class="flex items-center space-x-3">
          <Button
            onClick$={exportToCSV}
            variant="outline"
            class="flex items-center space-x-2"
          >
            <Download class="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          {selectedRsvps.value.size > 0 && (
            <Button variant="destructive" size="sm">
              Delete Selected ({selectedRsvps.value.size})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total RSVPs</p>
              <p class="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users class="w-8 h-8 text-wedding-brown" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Both Events</p>
              <p class="text-2xl font-bold text-green-600">{stats.attending_both}</p>
            </div>
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Guests</p>
              <p class="text-2xl font-bold text-blue-600">{stats.total_guests}</p>
            </div>
            <Calendar class="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Cannot Attend</p>
              <p class="text-2xl font-bold text-red-600">{stats.not_attending}</p>
            </div>
            <XCircle class="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery.value}
                onInput$={(e) => {
                  searchQuery.value = (e.target as HTMLInputElement).value;
                }}
                class="pl-10"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <select
              value={statusFilter.value}
              onChange$={(e) => {
                statusFilter.value = (e.target as HTMLSelectElement).value;
              }}
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-brown focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="both">Both Events</option>
              <option value="akad">Akad Only</option>
              <option value="reception">Reception Only</option>
              <option value="unable">Cannot Attend</option>
            </select>
            <Button
              onClick$={selectAll}
              variant="outline"
              size="sm"
              class="whitespace-nowrap"
            >
              {selectedRsvps.value.size === filteredRsvps.value.length && filteredRsvps.value.length > 0
                ? 'Deselect All'
                : 'Select All'
              }
            </Button>
          </div>
        </div>
      </Card>

      {/* RSVP Table */}
      <Card class="overflow-hidden">
        {filteredRsvps.value.length === 0 ? (
          <div class="text-center py-12">
            <Filter class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No RSVPs found</h3>
            <p class="text-gray-600">
              {searchQuery.value || statusFilter.value !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No RSVP submissions yet'
              }
            </p>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedRsvps.value.size === filteredRsvps.value.length && filteredRsvps.value.length > 0}
                      onChange$={selectAll}
                      class="w-4 h-4 text-wedding-brown rounded focus:ring-wedding-brown"
                    />
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plus Ones</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {filteredRsvps.value.map((rsvp, index) => (
                  <>
                    <tr key={rsvp.id || index} class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRsvps.value.has(rsvp.id!)}
                          onChange$={() => toggleSelection(rsvp.id!)}
                          class="w-4 h-4 text-wedding-brown rounded focus:ring-wedding-brown"
                        />
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div>
                            <div class="text-sm font-medium text-gray-900">{rsvp.guest_name}</div>
                            {rsvp.plus_one_name && (
                              <div class="text-sm text-gray-500">+ {rsvp.plus_one_name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="flex flex-col">
                          <div class="flex items-center">
                            <Mail class="w-3 h-3 mr-1 text-gray-400" />
                            <span>{rsvp.email}</span>
                          </div>
                          {rsvp.phone && (
                            <div class="flex items-center mt-1">
                              <Phone class="w-3 h-3 mr-1 text-gray-400" />
                              <span>{rsvp.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(rsvp.attending)}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="flex items-center">
                          <span class="font-medium">{rsvp.plus_one_count}</span>
                          <span class="text-gray-500 ml-1">guest{rsvp.plus_one_count !== 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div class="flex items-center">
                          <Clock class="w-3 h-3 mr-1" />
                          {new Date(rsvp.created_at!).toLocaleDateString()}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick$={() => showDetails.value = showDetails.value === rsvp.id ? null : rsvp.id!}
                          >
                            <Eye class="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit class="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreVertical class="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Details Row */}
                    {showDetails.value === rsvp.id && (
                      <tr class="bg-gray-50">
                        <td colSpan={7} class="px-6 py-4">
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 class="font-medium text-gray-900 mb-2">Guest Details</h4>
                              <div class="space-y-1 text-sm text-gray-600">
                                <p><span class="font-medium">Meal Preference:</span> {rsvp.meal_preference || 'Not specified'}</p>
                                {rsvp.plus_one_meal && (
                                  <p><span class="font-medium">Plus One Meal:</span> {rsvp.plus_one_meal}</p>
                                )}
                                <p><span class="font-medium">Accommodation:</span> {rsvp.accommodation_needed ? 'Required' : 'Not needed'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 class="font-medium text-gray-900 mb-2">Special Requests</h4>
                              <div class="text-sm text-gray-600">
                                <p class="mb-2">{rsvp.special_requests || 'None'}</p>
                                {rsvp.dietary_restrictions && (
                                  <div>
                                    <span class="font-medium">Dietary Restrictions:</span>
                                    <p>{rsvp.dietary_restrictions}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick$={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', (pagination.page - 1).toString());
                  window.location.href = url.toString();
                }}
              >
                Previous
              </Button>
              <span class="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick$={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', (pagination.page + 1).toString());
                  window.location.href = url.toString();
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'RSVP Management - Alfina & Mugni Wedding',
  meta: [
    {
      name: 'description',
      content: 'Admin interface for managing wedding RSVPs and guest responses',
    },
  ],
};