import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'

export const ImagesSlider = ({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  direction = 'up',
}: {
  images: string[]
  children: React.ReactNode
  overlay?: boolean
  overlayClassName?: string
  className?: string
  autoplay?: boolean
  direction?: 'up' | 'down'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true) // Start with loading state true
  const [loadedImages, setLoadedImages] = useState<string[]>([])

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    )
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    )
  }

  const loadImages = () => {
    setLoading(true)
    const loadPromises = images.map((image) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.src = image
        img.onload = () => resolve(image)
        img.onerror = reject
      })
    })

    Promise.all(loadPromises)
      .then((loadedImages) => {
        setLoadedImages(loadedImages)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load images', error)
        setLoading(false) // Ensure loading state is set to false on error
      })
  }

  useEffect(() => {
    loadImages()
  }, []) // Load images on component mount

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNext()
      } else if (event.key === 'ArrowLeft') {
        handlePrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Clean-up
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleNext, handlePrevious]) // Include handleNext and handlePrevious in dependencies

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (autoplay) {
      interval = setInterval(() => {
        handleNext()
      }, 5000)
    }

    // Clean-up
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoplay, handleNext]) // Include autoplay and handleNext in dependencies

  const slideVariants = {
    initial: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.645, 0.045, 0.355, 1.0],
      },
    },
    upExit: {
      opacity: 0,
      y: '-100%',
      transition: {
        duration: 1,
      },
    },
    downExit: {
      opacity: 0,
      y: '100%',
      transition: {
        duration: 1,
      },
    },
  }

  const areImagesLoaded = loadedImages.length === images.length && !loading

  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        className,
      )}
      style={{
        perspective: '1000px',
      }}
    >
      {areImagesLoaded && children}

      {areImagesLoaded && overlay && (
        <div
          className={cn('absolute inset-0 z-40 bg-black/60', overlayClassName)}
        />
      )}

      <AnimatePresence>
        {areImagesLoaded && (
          <motion.img
            key={currentIndex}
            src={loadedImages[currentIndex]}
            initial="initial"
            animate="visible"
            exit={direction === 'up' ? 'upExit' : 'downExit'}
            variants={slideVariants}
            className="image absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
