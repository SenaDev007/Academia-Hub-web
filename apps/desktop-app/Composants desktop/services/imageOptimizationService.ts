import sharp from 'sharp';

export interface ImageOptimizationOptions {
  quality: number; // 0-100
  maxWidth: number;
  maxHeight: number;
  format: 'jpeg' | 'png' | 'webp';
  progressive: boolean;
  stripMetadata: boolean;
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: {
    original: { width: number; height: number };
    optimized: { width: number; height: number };
  };
}

class ImageOptimizationService {
  private defaultOptions: ImageOptimizationOptions = {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg',
    progressive: true,
    stripMetadata: true
  };

  async optimizeImage(
    imageBuffer: Buffer,
    mimeType: string,
    options: Partial<ImageOptimizationOptions> = {}
  ): Promise<Buffer> {
    try {
      const mergedOptions = { ...this.defaultOptions, ...options };
      
      // Vérifier si c'est une image
      if (!this.isImage(mimeType)) {
        console.warn('File is not an image, returning original buffer');
        return imageBuffer;
      }

      // Analyser l'image originale
      const originalMetadata = await sharp(imageBuffer).metadata();
      
      // Créer le pipeline Sharp
      let pipeline = sharp(imageBuffer);

      // Redimensionner si nécessaire
      if (originalMetadata.width && originalMetadata.height) {
        const { width, height } = this.calculateDimensions(
          originalMetadata.width,
          originalMetadata.height,
          mergedOptions.maxWidth,
          mergedOptions.maxHeight
        );
        
        if (width !== originalMetadata.width || height !== originalMetadata.height) {
          pipeline = pipeline.resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }
      }

      // Supprimer les métadonnées si demandé
      if (mergedOptions.stripMetadata) {
        pipeline = pipeline.withMetadata();
      }

      // Convertir au format demandé avec les options appropriées
      let optimizedBuffer: Buffer;
      
      switch (mergedOptions.format) {
        case 'jpeg':
          optimizedBuffer = await pipeline
            .jpeg({
              quality: mergedOptions.quality,
              progressive: mergedOptions.progressive,
              mozjpeg: true
            })
            .toBuffer();
          break;
          
        case 'png':
          optimizedBuffer = await pipeline
            .png({
              quality: mergedOptions.quality,
              progressive: mergedOptions.progressive,
              compressionLevel: 9
            })
            .toBuffer();
          break;
          
        case 'webp':
          optimizedBuffer = await pipeline
            .webp({
              quality: mergedOptions.quality,
              effort: 6
            })
            .toBuffer();
          break;
          
        default:
          optimizedBuffer = await pipeline
            .jpeg({
              quality: mergedOptions.quality,
              progressive: mergedOptions.progressive
            })
            .toBuffer();
      }

      console.log('Image optimization completed:', {
        originalSize: imageBuffer.length,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: ((imageBuffer.length - optimizedBuffer.length) / imageBuffer.length * 100).toFixed(2) + '%',
        mimeType,
        options: mergedOptions
      });

      return optimizedBuffer;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return imageBuffer; // Retourner l'original en cas d'erreur
    }
  }

  async optimizeStudentPhoto(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<Buffer> {
    const options: ImageOptimizationOptions = {
      quality: 80,
      maxWidth: 400,
      maxHeight: 400,
      format: 'jpeg',
      progressive: true,
      stripMetadata: true
    };

    return this.optimizeImage(imageBuffer, mimeType, options);
  }

  async optimizeDocumentImage(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<Buffer> {
    const options: ImageOptimizationOptions = {
      quality: 90,
      maxWidth: 1200,
      maxHeight: 1600,
      format: 'jpeg',
      progressive: true,
      stripMetadata: true
    };

    return this.optimizeImage(imageBuffer, mimeType, options);
  }

  async createThumbnail(
    imageBuffer: Buffer,
    mimeType: string,
    width: number = 150,
    height: number = 150
  ): Promise<Buffer> {
    try {
      const options: ImageOptimizationOptions = {
        quality: 70,
        maxWidth: width,
        maxHeight: height,
        format: 'jpeg',
        progressive: false,
        stripMetadata: true
      };

      return this.optimizeImage(imageBuffer, mimeType, options);
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return imageBuffer;
    }
  }

  async batchOptimize(
    images: Array<{ buffer: Buffer; mimeType: string; options?: Partial<ImageOptimizationOptions> }>
  ): Promise<Array<{ original: Buffer; optimized: Buffer; result: OptimizationResult }>> {
    const results = [];

    for (const image of images) {
      try {
        const optimized = await this.optimizeImage(
          image.buffer,
          image.mimeType,
          image.options
        );

        const result: OptimizationResult = {
          originalSize: image.buffer.length,
          optimizedSize: optimized.length,
          compressionRatio: ((image.buffer.length - optimized.length) / image.buffer.length) * 100,
          format: image.mimeType,
          dimensions: {
            original: { width: 0, height: 0 }, // Sera rempli par l'analyse Sharp
            optimized: { width: 0, height: 0 }
          }
        };

        results.push({
          original: image.buffer,
          optimized,
          result
        });
      } catch (error) {
        console.error('Error optimizing image in batch:', error);
        results.push({
          original: image.buffer,
          optimized: image.buffer,
          result: {
            originalSize: image.buffer.length,
            optimizedSize: image.buffer.length,
            compressionRatio: 0,
            format: image.mimeType,
            dimensions: { original: { width: 0, height: 0 }, optimized: { width: 0, height: 0 } }
          }
        });
      }
    }

    return results;
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  getSupportedFormats(): string[] {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  }

  getDefaultOptions(): ImageOptimizationOptions {
    return { ...this.defaultOptions };
  }

  updateDefaultOptions(newOptions: Partial<ImageOptimizationOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...newOptions };
  }

  // Méthode pour analyser une image (dimensions, taille, etc.)
  async analyzeImage(imageBuffer: Buffer): Promise<{
    width: number;
    height: number;
    size: number;
    format: string;
    hasTransparency: boolean;
  }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: imageBuffer.length,
        format: metadata.format || 'unknown',
        hasTransparency: metadata.hasAlpha || false
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        width: 0,
        height: 0,
        size: imageBuffer.length,
        format: 'unknown',
        hasTransparency: false
      };
    }
  }

  // Méthode pour convertir le format d'une image
  async convertFormat(
    imageBuffer: Buffer,
    targetFormat: 'jpeg' | 'png' | 'webp',
    options?: Partial<ImageOptimizationOptions>
  ): Promise<Buffer> {
    try {
      const mergedOptions = { ...this.defaultOptions, ...options, format: targetFormat };
      return this.optimizeImage(imageBuffer, `image/${targetFormat}`, mergedOptions);
    } catch (error) {
      console.error('Error converting image format:', error);
      return imageBuffer;
    }
  }

  // Méthode pour redimensionner une image
  async resizeImage(
    imageBuffer: Buffer,
    mimeType: string,
    targetWidth: number,
    targetHeight: number,
    maintainAspectRatio: boolean = true
  ): Promise<Buffer> {
    try {
      const options: ImageOptimizationOptions = {
        ...this.defaultOptions,
        maxWidth: targetWidth,
        maxHeight: targetHeight
      };

      return this.optimizeImage(imageBuffer, mimeType, options);
    } catch (error) {
      console.error('Error resizing image:', error);
      return imageBuffer;
    }
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Calculer le ratio d'aspect
    const aspectRatio = originalWidth / originalHeight;

    // Redimensionner en respectant les contraintes
    if (width > maxWidth) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }

    return { width, height };
  }

  // Méthode pour créer une vignette avec effet de flou
  async createBlurredThumbnail(
    imageBuffer: Buffer,
    mimeType: string,
    width: number = 150,
    height: number = 150,
    blurRadius: number = 5
  ): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(width, height, { fit: 'cover' })
        .blur(blurRadius)
        .jpeg({ quality: 60 })
        .toBuffer();
    } catch (error) {
      console.error('Error creating blurred thumbnail:', error);
      return imageBuffer;
    }
  }

  // Méthode pour ajouter un filigrane
  async addWatermark(
    imageBuffer: Buffer,
    watermarkText: string,
    options: {
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
      fontSize?: number;
      color?: string;
      opacity?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      const {
        position = 'bottom-right',
        fontSize = 24,
        color = '#ffffff',
        opacity = 0.7
      } = options;

      // Créer le texte du filigrane
      const svgText = `
        <svg width="200" height="50">
          <text x="10" y="35" font-family="Arial" font-size="${fontSize}" fill="${color}" opacity="${opacity}">
            ${watermarkText}
          </text>
        </svg>
      `;

      const watermarkBuffer = Buffer.from(svgText);

      return await sharp(imageBuffer)
        .composite([{
          input: watermarkBuffer,
          gravity: position
        }])
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch (error) {
      console.error('Error adding watermark:', error);
      return imageBuffer;
    }
  }
}

export const imageOptimizationService = new ImageOptimizationService();
