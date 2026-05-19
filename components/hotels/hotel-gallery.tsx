"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Grid3X3 } from "lucide-react"
import type { HotelImage } from "@/lib/types"
import { getMediaUrl } from "@/lib/utils/media"

interface HotelGalleryProps {
  images: HotelImage[]
  hotelName: string
}

export function HotelGallery({ images, hotelName }: HotelGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            id: "placeholder",
            hotel_id: "",
            image_url: "/comfortable-hotel-room.png",
            alt_text: "Hotel room",
            is_primary: true,
            display_order: 0,
            created_at: "",
          },
        ]

  const primaryImage = displayImages.find((img) => img.is_primary) || displayImages[0]
  const secondaryImages = displayImages.filter((img) => img.id !== primaryImage.id).slice(0, 4)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
        {/* Primary Image */}
        <button
          onClick={() => {
            setCurrentIndex(0)
            setIsOpen(true)
          }}
          className="relative col-span-2 row-span-2 overflow-hidden rounded-l-xl focus:outline-none focus:ring-2 focus:ring-primary md:rounded-xl"
        >
          <img
            src={getMediaUrl(primaryImage.image_url) || "/placeholder.svg"}
            alt={primaryImage.alt_text || hotelName}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </button>

        {/* Secondary Images */}
        {secondaryImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => {
              setCurrentIndex(index + 1)
              setIsOpen(true)
            }}
            className="relative hidden aspect-[4/3] overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary md:block"
          >
            <img
              src={getMediaUrl(image.image_url) || "/placeholder.svg"}
              alt={image.alt_text || `${hotelName} - ${index + 2}`}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}

        {/* Show All Button */}
        {displayImages.length > 5 && (
          <button
            onClick={() => setIsOpen(true)}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-background/90 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur transition-colors hover:bg-background"
          >
            <Grid3X3 className="h-4 w-4" />
            Show all {displayImages.length} photos
          </button>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">Image Gallery for {hotelName}</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>

            <div className="relative aspect-[4/3]">
              <img
                src={getMediaUrl(displayImages[currentIndex].image_url) || "/placeholder.svg"}
                alt={displayImages[currentIndex].alt_text || `${hotelName} - ${currentIndex + 1}`}
                className="h-full w-full object-contain"
              />
            </div>

            {displayImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next image</span>
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-sm backdrop-blur">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
