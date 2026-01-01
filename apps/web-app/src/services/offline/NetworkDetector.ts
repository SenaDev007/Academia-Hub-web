interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

type NetworkCallback = (isOnline: boolean, status: NetworkStatus) => void;

export class NetworkDetector {
  private static instance: NetworkDetector;
  private callbacks: NetworkCallback[] = [];
  private currentStatus: NetworkStatus;
  private checkInterval: number | null = null;
  private lastPingTime = 0;
  private pingUrl = '/api/ping';

  private constructor() {
    this.currentStatus = {
      online: navigator.onLine,
      effectiveType: (navigator as any).connection?.effectiveType,
      downlink: (navigator as any).connection?.downlink,
      rtt: (navigator as any).connection?.rtt,
      saveData: (navigator as any).connection?.saveData
    };

    this.setupEventListeners();
    this.startPeriodicCheck();
  }

  static getInstance(): NetworkDetector {
    if (!NetworkDetector.instance) {
      NetworkDetector.instance = new NetworkDetector();
    }
    return NetworkDetector.instance;
  }

  private setupEventListeners(): void {
    // Écouter les événements natifs du navigateur
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Écouter les changements de connexion (si supporté)
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', this.handleConnectionChange.bind(this));
    }

    // Écouter les changements de visibilité de la page
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private handleOnline(): void {
    this.updateStatus({ online: true });
    this.performConnectivityCheck();
  }

  private handleOffline(): void {
    this.updateStatus({ online: false });
  }

  private handleConnectionChange(): void {
    const connection = (navigator as any).connection;
    if (connection) {
      this.updateStatus({
        online: navigator.onLine,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });
    }
  }

  private handleVisibilityChange(): void {
    if (!document.hidden) {
      // La page redevient visible, vérifier la connectivité
      this.performConnectivityCheck();
    }
  }

  private updateStatus(newStatus: Partial<NetworkStatus>): void {
    const oldOnlineStatus = this.currentStatus.online;
    this.currentStatus = { ...this.currentStatus, ...newStatus };

    // Notifier les callbacks si le statut online/offline a changé
    if (oldOnlineStatus !== this.currentStatus.online) {
      this.notifyCallbacks();
    }
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.currentStatus.online, this.currentStatus);
      } catch (error) {
        console.error('Erreur dans le callback de détection réseau:', error);
      }
    });
  }

  private startPeriodicCheck(): void {
    // Vérifier la connectivité toutes les 30 secondes
    this.checkInterval = window.setInterval(() => {
      this.performConnectivityCheck();
    }, 30000);
  }

  private async performConnectivityCheck(): Promise<void> {
    const now = Date.now();
    
    // Éviter les vérifications trop fréquentes
    if (now - this.lastPingTime < 5000) {
      return;
    }

    this.lastPingTime = now;

    try {
      const startTime = performance.now();
      
      // Essayer de faire un ping vers le serveur
      const response = await fetch(this.pingUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
      });

      const endTime = performance.now();
      const rtt = endTime - startTime;

      if (response.ok) {
        this.updateStatus({ 
          online: true,
          rtt: Math.round(rtt)
        });
      } else {
        this.updateStatus({ online: false });
      }
    } catch (error) {
      // Erreur de réseau, considérer comme offline
      this.updateStatus({ online: false });
    }
  }

  public onStatusChange(callback: NetworkCallback): () => void {
    this.callbacks.push(callback);

    // Retourner une fonction de nettoyage
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public isOnline(): boolean {
    return this.currentStatus.online;
  }

  public getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  public getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!this.currentStatus.online) {
      return 'offline';
    }

    const rtt = this.currentStatus.rtt || 0;
    const downlink = this.currentStatus.downlink || 0;

    if (rtt < 100 && downlink > 10) {
      return 'excellent';
    } else if (rtt < 300 && downlink > 1) {
      return 'good';
    } else {
      return 'poor';
    }
  }

  public async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(this.pingUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  public destroy(): void {
    // Nettoyer les event listeners
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    if ((navigator as any).connection) {
      (navigator as any).connection.removeEventListener('change', this.handleConnectionChange.bind(this));
    }

    // Arrêter la vérification périodique
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Vider les callbacks
    this.callbacks = [];
  }
}