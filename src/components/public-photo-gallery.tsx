/**
 * Public Photo Gallery Component
 * Week 6 Implementation - Public Photo Gallery for Guests
 */

import { component$, useSignal, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  LuSearch,
  LuHeart,
  LuMessageCircle,
  LuShare2,
  LuDownload,
  LuGrid3x3,
  LuList,
  LuMapPin,
  LuCamera,
  LuTrendingUp,
  LuEye,
  LuStar,
  LuBookmark,
  LuChevronLeft,
  LuChevronRight,
  LuX,
} from '@qwikest/icons/lucide';

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  category: string;
  tags: string[];
  location?: string;
  camera?: string;
  settings?: string;
  likes: number;
  comments: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  featured: boolean;
  status: 'approved' | 'pending' | 'rejected';
}

interface GalleryStats {
  totalPhotos: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  featuredPhotos: number;
  categories: Record<string, number>;
  recentActivity: Array<{
    type: 'photo' | 'like' | 'comment';
    photoId: string;
    timestamp: string;
    user: string;
  }>;
}

interface FilterOptions {
  category: string;
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  author: string;
  sortBy: 'newest' | 'oldest' | 'popular' | 'trending';
  viewMode: 'grid' | 'list' | 'masonry';
}

export interface PublicPhotoGalleryProps {
  photos?: Photo[];
  allowLikes?: boolean;
  allowComments?: boolean;
  allowDownloads?: boolean;
  allowSharing?: boolean;
  showStats?: boolean;
  showFilters?: boolean;
  maxPhotos?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PublicPhotoGallery = component$<PublicPhotoGalleryProps>((props) => {
  const {
    photos = [],
    allowLikes = true,
    allowDownloads = true,
    allowSharing = true,
    showStats = true,
    showFilters = true,
    maxPhotos = 1000,
    autoRefresh = true,
    refreshInterval = 30000
  } = props;

  const selectedPhoto = useSignal<Photo>();
  const isLightboxOpen = useSignal(false);
  const searchQuery = useSignal('');
  const activeTab = useSignal('gallery');
  const currentPage = useSignal(1);
  
  const filterOptions = useStore<FilterOptions>({
    category: 'all',
    tags: [],
    dateRange: {},
    author: '',
    sortBy: 'newest',
    viewMode: 'grid'
  });

  const galleryStats = useSignal<GalleryStats>({
    totalPhotos: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    featuredPhotos: 0,
    categories: {},
    recentActivity: []
  });

  const categories = [
    { id: 'all', name: 'All Photos', icon: '📷' },
    { id: 'ceremony', name: 'Ceremony', icon: '💒' },
    { id: 'reception', name: 'Reception', icon: '🎉' },
    { id: 'prewedding', name: 'Pre-wedding', icon: '💕' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'friends', name: 'Friends', icon: '👥' },
    { id: 'candid', name: 'Candid', icon: '📸' },
    { id: 'traditional', name: 'Traditional', icon: '🏛️' }
  ];

  const itemsPerPage = 24;

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    track(() => photos.length);
    
    calculateStats();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        simulateRealTimeUpdate();
      }, refreshInterval);
      
      cleanup(() => clearInterval(interval));
    }
  });

  const calculateStats = () => {
    const approvedPhotos = photos.filter(p => p.status === 'approved');
    
    galleryStats.value = {
      totalPhotos: approvedPhotos.length,
      totalLikes: approvedPhotos.reduce((sum, p) => sum + p.likes, 0),
      totalComments: approvedPhotos.reduce((sum, p) => sum + p.comments, 0),
      totalViews: approvedPhotos.reduce((sum, p) => sum + p.views, 0),
      featuredPhotos: approvedPhotos.filter(p => p.featured).length,
      categories: approvedPhotos.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: generateRecentActivity(approvedPhotos)
    };
  };

  const generateRecentActivity = (photos: Photo[]): GalleryStats['recentActivity'] => {
    const activities: GalleryStats['recentActivity'] = [];
    
    // Generate some sample recent activity
    photos.slice(0, 5).forEach((photo, index) => {
      activities.push({
        type: 'photo',
        photoId: photo.id,
        timestamp: new Date(Date.now() - index * 60000).toISOString(),
        user: photo.author
      });
      
      if (Math.random() > 0.5) {
        activities.push({
          type: 'like',
          photoId: photo.id,
          timestamp: new Date(Date.now() - index * 30000).toISOString(),
          user: `Guest ${index + 1}`
        });
      }
    });
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const simulateRealTimeUpdate = () => {
    // Simulate new photo upload
    if (Math.random() > 0.8 && photos.length < maxPhotos) {
      const newPhoto: Photo = {
        id: `photo-${Date.now()}`,
        url: `https://picsum.photos/800/600?random=${Date.now()}`,
        thumbnail: `https://picsum.photos/200/200?random=${Date.now()}`,
        title: `New Wedding Photo ${photos.length + 1}`,
        description: 'Just uploaded!',
        author: `Guest ${Math.floor(Math.random() * 100)}`,
        timestamp: new Date().toISOString(),
        category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1].id,
        tags: ['wedding', 'new'],
        likes: 0,
        comments: 0,
        views: 0,
        isLiked: false,
        isBookmarked: false,
        featured: false,
        status: 'approved'
      };
      
      photos.push(newPhoto);
      calculateStats();
    }
  };

  const filteredPhotos = photos.filter(photo => {
    if (photo.status !== 'approved') return false;
    
    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      if (!photo.title.toLowerCase().includes(query) &&
          !photo.description?.toLowerCase().includes(query) &&
          !photo.author.toLowerCase().includes(query) &&
          !photo.tags.some(tag => tag.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    // Category filter
    if (filterOptions.category !== 'all' && photo.category !== filterOptions.category) {
      return false;
    }
    
    // Tags filter
    if (filterOptions.tags.length > 0 && !filterOptions.tags.some(tag => photo.tags.includes(tag))) {
      return false;
    }
    
    // Author filter
    if (filterOptions.author && !photo.author.toLowerCase().includes(filterOptions.author.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    switch (filterOptions.sortBy) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'popular':
        return b.likes - a.likes;
      case 'trending':
        return (b.likes + b.comments + b.views) - (a.likes + a.comments + a.views);
      default:
        return 0;
    }
  });

  const paginatedPhotos = sortedPhotos.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  );

  const totalPages = Math.ceil(sortedPhotos.length / itemsPerPage);

  const openLightbox = $(async (photo: Photo) => {
    selectedPhoto.value = photo;
    isLightboxOpen.value = true;
    
    // Increment view count
    photo.views++;
    galleryStats.value.totalViews++;
  });

  const closeLightbox = $(() => {
    isLightboxOpen.value = false;
    selectedPhoto.value = undefined;
  });

  const toggleLike = $(async (photo: Photo) => {
    photo.isLiked = !photo.isLiked;
    photo.likes += photo.isLiked ? 1 : -1;
    galleryStats.value.totalLikes += photo.isLiked ? 1 : -1;
  });

  const toggleBookmark = $(async (photo: Photo) => {
    photo.isBookmarked = !photo.isBookmarked;
  });

  const sharePhoto = $(async (photo: Photo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: photo.description,
          url: window.location.href + '#photo-' + photo.id
        });
      } catch (error) {
        console.warn('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href + '#photo-' + photo.id);
    }
  });

  const downloadPhoto = $(async (photo: Photo) => {
    const link = document.createElement('a');
    link.download = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    link.href = photo.url;
    link.click();
  });

  const navigatePhotos = $(async (direction: 'prev' | 'next') => {
    if (!selectedPhoto.value) return;
    
    const currentIndex = sortedPhotos.findIndex(p => p.id === selectedPhoto.value?.id);
    let newIndex = currentIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : sortedPhotos.length - 1;
    } else {
      newIndex = currentIndex < sortedPhotos.length - 1 ? currentIndex + 1 : 0;
    }
    
    selectedPhoto.value = sortedPhotos[newIndex];
    selectedPhoto.value.views++;
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div class="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div class="text-center space-y-4">
        <h1 class="text-4xl font-bold text-wedding-brown">Wedding Photo Gallery</h1>
        <p class="text-lg text-wedding-text-muted max-w-2xl mx-auto">
          Relive our special moments through the eyes of our beloved friends and family
        </p>
      </div>

      {/* Stats Bar */}
      {showStats && (
        <Card class="p-6 bg-gradient-to-r from-wedding-cream to-white">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-wedding-brown">
                {formatNumber(galleryStats.value.totalPhotos)}
              </div>
              <div class="text-sm text-wedding-text-muted">Photos</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-pink-600">
                {formatNumber(galleryStats.value.totalLikes)}
              </div>
              <div class="text-sm text-wedding-text-muted">Likes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {formatNumber(galleryStats.value.totalComments)}
              </div>
              <div class="text-sm text-wedding-text-muted">Comments</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">
                {formatNumber(galleryStats.value.totalViews)}
              </div>
              <div class="text-sm text-wedding-text-muted">Views</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">
                {formatNumber(galleryStats.value.featuredPhotos)}
              </div>
              <div class="text-sm text-wedding-text-muted">Featured</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {categories.length - 1}
              </div>
              <div class="text-sm text-wedding-text-muted">Categories</div>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={activeTab.value} onValueChange$={(value) => activeTab.value = value}>
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" class="space-y-6">
          {/* Search and Filters */}
          <div class="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div class="flex-1 relative">
              <LuSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search photos, authors, or tags..."
                value={searchQuery.value}
                onInput$={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
                class="pl-10"
              />
            </div>

            {/* Category Filter */}
            {showFilters && (
              <div class="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={filterOptions.category === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick$={() => filterOptions.category = category.id}
                    class="flex items-center gap-1"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    {galleryStats.value.categories[category.id] && (
                      <Badge variant="secondary" class="text-xs">
                        {galleryStats.value.categories[category.id]}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}

            {/* View Mode and Sort */}
            <div class="flex items-center gap-2">
              <select
                value={filterOptions.sortBy}
                onChange$={(e) => filterOptions.sortBy = (e.target as HTMLSelectElement).value as FilterOptions['sortBy']}
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
              
              <div class="flex gap-1">
                <Button
                  variant={filterOptions.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick$={() => filterOptions.viewMode = 'grid'}
                >
                  <LuGrid3x3 class="w-4 h-4" />
                </Button>
                <Button
                  variant={filterOptions.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick$={() => filterOptions.viewMode = 'list'}
                >
                  <LuList class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Photo Grid */}
          {paginatedPhotos.length > 0 ? (
            <div class={`
              ${filterOptions.viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4' : 
                filterOptions.viewMode === 'list' ? 'space-y-4' : 
                'columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-4'}
            `}>
              {paginatedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  class={`
                    ${filterOptions.viewMode === 'list' ? 'flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow' :
                      'group relative overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer'}
                  `}
                  onClick$={() => openLightbox(photo)}
                >
                  {/* Photo */}
                  <div class={filterOptions.viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'}>
                    <img
                      src={photo.thumbnail}
                      alt={photo.title}
                      width="200"
                      height="200"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    {filterOptions.viewMode !== 'list' && (
                      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <LuEye class="w-8 h-8 text-white" />
                      </div>
                    )}

                    {/* Featured Badge */}
                    {photo.featured && (
                      <div class="absolute top-2 left-2">
                        <Badge variant="secondary" class="text-xs bg-yellow-500 text-white">
                          <LuStar class="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Photo Info */}
                  <div class={filterOptions.viewMode === 'list' ? 'flex-1' : 'p-3'}>
                    <h3 class="font-medium text-sm truncate">{photo.title}</h3>
                    <p class="text-xs text-gray-600 truncate">{photo.author}</p>
                    
                    {/* Stats */}
                    <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span class="flex items-center gap-1">
                        <LuHeart class="w-3 h-3" />
                        {formatNumber(photo.likes)}
                      </span>
                      <span class="flex items-center gap-1">
                        <LuMessageCircle class="w-3 h-3" />
                        {formatNumber(photo.comments)}
                      </span>
                      <span class="flex items-center gap-1">
                        <LuEye class="w-3 h-3" />
                        {formatNumber(photo.views)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div class="text-center py-12">
              <LuCamera class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
              <p class="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div class="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick$={() => currentPage.value = Math.max(1, currentPage.value - 1)}
                disabled={currentPage.value === 1}
              >
                <LuChevronLeft class="w-4 h-4" />
                Previous
              </Button>
              
              <div class="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage.value === page ? 'default' : 'outline'}
                      size="sm"
                      onClick$={() => currentPage.value = page}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick$={() => currentPage.value = Math.min(totalPages, currentPage.value + 1)}
                disabled={currentPage.value === totalPages}
              >
                Next
                <LuChevronRight class="w-4 h-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPhotos
              .filter(p => p.status === 'approved')
              .slice(0, 9)
              .map((photo) => (
                <Card key={photo.id} class="overflow-hidden hover:shadow-lg transition-shadow">
                  <div class="aspect-square relative">
                    <img
                      src={photo.thumbnail}
                      alt={photo.title}
                      width="400"
                      height="400"
                      class="w-full h-full object-cover"
                    />
                    <div class="absolute top-2 right-2">
                      <Badge variant="secondary" class="bg-orange-500 text-white">
                        <LuTrendingUp class="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    </div>
                  </div>
                  <div class="p-4">
                    <h3 class="font-medium truncate">{photo.title}</h3>
                    <p class="text-sm text-gray-600">{photo.author}</p>
                    <div class="flex items-center justify-between mt-2">
                      <div class="flex items-center gap-2 text-sm text-gray-500">
                        <span class="flex items-center gap-1">
                          <LuHeart class="w-3 h-3" />
                          {formatNumber(photo.likes)}
                        </span>
                        <span class="flex items-center gap-1">
                          <LuEye class="w-3 h-3" />
                          {formatNumber(photo.views)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick$={() => openLightbox(photo)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" class="space-y-6">
          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
            <div class="space-y-3">
              {galleryStats.value.recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div class="w-8 h-8 bg-wedding-accent rounded-full flex items-center justify-center text-white text-sm">
                    {activity.type === 'photo' ? '📷' : activity.type === 'like' ? '❤️' : '💬'}
                  </div>
                  <div class="flex-1">
                    <p class="text-sm">
                      <span class="font-medium">{activity.user}</span>
                      {activity.type === 'photo' && ' uploaded a new photo'}
                      {activity.type === 'like' && ' liked a photo'}
                      {activity.type === 'comment' && ' commented on a photo'}
                    </p>
                    <p class="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lightbox */}
      {isLightboxOpen.value && selectedPhoto.value && (
        <div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div class="relative max-w-6xl max-h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick$={closeLightbox}
              class="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            >
              <LuX class="w-6 h-6" />
            </Button>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="sm"
              onClick$={() => navigatePhotos('prev')}
              class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
            >
              <LuChevronLeft class="w-8 h-8" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick$={() => navigatePhotos('next')}
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
            >
              <LuChevronRight class="w-8 h-8" />
            </Button>

            {/* Photo */}
            <img
              src={selectedPhoto.value.url}
              alt={selectedPhoto.value.title}
              width="1200"
              height="900"
              class="max-w-full max-h-full object-contain"
            />

            {/* Photo Info */}
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div class="text-white space-y-2">
                <h2 class="text-xl font-semibold">{selectedPhoto.value.title}</h2>
                {selectedPhoto.value.description && (
                  <p class="text-sm opacity-90">{selectedPhoto.value.description}</p>
                )}
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 text-sm">
                    <span>by {selectedPhoto.value.author}</span>
                    <span>{formatDate(selectedPhoto.value.timestamp)}</span>
                    {selectedPhoto.value.location && (
                      <span class="flex items-center gap-1">
                        <LuMapPin class="w-3 h-3" />
                        {selectedPhoto.value.location}
                      </span>
                    )}
                  </div>

                  <div class="flex items-center gap-2">
                    {allowLikes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick$={() => toggleLike(selectedPhoto.value!)}
                        class={`text-white hover:bg-white/20 ${selectedPhoto.value.isLiked ? 'text-red-500' : ''}`}
                      >
                        <LuHeart class={`w-4 h-4 ${selectedPhoto.value.isLiked ? 'fill-current' : ''}`} />
                        {formatNumber(selectedPhoto.value.likes)}
                      </Button>
                    )}

                    {allowSharing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick$={() => sharePhoto(selectedPhoto.value!)}
                        class="text-white hover:bg-white/20"
                      >
                        <LuShare2 class="w-4 h-4" />
                      </Button>
                    )}

                    {allowDownloads && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick$={() => downloadPhoto(selectedPhoto.value!)}
                        class="text-white hover:bg-white/20"
                      >
                        <LuDownload class="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick$={() => toggleBookmark(selectedPhoto.value!)}
                      class={`text-white hover:bg-white/20 ${selectedPhoto.value.isBookmarked ? 'text-yellow-500' : ''}`}
                    >
                      <LuBookmark class={`w-4 h-4 ${selectedPhoto.value.isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PublicPhotoGallery;