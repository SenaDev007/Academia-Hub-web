/**
 * Utilitaires pour la compression et l'optimisation des images
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 à 1.0
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressionResult {
  compressedDataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compresse une image avec les options spécifiées
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculer les nouvelles dimensions en gardant le ratio
        let { width, height } = img;
        
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

        // Redimensionner le canvas
        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression
        const mimeType = `image/${format}`;
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);

        // Calculer les tailles
        const originalSize = file.size;
        const compressedSize = Math.round((compressedDataUrl.length - 22) * 3 / 4); // Approximation de la taille base64
        const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

        resolve({
          compressedDataUrl,
          originalSize,
          compressedSize,
          compressionRatio
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    // Charger l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Valide qu'un fichier est une image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Valide la taille d'un fichier
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Génère un aperçu d'image optimisé
 */
export function createImagePreview(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculer les dimensions de l'aperçu
        let { width, height } = img;
        
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

        // Dessiner l'aperçu
        ctx?.drawImage(img, 0, 0, width, height);

        // Retourner l'aperçu en base64
        const previewDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(previewDataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image pour l\'aperçu'));
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Optimise les performances en créant un worker pour la compression
 */
export class ImageCompressionWorker {
  private worker: Worker | null = null;

  constructor() {
    if (typeof Worker !== 'undefined') {
      // Créer un worker pour la compression (optionnel)
      // this.worker = new Worker('/workers/imageCompression.worker.js');
    }
  }

  async compressImageAsync(file: File, options: CompressionOptions = {}): Promise<CompressionResult> {
    if (this.worker) {
      // Utiliser le worker si disponible
      return new Promise((resolve, reject) => {
        this.worker!.onmessage = (e) => {
          resolve(e.data);
        };
        this.worker!.onerror = reject;
        this.worker!.postMessage({ file, options });
      });
    } else {
      // Fallback vers la compression synchrone
      return compressImage(file, options);
    }
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

/**
 * Hook React pour la compression d'images
 */
export function useImageCompression() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const compressImageWithProgress = async (
    file: File,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> => {
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      // Simuler le progrès (dans une vraie implémentation, ceci viendrait du worker)
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await compressImage(file, options);
      
      clearInterval(progressInterval);
      setCompressionProgress(100);
      
      return result;
    } catch (error) {
      setCompressionProgress(0);
      throw error;
    } finally {
      setIsCompressing(false);
      setTimeout(() => setCompressionProgress(0), 500);
    }
  };

  return {
    compressImage: compressImageWithProgress,
    isCompressing,
    compressionProgress
  };
}

// Import React pour le hook
import { useState } from 'react';
