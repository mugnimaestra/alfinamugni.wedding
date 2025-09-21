export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  author: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  url?: string;
  thumbnail?: string;
}

export class GalleryService {
  private static instance: GalleryService;
  private items: GalleryItem[] = [];
  private listeners = new Set<(items: GalleryItem[]) => void>();

  static getInstance(): GalleryService {
    if (!GalleryService.instance) {
      GalleryService.instance = new GalleryService();
    }
    return GalleryService.instance;
  }

  // Initialize with mock data
  initialize() {
    const mockItems: GalleryItem[] = [
      {
        id: '1',
        type: 'image',
        title: 'Beautiful Sunset',
        description: 'Amazing sunset during the wedding ceremony',
        author: 'Guest 1',
        timestamp: '2024-01-15T18:30:00Z',
        status: 'approved',
        url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: '2',
        type: 'video',
        title: 'First Dance',
        description: 'Our magical first dance as a married couple',
        author: 'Guest 2',
        timestamp: '2024-01-15T20:00:00Z',
        status: 'approved',
        url: '#',
        thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=300&q=80'
      }
    ];
    
    this.items = mockItems;
    this.notifyListeners();
  }

  // Get all items
  getItems(): GalleryItem[] {
    return this.items;
  }

  // Get items by status
  getItemsByStatus(status: 'pending' | 'approved' | 'rejected'): GalleryItem[] {
    return this.items.filter(item => item.status === status);
  }

  // Add new item
  addItem(item: Omit<GalleryItem, 'id' | 'timestamp' | 'status'>): GalleryItem {
    const newItem: GalleryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    this.items = [...this.items, newItem];
    this.notifyListeners();
    this.simulateRealTimeUpdate(newItem);
    
    return newItem;
  }

  // Update item status
  updateItemStatus(id: string, status: 'approved' | 'rejected'): void {
    this.items = this.items.map(item => 
      item.id === id ? { ...item, status } : item
    );
    this.notifyListeners();
    this.simulateRealTimeUpdate(this.items.find(item => item.id === id)!);
  }

  // Delete item
  deleteItem(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
    this.notifyListeners();
  }

  // Subscribe to updates
  subscribe(callback: (items: GalleryItem[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.items);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.items));
  }

  // Simulate real-time update (in real app, this would be via WebSocket)
  private simulateRealTimeUpdate(item: GalleryItem): void {
    // Simulate WebSocket event
    setTimeout(() => {
      console.log('Real-time update:', item);
      // In a real implementation, this would trigger a WebSocket broadcast
    }, 100);
  }

  // Simulate WebSocket connection
  connectWebSocket() {
    // In a real implementation, this would establish a WebSocket connection
    console.log('WebSocket connection established');
    
    // Simulate receiving updates
    const simulateIncomingUpdate = () => {
      // This would normally come from the server via WebSocket
      console.log('Simulating incoming WebSocket update');
    };
    
    // Simulate periodic updates
    setInterval(simulateIncomingUpdate, 30000); // Every 30 seconds
  }

  // Upload file (simulated)
  async uploadFile(file: File, metadata: { title: string; description: string; author: string }): Promise<GalleryItem> {
    // Simulate upload progress
    return new Promise((resolve) => {
      const progress = setInterval(() => {
        console.log('Upload progress...');
      }, 100);

      setTimeout(() => {
        clearInterval(progress);
        
        const item = this.addItem({
          type: file.type.startsWith('image/') ? 'image' : 'video',
          title: metadata.title,
          description: metadata.description,
          author: metadata.author,
          url: URL.createObjectURL(file),
          thumbnail: URL.createObjectURL(file)
        });
        
        resolve(item);
      }, 2000); // Simulate 2 second upload
    });
  }

  // Search items
  searchItems(query: string): GalleryItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.items.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.author.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get statistics
  getStatistics() {
    const total = this.items.length;
    const pending = this.items.filter(item => item.status === 'pending').length;
    const approved = this.items.filter(item => item.status === 'approved').length;
    const rejected = this.items.filter(item => item.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  }
}