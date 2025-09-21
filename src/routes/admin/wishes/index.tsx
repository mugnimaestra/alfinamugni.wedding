import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Heart,
  Search,
  Filter,
  Check,
  X,
  Clock,
  MessageSquare,
  Mail,
  Flag,
  Trash2,
  Download
} from 'lucide-react';
import { getDatabase, type Env } from '../../../lib/database';

// Server-side data loader for wishes data
export const useWishesData = routeLoader$(async ({ platform, url }) => {
  try {
    const db = getDatabase(platform.env as Env);

    // Get query parameters for filtering
    const searchParams = new URLSearchParams(url.search);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Get all wishes
    const allWishes = await db.getAllWishes();
    const approvedWishes = await db.getApprovedWishes();

    return {
      allWishes,
      approvedWishes,
      stats: {
        total: allWishes.length,
        approved: approvedWishes.length,
        pending: allWishes.filter(w => !w.approved).length
      },
      filters: {
        status,
        search
      }
    };
  } catch (error) {
    console.error('Failed to load wishes data:', error);
    return {
      allWishes: [],
      approvedWishes: [],
      stats: { total: 0, approved: 0, pending: 0 },
      filters: { status: 'all', search: '' },
      error: 'Failed to load wishes data'
    };
  }
});

export default component$(() => {
  const wishesData = useWishesData();
  const searchQuery = useSignal('');
  const statusFilter = useSignal('all');
  const selectedWishes = useSignal<Set<number>>(new Set());
  const showFullMessage = useSignal<Set<number>>(new Set());

  const { allWishes, stats } = wishesData.value;

  // Filter wishes based on search and status
  const filteredWishes = useSignal(allWishes);

  useTask$(({ track }) => {
    track(() => searchQuery.value);
    track(() => statusFilter.value);

    let filtered = allWishes;

    // Apply status filter
    if (statusFilter.value === 'approved') {
      filtered = filtered.filter(wish => wish.approved);
    } else if (statusFilter.value === 'pending') {
      filtered = filtered.filter(wish => !wish.approved);
    }

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(wish =>
        wish.guest_name.toLowerCase().includes(query) ||
        wish.message.toLowerCase().includes(query) ||
        (wish.email && wish.email.toLowerCase().includes(query))
      );
    }

    filteredWishes.value = filtered;
  });

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedWishes.value);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    selectedWishes.value = newSelection;
  };

  const selectAll = () => {
    if (selectedWishes.value.size === filteredWishes.value.length) {
      selectedWishes.value = new Set();
    } else {
      selectedWishes.value = new Set(filteredWishes.value.map(wish => wish.id!));
    }
  };

  const toggleFullMessage = (id: number) => {
    const newSet = new Set(showFullMessage.value);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    showFullMessage.value = newSet;
  };

  const bulkApprove = async () => {
    try {
      const response = await fetch('/api/admin/wishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          wishIds: Array.from(selectedWishes.value)
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to approve wishes');
      }

      selectedWishes.value = new Set();
      // TODO: Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Bulk approve failed:', error);
      // TODO: Show user-friendly error message
    }
  };

  const bulkReject = async () => {
    try {
      const response = await fetch('/api/admin/wishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          wishIds: Array.from(selectedWishes.value)
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete wishes');
      }

      selectedWishes.value = new Set();
      // TODO: Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Bulk reject failed:', error);
      // TODO: Show user-friendly error message
    }
  };

  const exportWishes = () => {
    const approvedWishesData = filteredWishes.value.filter(w => w.approved);
    const headers = ['Name', 'Email', 'Message', 'Date'];

    const data = approvedWishesData.map(wish => [
      wish.guest_name,
      wish.email || '',
      wish.message.replace(/"/g, '""'), // Escape quotes for CSV
      new Date(wish.created_at!).toLocaleDateString()
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wedding-wishes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const truncateMessage = (message: string, maxLength: number = 150) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const getStatusBadge = (approved: boolean) => {
    return approved
      ? <Badge variant="default" class="bg-green-100 text-green-800">Approved</Badge>
      : <Badge variant="secondary" class="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Guest Wishes</h1>
          <p class="text-gray-600 mt-1">Manage wedding well-wishes from guests</p>
        </div>
        <div class="flex items-center space-x-3">
          <Button
            onClick$={exportWishes}
            variant="outline"
            class="flex items-center space-x-2"
          >
            <Download class="w-4 h-4" />
            <span>Export Approved</span>
          </Button>
          {selectedWishes.value.size > 0 && (
            <>
              <Button
                onClick$={bulkApprove}
                class="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Check class="w-4 h-4 mr-2" />
                Approve ({selectedWishes.value.size})
              </Button>
              <Button
                onClick$={bulkReject}
                variant="destructive"
                size="sm"
              >
                <X class="w-4 h-4 mr-2" />
                Delete ({selectedWishes.value.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Wishes</p>
              <p class="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Heart class="w-8 h-8 text-pink-500" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Approved</p>
              <p class="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <Check class="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pending Review</p>
              <p class="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock class="w-8 h-8 text-yellow-600" />
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
                placeholder="Search by name, email, or message content..."
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
              <option value="all">All Wishes</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
            </select>
            <Button
              onClick$={selectAll}
              variant="outline"
              size="sm"
              class="whitespace-nowrap"
            >
              {selectedWishes.value.size === filteredWishes.value.length && filteredWishes.value.length > 0
                ? 'Deselect All'
                : 'Select All'
              }
            </Button>
          </div>
        </div>
      </Card>

      {/* Wishes Grid */}
      {filteredWishes.value.length === 0 ? (
        <Card class="p-12">
          <div class="text-center">
            <Filter class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No wishes found</h3>
            <p class="text-gray-600">
              {searchQuery.value || statusFilter.value !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No guest wishes submitted yet'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWishes.value.map((wish, index) => (
            <Card key={wish.id || index} class="p-6 relative">
              {/* Selection Checkbox */}
              <div class="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selectedWishes.value.has(wish.id!)}
                  onChange$={() => toggleSelection(wish.id!)}
                  class="w-4 h-4 text-wedding-brown rounded focus:ring-wedding-brown"
                />
              </div>

              {/* Status Badge */}
              <div class="absolute top-4 right-4">
                {getStatusBadge(wish.approved)}
              </div>

              <div class="mt-6">
                {/* Guest Info */}
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 bg-wedding-brown bg-opacity-10 rounded-full flex items-center justify-center">
                    <Heart class="w-5 h-5 text-wedding-brown" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{wish.guest_name}</p>
                    {wish.email && (
                      <div class="flex items-center text-xs text-gray-500">
                        <Mail class="w-3 h-3 mr-1" />
                        {wish.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div class="mb-4">
                  <p class="text-sm text-gray-700 leading-relaxed">
                    {showFullMessage.value.has(wish.id!)
                      ? wish.message
                      : truncateMessage(wish.message)
                    }
                  </p>
                  {wish.message.length > 150 && (
                    <button
                      onClick$={() => toggleFullMessage(wish.id!)}
                      class="text-xs text-wedding-brown hover:text-wedding-accent mt-2 font-medium"
                    >
                      {showFullMessage.value.has(wish.id!) ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <div class="flex items-center">
                    <Clock class="w-3 h-3 mr-1" />
                    {new Date(wish.created_at!).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div class="flex items-center space-x-2">
                    {!wish.approved && (
                      <>
                        <Button
                          size="sm"
                          onClick$={async () => {
                            try {
                              const response = await fetch('/api/admin/wishes', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  action: 'approve',
                                  wishId: wish.id
                                })
                              });

                              const result = await response.json();

                              if (!result.success) {
                                throw new Error(result.message || 'Failed to approve wish');
                              }

                              window.location.reload();
                            } catch (error) {
                              console.error('Approve failed:', error);
                            }
                          }}
                          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                        >
                          <Check class="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick$={async () => {
                            try {
                              const response = await fetch('/api/admin/wishes', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  action: 'flag',
                                  wishId: wish.id
                                })
                              });

                              const result = await response.json();

                              if (!result.success) {
                                throw new Error(result.message || 'Failed to flag wish');
                              }

                              console.log('Wish flagged for review');
                            } catch (error) {
                              console.error('Flag failed:', error);
                            }
                          }}
                          class="px-3 py-1 text-xs"
                        >
                          <Flag class="w-3 h-3 mr-1" />
                          Flag
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick$={async () => {
                        try {
                          const response = await fetch('/api/admin/wishes', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              action: 'delete',
                              wishId: wish.id
                            })
                          });

                          const result = await response.json();

                          if (!result.success) {
                            throw new Error(result.message || 'Failed to delete wish');
                          }

                          window.location.reload();
                        } catch (error) {
                          console.error('Delete failed:', error);
                        }
                      }}
                      class="px-3 py-1 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 class="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Moderation Guidelines */}
      <Card class="p-6 bg-blue-50 border-blue-200">
        <h3 class="text-lg font-medium text-blue-900 mb-2 flex items-center">
          <MessageSquare class="w-5 h-5 mr-2" />
          Moderation Guidelines
        </h3>
        <div class="text-sm text-blue-800 space-y-2">
          <p>• Review all wishes for inappropriate content, spam, or offensive language</p>
          <p>• Approved wishes will be displayed on the public wedding website</p>
          <p>• Use the Flag option for wishes that need special attention</p>
          <p>• Consider the couple's preferences when approving personal or intimate messages</p>
          <p>• Delete obvious spam, promotional content, or malicious messages</p>
        </div>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Guest Wishes Management - Alfina & Mugni Wedding',
  meta: [
    {
      name: 'description',
      content: 'Admin interface for managing wedding guest wishes and well-wishes',
    },
  ],
};