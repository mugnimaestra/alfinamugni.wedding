import { useSignal, useVisibleTask$, type Signal } from "@builder.io/qwik";
import { GalleryService, type GalleryItem } from "../services/gallery-service";

export interface UseGalleryReturn {
  items: Signal<GalleryItem[]>;
  loading: Signal<boolean>;
  addItem: (item: Omit<GalleryItem, 'id' | 'timestamp' | 'status'>) => GalleryItem;
  updateItemStatus: (id: string, status: 'approved' | 'rejected') => void;
  deleteItem: (id: string) => void;
  searchItems: (query: string) => GalleryItem[];
  getStatistics: () => { total: number; pending: number; approved: number; rejected: number };
  uploadFile: (file: File, metadata: { title: string; description: string; author: string }) => Promise<GalleryItem>;
}

export const useGallery = (): UseGalleryReturn => {
  const galleryService = GalleryService.getInstance();
  const items = useSignal<GalleryItem[]>([]);
  const loading = useSignal(true);

  useVisibleTask$(() => {
    // Initialize service if not already initialized
    if (galleryService.getItems().length === 0) {
      galleryService.initialize();
    }
    
    // Subscribe to updates
    const unsubscribe = galleryService.subscribe((newItems) => {
      items.value = newItems;
      loading.value = false;
    });
    
    // Connect WebSocket
    galleryService.connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  });

  return {
    items,
    loading,
    addItem: galleryService.addItem.bind(galleryService),
    updateItemStatus: galleryService.updateItemStatus.bind(galleryService),
    deleteItem: galleryService.deleteItem.bind(galleryService),
    searchItems: galleryService.searchItems.bind(galleryService),
    getStatistics: galleryService.getStatistics.bind(galleryService),
    uploadFile: galleryService.uploadFile.bind(galleryService)
  };
};