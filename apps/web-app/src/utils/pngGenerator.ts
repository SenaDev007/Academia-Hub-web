import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';

export interface PNGGeneratorOptions {
  format?: 'png' | 'jpg';
  quality?: number;
  result?: 'base64' | 'tmpfile' | 'data-uri';
}

export class PNGGenerator {
  /**
   * Convertit un composant React en image PNG
   */
  static async generatePNG(
    componentRef: React.RefObject<any>,
    options: PNGGeneratorOptions = {}
  ): Promise<string> {
    const defaultOptions = {
      format: 'png' as const,
      quality: 1.0,
      result: 'base64' as const,
      ...options
    };

    try {
      if (Platform.OS === 'web') {
        // Pour le web, on utilise html2canvas
        return await this.generatePNGWeb(componentRef, defaultOptions);
      } else {
        // Pour React Native, on utilise react-native-view-shot
        return await captureRef(componentRef, defaultOptions);
      }
    } catch (error) {
      console.error('Erreur lors de la génération PNG:', error);
      throw new Error('Impossible de générer l\'image PNG');
    }
  }

  /**
   * Génère une image PNG pour le web en utilisant html2canvas
   */
  private static async generatePNGWeb(
    componentRef: React.RefObject<any>,
    options: PNGGeneratorOptions
  ): Promise<string> {
    // Import dynamique d'html2canvas pour éviter les erreurs SSR
    const html2canvas = (await import('html2canvas')).default;
    
    if (!componentRef.current) {
      throw new Error('Référence du composant non trouvée');
    }

    const canvas = await html2canvas(componentRef.current, {
      backgroundColor: '#ffffff',
      scale: 2, // Haute résolution
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    return canvas.toDataURL('image/png', options.quality);
  }

  /**
   * Génère un nom de fichier pour l'image PNG
   */
  static generatePNGFilename(receiptNumber: string, studentName: string): string {
    const cleanStudentName = studentName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toUpperCase();
    
    return `${receiptNumber}-${cleanStudentName}.png`;
  }

  /**
   * Ouvre WhatsApp avec l'image PNG
   */
  static async shareToWhatsApp(
    imageData: string,
    filename: string,
    phoneNumber?: string
  ): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Pour le web, on télécharge l'image
        this.downloadImage(imageData, filename);
      } else {
        // Pour React Native, on utilise le système de partage
        const { share } = await import('react-native');
        await share({
          title: 'Reçu de paiement',
          message: `Reçu de paiement: ${filename}`,
          url: imageData,
        });
      }
    } catch (error) {
      console.error('Erreur lors du partage WhatsApp:', error);
      throw new Error('Impossible de partager vers WhatsApp');
    }
  }

  /**
   * Télécharge l'image sur le web
   */
  private static downloadImage(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Ouvre WhatsApp Web avec l'image
   */
  static openWhatsAppWeb(imageData: string, phoneNumber?: string): void {
    const message = 'Voici le reçu de paiement:';
    const whatsappUrl = phoneNumber 
      ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    // Ouvrir WhatsApp Web
    window.open(whatsappUrl, '_blank');
    
    // Instructions pour l'utilisateur
    setTimeout(() => {
      alert('WhatsApp Web s\'ouvre. Vous pouvez maintenant glisser-déposer l\'image du reçu dans la conversation.');
    }, 1000);
  }
}
