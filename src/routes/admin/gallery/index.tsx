import { component$, useSignal, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { LuTrash2, LuSearch } from "@qwikest/icons/lucide";
import { useGallery } from "../../../hooks/use-gallery";
import { toast } from "sonner";

export default component$(() => {
  const searchQuery = useSignal("");
  const selectedItems = useSignal<Set<string>>(new Set());

  const { items: mediaItems, statistics, searchItems, refreshGallery } = useGallery();
  const filteredItems = useSignal(mediaItems.value);

  const filterItems = $(() => {
    let filtered = mediaItems.value;

    // Apply search filter
    if (searchQuery.value) {
      filtered = searchItems(searchQuery.value);
    }

    filteredItems.value = filtered;
  });

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems.value);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    selectedItems.value = newSelection;
  };

  const handleDelete = $(async (id: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      try {
        const response = await fetch(`/api/photos/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Photo deleted successfully');
          await refreshGallery();
          // Clear selection if deleted item was selected
          if (selectedItems.value.has(id)) {
            const newSelection = new Set(selectedItems.value);
            newSelection.delete(id);
            selectedItems.value = newSelection;
          }
        } else {
          toast.error(`Delete failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete photo. Please try again.');
      }
    }
  });

  const handleBulkDelete = $(async () => {
    if (selectedItems.value.size === 0) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedItems.value.size} photo(s)?`
      )
    ) {
      try {
        const deletePromises = Array.from(selectedItems.value).map(id =>
          fetch(`/api/photos/${id}`, { method: 'DELETE' }).then(r => r.json())
        );

        const results = await Promise.all(deletePromises);
        const failures = results.filter(r => !r.success);

        if (failures.length > 0) {
          toast.error(`${failures.length} photo(s) failed to delete`);
        } else {
          toast.success(`${results.length} photo(s) deleted successfully`);
        }

        await refreshGallery();
        selectedItems.value = new Set();
      } catch (error) {
        console.error('Bulk delete error:', error);
        toast.error('Failed to delete photos. Please try again.');
      }
    }
  });

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p class="text-gray-600 mt-1">
            Manage wedding photo and video submissions
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Badge variant="outline" class="text-sm">
            Total: {statistics.value.total}
          </Badge>
          {selectedItems.value.size > 0 && (
            <Button
              onClick$={handleBulkDelete}
              variant="destructive"
              class="text-white"
            >
              <LuTrash2 class="w-4 h-4 mr-2" />
              Delete Selected ({selectedItems.value.size})
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <LuSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
        </div>
      </Card>

      {/* Media Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.value.map((item) => (
          <Card key={item.id} class="overflow-hidden">
            <div class="relative aspect-square">
              {item.type === "image" ? (
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
              <h3 class="font-semibold text-sm text-gray-900 mb-1">
                {item.title}
              </h3>
              <p class="text-xs text-gray-600 mb-2">{item.description}</p>
              <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>by {item.author}</span>
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>

              {/* Action Button */}
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick$={() => handleDelete(item.id)}
                  class="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <LuTrash2 class="w-3 h-3 mr-1" />
                  Delete
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
              <LuSearch class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No media found
            </h3>
            <p class="text-gray-600">
              {searchQuery.value
                ? "Try adjusting your search criteria"
                : "No media submissions yet"}
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
      content:
        "Admin dashboard for managing wedding photo and video submissions",
    },
  ],
};
