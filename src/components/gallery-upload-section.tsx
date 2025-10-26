import { component$, useSignal, $ } from "@builder.io/qwik";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Upload, X, Image, Video } from "lucide-react";
import { useGallery } from "../hooks/use-gallery";

export const GalleryUploadSection = component$(() => {
  const isUploadOpen = useSignal(false);
  const selectedFiles = useSignal<File[]>([]);
  const uploadTitle = useSignal("");
  const uploadDescription = useSignal("");
  const uploadAuthor = useSignal("");
  const isUploading = useSignal(false);
  const uploadProgress = useSignal(0);

  const { items: galleryItems, loading, uploadFile } = useGallery();

  const handleFileSelect = $((event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      selectedFiles.value = Array.from(target.files);
    }
  });

  const removeFile = $((index: number) => {
    selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
  });

  const handleUpload = $(async () => {
    if (
      selectedFiles.value.length === 0 ||
      !uploadTitle.value ||
      !uploadAuthor.value
    ) {
      alert("Please fill in all required fields");
      return;
    }

    isUploading.value = true;
    uploadProgress.value = 0;

    try {
      // Upload all selected files
      for (let i = 0; i < selectedFiles.value.length; i++) {
        const file = selectedFiles.value[i];
        await uploadFile(file, {
          title: uploadTitle.value,
          description: uploadDescription.value,
          author: uploadAuthor.value,
        });
        uploadProgress.value = Math.round(
          ((i + 1) / selectedFiles.value.length) * 100
        );
      }

      // Reset form
      selectedFiles.value = [];
      uploadTitle.value = "";
      uploadDescription.value = "";
      uploadAuthor.value = "";
      isUploadOpen.value = false;
      alert(
        "Photos uploaded successfully! They will appear after admin approval."
      );
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  });

  return (
    <section class="bg-gradient-to-b from-white via-wedding-cream/40 to-white px-4 py-24">
      <div class="mx-auto max-w-6xl">
        <div class="text-center mb-12">
          <h2 class="font-serif text-4xl font-light text-wedding-brown md:text-6xl mb-4">
            Wedding Gallery
          </h2>
          <p class="text-lg text-wedding-text-muted max-w-2xl mx-auto">
            Share your favorite moments from our special day. Upload photos and
            videos to contribute to our wedding memories.
          </p>
        </div>

        {/* Upload Button */}
        <div class="text-center mb-12">
          <Button
            onClick$={() => (isUploadOpen.value = true)}
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
                <h3 class="text-xl font-semibold">
                  Share Your Wedding Moments
                </h3>
                <Button
                  variant="ghost"
                  onClick$={() => (isUploadOpen.value = false)}
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
                    <h3 class="text-sm font-medium text-gray-700">
                      Selected Files:
                    </h3>
                    <div class="space-y-2 max-h-32 overflow-y-auto">
                      {selectedFiles.value.map((file, index) => (
                        <div
                          key={index}
                          class="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div class="flex items-center gap-2">
                            {file.type.startsWith("image/") ? (
                              <Image class="w-4 h-4 text-blue-500" />
                            ) : (
                              <Video class="w-4 h-4 text-green-500" />
                            )}
                            <span class="text-sm text-gray-700">
                              {file.name}
                            </span>
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
                      onInput$={(e) =>
                        (uploadAuthor.value = (
                          e.target as HTMLInputElement
                        ).value)
                      }
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
                      onInput$={(e) =>
                        (uploadTitle.value = (
                          e.target as HTMLInputElement
                        ).value)
                      }
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
                      onInput$={(e) =>
                        (uploadDescription.value = (
                          e.target as HTMLTextAreaElement
                        ).value)
                      }
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
                    onClick$={() => (isUploadOpen.value = false)}
                    disabled={isUploading.value}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick$={handleUpload}
                    disabled={
                      isUploading.value || selectedFiles.value.length === 0
                    }
                    class="bg-wedding-brown hover:bg-wedding-brown/90 text-white"
                  >
                    {isUploading.value ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pinterest-Style Masonry Gallery */}
        <div class="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance]">
          {galleryItems.value.map((item) => (
            <article
              key={item.id}
              class="mb-6 break-inside-avoid overflow-hidden rounded-[1.75rem] border border-wedding-beige/70 bg-white/90 shadow-[0_20px_60px_rgba(77,51,38,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(77,51,38,0.12)]"
            >
              <div class="group">
                <div class="relative overflow-hidden">
                  {item.type === "image" ? (
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.title}
                      width="600"
                      height="800"
                      loading="lazy"
                      class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div class="w-full aspect-video bg-gray-100 flex items-center justify-center">
                      <Video class="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Gradient overlay on hover */}
                  <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15 opacity-0 transition duration-500 group-hover:opacity-100" />

                  {/* Category Badge */}
                  {item.category && (
                    <div class="absolute left-4 top-4">
                      <span class="inline-flex items-center rounded-full px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.22em] bg-white/85 text-wedding-text-secondary backdrop-blur">
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>

                <div class="space-y-4 px-6 py-6">
                  <div>
                    <h3 class="text-lg font-semibold text-wedding-text-primary">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p class="mt-2 text-sm leading-relaxed text-wedding-text-muted">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div class="flex items-center gap-x-3">
                    <div class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-wedding-sage/80 via-white to-wedding-cream text-sm font-semibold text-wedding-text-primary shadow-sm">
                      {item.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-wedding-text-primary">
                        {item.author}
                      </p>
                      <p class="text-xs text-wedding-text-muted">
                        {new Date(item.timestamp).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Loading State */}
        {loading.value && (
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Image class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Loading gallery...
            </h3>
          </div>
        )}

        {/* Empty State */}
        {!loading.value && galleryItems.value.length === 0 && (
          <div class="text-center py-12">
            <Image class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No photos or videos yet
            </h3>
            <p class="text-gray-600 mb-4">
              Be the first to share your wedding moments!
            </p>
            <Button
              onClick$={() => (isUploadOpen.value = true)}
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
