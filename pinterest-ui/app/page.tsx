"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Heart, Share, Download, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Enhanced mock data with more varied orientations
const generateMockImages = (startIndex: number, count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const id = startIndex + i

    // Balanced mix ensuring good distribution
    const orientations = [
      { width: 300, height: 400, type: "portrait" },
      { width: 300, height: 350, type: "portrait" },
      { width: 300, height: 450, type: "portrait" },
      { width: 400, height: 250, type: "landscape" },
      { width: 300, height: 380, type: "portrait" },
      { width: 300, height: 320, type: "portrait" },
      { width: 500, height: 300, type: "landscape" },
      { width: 300, height: 500, type: "portrait" },
      { width: 300, height: 360, type: "portrait" },
      { width: 450, height: 280, type: "landscape" },
    ]

    const orientation = orientations[i % orientations.length]
    const aspectRatio = orientation.width / orientation.height

    return {
      id,
      src: `/placeholder.svg?height=${orientation.height}&width=${orientation.width}`,
      alt: `Beautiful ${orientation.type} image ${id}`,
      title: `${orientation.type === "landscape" ? "Panoramic" : "Portrait"} Photo ${id}`,
      author: `Photographer ${(id % 10) + 1}`,
      avatar: `/placeholder.svg?height=40&width=40`,
      likes: Math.floor(Math.random() * 1000) + 10,
      width: orientation.width,
      height: orientation.height,
      aspectRatio,
      orientation: orientation.type,
      description: `This is a stunning ${orientation.type} photograph that captures incredible detail and composition. Photo ${id} showcases the beauty of ${orientation.type} photography.`,
    }
  })
}

interface ImageData {
  id: number
  src: string
  alt: string
  title: string
  author: string
  avatar: string
  likes: number
  width: number
  height: number
  aspectRatio: number
  orientation: "portrait" | "landscape"
  description: string
}

interface GridItem extends ImageData {
  gridColumn: string
  gridRow: number
  displayHeight: number
  rowSpan: number
}

interface ImageCardProps {
  image: GridItem
  onClick: (image: ImageData) => void
}

function ImageCard({ image, onClick }: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isLandscape = image.orientation === "landscape"

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white"
      style={{
        gridColumn: image.gridColumn,
        gridRow: `${image.gridRow} / span ${image.rowSpan}`,
      }}
      onClick={() => onClick(image)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full">
        <img
          src={image.src || "/placeholder.svg"}
          alt={image.alt}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } ${isHovered ? "scale-105" : "scale-100"}`}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Loading skeleton */}
        {!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

        {/* Landscape indicator */}
        {isLandscape && (
          <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
            Landscape
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-black backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              Save
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-white">
              <Avatar className="w-6 h-6">
                <AvatarImage src={image.avatar || "/placeholder.svg"} alt={image.author} />
                <AvatarFallback>{image.author[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium drop-shadow-sm">{image.author}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface ImageModalProps {
  image: ImageData | null
  isOpen: boolean
  onClose: () => void
}

function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  if (!image || !isOpen) return null

  const getModalLayout = () => {
    if (image.orientation === "landscape") {
      return {
        containerClass: "max-w-6xl",
        imageContainerClass: "flex-1 flex items-center justify-center bg-gray-50 min-h-[60vh]",
        imageClass: "max-w-full max-h-[70vh] object-contain",
        sidebarClass: "lg:w-80 p-6 flex flex-col",
        flexDirection: "flex-col lg:flex-row" as const,
      }
    } else {
      return {
        containerClass: "max-w-4xl",
        imageContainerClass: "flex-1 flex items-center justify-center bg-gray-50",
        imageClass: "max-w-full max-h-[60vh] lg:max-h-[80vh] object-contain",
        sidebarClass: "lg:w-80 p-6 flex flex-col",
        flexDirection: "flex-col lg:flex-row" as const,
      }
    }
  }

  const layout = getModalLayout()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className={`relative ${layout.containerClass} max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className={layout.flexDirection}>
          <div className={layout.imageContainerClass}>
            <img src={image.src || "/placeholder.svg"} alt={image.alt} className={layout.imageClass} />
          </div>

          <div className={layout.sidebarClass}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={image.avatar || "/placeholder.svg"} alt={image.author} />
                  <AvatarFallback>{image.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{image.author}</h3>
                  <p className="text-sm text-gray-600">Photographer</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Follow
              </Button>
            </div>

            <h2 className="text-xl font-bold mb-2">{image.title}</h2>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="capitalize">{image.orientation}</span>
              <span>•</span>
              <span>
                {image.width} × {image.height}
              </span>
              <span>•</span>
              <span>{image.aspectRatio.toFixed(2)}:1</span>
            </div>

            <p className="text-gray-600 mb-6">{image.description}</p>

            <div className="flex items-center gap-2 mb-6">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Heart className="w-4 h-4 mr-2" />
                {image.likes}
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <Button className="w-full mb-4">Save to Board</Button>

            {image.orientation === "landscape" && (
              <div className="text-xs text-gray-500 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-700">Perfect Fit:</strong> This landscape image seamlessly integrates into
                the grid layout, spanning two columns with portrait photos filling surrounding spaces.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface PerfectGridProps {
  images: ImageData[]
  onImageClick: (image: ImageData) => void
}

function PerfectGrid({ images, onImageClick }: PerfectGridProps) {
  const [columns, setColumns] = useState(4)
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [rowHeight, setRowHeight] = useState(20)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(1)
      else if (width < 768) setColumns(2)
      else if (width < 1024) setColumns(3)
      else setColumns(4)
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  useEffect(() => {
    const layoutImages = () => {
      if (images.length === 0) return

      const baseWidth = 280
      const gap = 16
      const items: GridItem[] = []

      // Create a grid matrix to track occupied cells
      const maxRows = Math.ceil(images.length * 2) // Generous row estimate
      const grid: boolean[][] = Array(maxRows)
        .fill(null)
        .map(() => Array(columns).fill(false))

      // Helper function to find next available position
      const findNextPosition = (colSpan: number, minRowSpan: number) => {
        for (let row = 0; row < maxRows - minRowSpan; row++) {
          for (let col = 0; col <= columns - colSpan; col++) {
            // Check if the area is free
            let canPlace = true
            for (let r = row; r < row + minRowSpan && canPlace; r++) {
              for (let c = col; c < col + colSpan && canPlace; c++) {
                if (grid[r][c]) canPlace = false
              }
            }
            if (canPlace) return { row, col }
          }
        }
        return { row: maxRows - minRowSpan, col: 0 } // Fallback
      }

      // Helper function to mark grid cells as occupied
      const markOccupied = (row: number, col: number, colSpan: number, rowSpan: number) => {
        for (let r = row; r < row + rowSpan; r++) {
          for (let c = col; c < col + colSpan; c++) {
            if (r < maxRows && c < columns) {
              grid[r][c] = true
            }
          }
        }
      }

      images.forEach((image) => {
        const isLandscape = image.orientation === "landscape"
        let colSpan = 1
        let displayHeight = Math.floor(baseWidth / image.aspectRatio)

        if (isLandscape && columns > 1) {
          colSpan = 2
          displayHeight = Math.floor((baseWidth * 2 + gap) / image.aspectRatio)
        }

        // Calculate row span based on display height
        const rowSpan = Math.max(1, Math.ceil(displayHeight / rowHeight))

        // Find the best position
        const { row, col } = findNextPosition(colSpan, rowSpan)

        // Mark the area as occupied
        markOccupied(row, col, colSpan, rowSpan)

        const gridColumn = colSpan === 1 ? `${col + 1}` : `${col + 1} / span ${colSpan}`

        items.push({
          ...image,
          gridColumn,
          gridRow: row + 1,
          displayHeight,
          rowSpan,
        })
      })

      setGridItems(items)
    }

    if (images.length > 0) {
      layoutImages()
    }
  }, [images, columns, rowHeight])

  if (columns === 1) {
    // Mobile: Simple single column layout
    return (
      <div className="flex flex-col gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={{
              ...image,
              gridColumn: "1",
              gridRow: 1,
              displayHeight: Math.floor(280 / image.aspectRatio),
              rowSpan: 1,
            }}
            onClick={onImageClick}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(auto-fit, ${rowHeight}px)`,
        gridAutoRows: `${rowHeight}px`,
      }}
    >
      {gridItems.map((item) => (
        <ImageCard key={item.id} image={item} onClick={onImageClick} />
      ))}
    </div>
  )
}

export default function PinterestUI() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [page, setPage] = useState(0)

  const loadMoreImages = useCallback(async () => {
    if (loading) return

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newImages = generateMockImages(page * 20, 20)
    setImages((prev) => [...prev, ...newImages])
    setPage((prev) => prev + 1)
    setLoading(false)
  }, [loading, page])

  useEffect(() => {
    loadMoreImages()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreImages()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadMoreImages])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-600">Pinterest</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">Explore</Button>
            <Button variant="ghost">Create</Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Perfect Grid Layout */}
        <PerfectGrid images={images} onImageClick={setSelectedImage} />

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Image Modal */}
      <ImageModal image={selectedImage} isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  )
}
