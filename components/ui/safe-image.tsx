"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { ImageOff } from "lucide-react"

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackSrc?: string
  fallbackElement?: React.ReactNode
  aspectRatio?: "square" | "video" | "portrait" | "auto" | string
  objectFit?: "cover" | "contain" | "fill" | "none"
  showLoadingState?: boolean
  maxRetries?: number
  onLoadSuccess?: () => void
  onLoadError?: (error: Error) => void
}

const DEFAULT_PLACEHOLDER = "/placeholder.svg?height=300&width=400&query=image"

// Predefined aspect ratios
const aspectRatios: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "",
}

/**
 * SafeImage - A robust image component with graceful error handling
 * 
 * Features:
 * - Graceful fallback to placeholder on error
 * - Prevents infinite refresh loops with error state tracking
 * - Loading state with skeleton
 * - Retry mechanism with configurable max attempts
 * - Responsive and accessible
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  fallbackElement,
  aspectRatio = "auto",
  objectFit = "cover",
  showLoadingState = true,
  maxRetries = 0, // Default to 0 retries to prevent loops
  onLoadSuccess,
  onLoadError,
  className,
  ...props
}: SafeImageProps) {
  // Track error state per src to prevent infinite loops
  const erroredSrcs = useRef<Set<string>>(new Set())
  
  // Determine initial src - skip if already errored
  const getInitialSrc = () => {
    if (!src || erroredSrcs.current.has(src)) {
      return fallbackSrc
    }
    return src
  }

  const [currentSrc, setCurrentSrc] = useState<string>(getInitialSrc)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showFallbackElement, setShowFallbackElement] = useState(false)
  const retryCount = useRef(0)
  const hasAttemptedFallback = useRef(false)

  // Reset state when src changes (but only if it's a new, non-errored src)
  useEffect(() => {
    if (src && src !== currentSrc && !erroredSrcs.current.has(src)) {
      setCurrentSrc(src)
      setIsLoading(true)
      setHasError(false)
      setShowFallbackElement(false)
      retryCount.current = 0
      hasAttemptedFallback.current = false
    }
  }, [src, currentSrc])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoadSuccess?.()
  }, [onLoadSuccess])

  const handleError = useCallback(() => {
    setIsLoading(false)
    
    // Mark this src as errored to prevent future attempts
    if (src) {
      erroredSrcs.current.add(src)
    }
    if (currentSrc && currentSrc !== fallbackSrc) {
      erroredSrcs.current.add(currentSrc)
    }
    
    // If we haven't tried fallback yet and it's different from current
    if (!hasAttemptedFallback.current && fallbackSrc && currentSrc !== fallbackSrc) {
      hasAttemptedFallback.current = true
      setCurrentSrc(fallbackSrc)
      return
    }

    // All attempts failed - show error state (no more retries)
    setHasError(true)
    setShowFallbackElement(true)
    onLoadError?.(new Error(`Failed to load image: ${src}`))
  }, [src, fallbackSrc, currentSrc, onLoadError])

  const aspectClass = aspectRatios[aspectRatio] || aspectRatio

  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
  }[objectFit]

  // Show custom fallback element if provided and all loading attempts failed
  if (showFallbackElement && fallbackElement) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", aspectClass, className)}>
        {fallbackElement}
      </div>
    )
  }

  // Show default error state
  if (showFallbackElement && !fallbackElement) {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-muted",
          aspectClass,
          className
        )}
        role="img"
        aria-label={alt}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", aspectClass, className)}>
      {/* Loading skeleton */}
      {showLoadingState && isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      
      {/* Image */}
      <img
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "h-full w-full transition-opacity duration-300",
          objectFitClass,
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "hidden"
        )}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  )
}

/**
 * Avatar-specific safe image with circular styling
 */
export function SafeAvatar({
  src,
  alt,
  fallbackInitials,
  size = "md",
  className,
  ...props
}: Omit<SafeImageProps, "aspectRatio" | "fallbackElement"> & {
  fallbackInitials?: string
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  }

  return (
    <SafeImage
      src={src}
      alt={alt}
      aspectRatio="square"
      className={cn("rounded-full", sizeClasses[size], className)}
      fallbackElement={
        fallbackInitials ? (
          <div className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-medium",
            sizeClasses[size]
          )}>
            {fallbackInitials.slice(0, 2).toUpperCase()}
          </div>
        ) : undefined
      }
      {...props}
    />
  )
}

/**
 * Card image with hover zoom effect
 */
export function SafeCardImage({
  src,
  alt,
  enableHoverZoom = true,
  overlay,
  className,
  ...props
}: SafeImageProps & {
  enableHoverZoom?: boolean
  overlay?: React.ReactNode
}) {
  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <SafeImage
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full transition-transform duration-300",
          enableHoverZoom && "group-hover:scale-105"
        )}
        {...props}
      />
      {overlay && (
        <div className="absolute inset-0">
          {overlay}
        </div>
      )}
    </div>
  )
}
