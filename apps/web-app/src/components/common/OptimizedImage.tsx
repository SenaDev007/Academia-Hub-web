import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  placeholder?: string;
  onError?: () => void;
  onLoad?: () => void;
  lazy?: boolean;
  quality?: number; // 0.1 à 1.0
  maxWidth?: number;
  maxHeight?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "w-10 h-10 rounded-full object-cover",
  fallbackClassName = "w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center",
  placeholder,
  onError,
  onLoad,
  lazy = true,
  quality = 0.8,
  maxWidth = 200,
  maxHeight = 200
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fonction pour compresser l'image
  const compressImage = (base64: string, quality: number, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculer les nouvelles dimensions en gardant le ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        } else {
          resolve(base64); // Fallback si canvas n'est pas supporté
        }
      };
      img.onerror = () => resolve(base64); // Fallback en cas d'erreur
      img.src = base64;
    });
  };

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy]);

  // Chargement et compression de l'image
  useEffect(() => {
    if (!isInView || !src) return;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Si c'est une image base64, on la compresse
        if (src.startsWith('data:image/')) {
          const compressedSrc = await compressImage(src, quality, maxWidth, maxHeight);
          setImageSrc(compressedSrc);
        } else {
          setImageSrc(src);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'image:', error);
        setHasError(true);
        onError?.();
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [isInView, src, quality, maxWidth, maxHeight, onError]);

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Affichage du placeholder pendant le chargement
  if (isLoading && !hasError) {
    return (
      <div ref={imgRef} className={fallbackClassName}>
        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full w-full h-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur ou du fallback
  if (hasError || !imageSrc) {
    return (
      <div className={fallbackClassName}>
        {placeholder ? (
          <span className="text-white text-xs font-medium">{placeholder}</span>
        ) : (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    );
  }

  // Affichage de l'image optimisée
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading={lazy ? "lazy" : "eager"}
    />
  );
};

export default OptimizedImage;
