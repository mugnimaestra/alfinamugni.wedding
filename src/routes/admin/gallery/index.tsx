import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Check, X, Search, Filter } from "lucide-react";
import { useGallery } from "../../../hooks/use-gallery";

export default component$(() => {
  const searchQuery = useSignal('');
  const statusFilter = useSignal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const selectedItems = useSignal<Set<string>>(new Set());

  const { items: mediaItems, updateItemStatus, getStatistics, searchItems } = useGallery();
  const filteredItems = useSignal(mediaItems.value);

  const filterItems = () => {
    let filtered = mediaItems.value;

    // Apply status filter
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter.value);
    }

    // Apply search filter
    if (searchQuery.value) {
      filtered = searchItems(searchQuery.value);

      // Apply status filter again if needed
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(item => item.status === statusFilter.value);
      }
    }

    filteredItems.value = filtered;
  };

  const bulkApprove = () => {
    mediaItems.value = mediaItems.value.map(item =>
      selectedItems.value.has(item.id) ? { ...item, status: 'approved' } : item
    );
    selectedItems.value = new Set();
    filterItems();
  };

  const bulkReject = () => {
    mediaItems.value = mediaItems.value.map(item =>
      selectedItems.value.has(item.id) ? { ...item, status: 'rejected' } : item
    );
    selectedItems.value = new Set();
    filterItems();
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems.value);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    selectedItems.value = newSelection;
  };

  const counts = getStatistics();

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p class="text-gray-600 mt-1">Manage wedding photo and video submissions</p>
        </div>
        <div class="flex items-center gap-4">
          <Badge variant="outline" class="text-sm">
            Total: {counts.total}
          </Badge>
          <Badge variant="secondary" class="text-sm">
            Pending: {counts.pending}
          </Badge>
          <Badge variant="default" class="text-sm">
            Approved: {counts.approved}
          </Badge>
          <Badge variant="destructive" class="text-sm">
            Rejected: {counts.rejected}
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by title, author, or description..."
                value={searchQuery.value}
                onInput$={(e) => {
                  searchQuery.value = (e.target as HTMLInputElement).value;
                  filterItems();
                }}
                class="pl-10"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <select
              value={statusFilter.value}
              onChange$={(e) => {
                statusFilter.value = (e.target as HTMLSelectElement).value as 'all' | 'pending' | 'approved' | 'rejected';
                filterItems();
              }}
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wedding-brown focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {selectedItems.value.size > 0 && (
              <>
                <Button
                  onClick$={bulkApprove}
                  class="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve Selected ({selectedItems.value.size})
                </Button>
                <Button
                  onClick$={bulkReject}
                  variant="destructive"
                >
                  Reject Selected ({selectedItems.value.size})
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Media Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.value.map((item) => (
          <Card key={item.id} class="overflow-hidden">
            <div class="relative aspect-square">
              {item.type === 'image' ? (
                <img
                  src={item.thumbnail || item.url}
                  alt={item.title}
                  width="400"
                  height="400"
                  class="w-full h-full object-cover"
                />
              ) : (
                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div class="text-center">
                    <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span class="text-xs text-gray-600">VIDEO</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div class="absolute top-2 right-2">
                <Badge
                  variant={item.status === 'approved' ? 'default' : item.status === 'pending' ? 'secondary' : 'destructive'}
                  class="text-xs"
                >
                  {item.status === 'approved' ? 'Approved' : item.status === 'pending' ? 'Pending' : 'Rejected'}
                </Badge>
              </div>

              {/* Checkbox */}
              <div class="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedItems.value.has(item.id)}
                  onChange$={() => toggleSelection(item.id)}
                  class="w-4 h-4 text-wedding-brown rounded focus:ring-wedding-brown"
                />
              </div>
            </div>

            <div class="p-4">
              <h3 class="font-semibold text-sm text-gray-900 mb-1">{item.title}</h3>
              <p class="text-xs text-gray-600 mb-2">{item.description}</p>
              <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>by {item.author}</span>
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons */}
              <div class="flex gap-2">
                <Button
                  size="sm"
                  onClick$={() => updateItemStatus(item.id, 'approved')}
                  disabled={item.status === 'approved'}
                  class={`flex-1 ${item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  <Check class="w-3 h-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick$={() => updateItemStatus(item.id, 'rejected')}
                  disabled={item.status === 'rejected'}
                  class={`flex-1 ${item.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  <X class="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.value.length === 0 && (
        <Card class="p-12">
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No media found</h3>
            <p class="text-gray-600">
              {searchQuery.value || statusFilter.value !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No media submissions yet'
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Gallery Management - Alfina & Mugni",
  meta: [
    {
      name: "description",
      content: "Admin dashboard for managing wedding photo and video submissions",
    },
  ],
};