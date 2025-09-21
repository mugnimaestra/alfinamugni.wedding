import { component$, useSignal } from "@builder.io/qwik";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Upload, X, Image, Video } from "lucide-react";
import { useGallery } from "../hooks/use-gallery";

export const GalleryUploadSection = component$(() => {
  const isUploadOpen = useSignal(false);
  const selectedFiles = useSignal<File[]>([]);
  const uploadTitle = useSignal('');
  const uploadDescription = useSignal('');
  const uploadAuthor = useSignal('');
  const isUploading = useSignal(false);
  const uploadProgress = useSignal(0);
  
  const { items: galleryItems, loading, uploadFile } = useGallery();

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      selectedFiles.value = Array.from(target.files);
    }
  };

  const removeFile = (index: number) => {
    selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
  };

  const handleUpload = async () => {
    if (selectedFiles.value.length === 0 || !uploadTitle.value || !uploadAuthor.value) {
      alert('Please fill in all required fields');
      return;
    }

    isUploading.value = true;
    uploadProgress.value = 0;

    try {
      // Upload all selected files
      for (const file of selectedFiles.value) {
        await uploadFile(file, {
          title: uploadTitle.value,
          description: uploadDescription.value,
          author: uploadAuthor.value
        });
      }
      
      // Reset form
      selectedFiles.value = [];
      uploadTitle.value = '';
      uploadDescription.value = '';
      uploadAuthor.value = '';
      isUploadOpen.value = false;
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  };

  return (
    <section class="bg-gradient-to-b from-white via-wedding-cream/40 to-white px-4 py-24">
      <div class="mx-auto max-w-6xl">
        <div class="text-center mb-12">
          <h2 class="font-serif text-4xl font-light text-wedding-brown md:text-6xl mb-4">
            Wedding Gallery
          </h2>
          <p class="text-lg text-wedding-text-muted max-w-2xl mx-auto">
            Share your favorite moments from our special day. Upload photos and videos to contribute to our wedding memories.
          </p>
        </div>

        {/* Upload Button */}
        <div class="text-center mb-12">
          <Button 
            onClick$={() => isUploadOpen.value = true}
            class="bg-wedding-brown hover:bg-wedding-brown/90 text-white px-8 py-3 rounded-full"
          >
            <Upload class="w-5 h-5 mr-2" />
            Upload Photos/Videos
          </Button>
        </div>

        {/* Upload Modal */}
        {isUploadOpen.value && (
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold">Share Your Wedding Moments</h3>
                <Button 
                  variant="ghost" 
                  onClick$={() => isUploadOpen.value = false}
                  class="text-gray-500 hover:text-gray-700"
                >
                  <X class="w-5 h-5" />
                </Button>
              </div>
              
              <div class="space-y-6">
                {/* File Upload */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Select Photos or Videos
                  </label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange$={handleFileSelect}
                    class="cursor-pointer"
                  />
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.value.length > 0 && (
                  <div class="space-y-2">
                    <h3 class="text-sm font-medium text-gray-700">Selected Files:</h3>
                    <div class="space-y-2 max-h-32 overflow-y-auto">
                      {selectedFiles.value.map((file, index) => (
                        <div key={index} class="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div class="flex items-center gap-2">
                            {file.type.startsWith('image/') ? (
                              <Image class="w-4 h-4 text-blue-500" />
                            ) : (
                              <Video class="w-4 h-4 text-green-500" />
                            )}
                            <span class="text-sm text-gray-700">{file.name}</span>
                            <Badge variant="secondary" class="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick$={() => removeFile(index)}
                            class="text-red-500 hover:text-red-700"
                          >
                            <X class="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <Input
                      value={uploadAuthor.value}
                      onInput$={(e) => uploadAuthor.value = (e.target as HTMLInputElement).value}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <Input
                      value={uploadTitle.value}
                      onInput$={(e) => uploadTitle.value = (e.target as HTMLInputElement).value}
                      placeholder="Enter a title for your photos/videos"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={uploadDescription.value}
                      onInput$={(e) => uploadDescription.value = (e.target as HTMLTextAreaElement).value}
                      placeholder="Describe the moment (optional)"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading.value && (
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress.value}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-wedding-brown h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.value}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div class="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick$={() => isUploadOpen.value = false}
                    disabled={isUploading.value}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick$={handleUpload}
                    disabled={isUploading.value || selectedFiles.value.length === 0}
                    class="bg-wedding-brown hover:bg-wedding-brown/90 text-white"
                  >
                    {isUploading.value ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.value.map((item) => (
            <Card key={item.id} class="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
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
                    <Video class="w-12 h-12 text-gray-400" />
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

                {/* Hover Overlay */}
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div class="text-white">
                    <h3 class="font-semibold text-sm">{item.title}</h3>
                    <p class="text-xs opacity-90">by {item.author}</p>
                  </div>
                </div>
              </div>
              
              <div class="p-4">
                <h3 class="font-semibold text-sm text-gray-900 mb-1">{item.title}</h3>
                <p class="text-xs text-gray-600 mb-2">{item.description}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>by {item.author}</span>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {loading.value && (
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Image class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Loading gallery...</h3>
          </div>
        )}

        {/* Empty State */}
        {!loading.value && galleryItems.value.length === 0 && (
          <div class="text-center py-12">
            <Image class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No photos or videos yet</h3>
            <p class="text-gray-600 mb-4">Be the first to share your wedding moments!</p>
            <Button
              onClick$={() => isUploadOpen.value = true}
              class="bg-wedding-brown hover:bg-wedding-brown/90 text-white"
            >
              <Upload class="w-4 h-4 mr-2" />
              Upload Now
            </Button>
          </div>
        )}
      </div>
    </section>
  );
});