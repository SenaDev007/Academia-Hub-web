/**
 * OfflineStatusBadge Component
 * 
 * Composant pour afficher le statut offline/online
 * avec indicateur d'actions en attente et bouton de synchronisation
 */

'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Clock, RefreshCw, Loader2 } from 'lucide-react';

/**
 * Badge de statut offline/online avec synchronisation
 */
export function OfflineStatusBadge() {
  const { isOnline, pendingOperationsCount, isSyncing, syncNow } = useOfflineSync();

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      {!isOnline ? (
        <>
          <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">
            <WifiOff className="w-3 h-3 mr-1" />
            Mode hors connexion
          </Badge>
          {pendingOperationsCount > 0 && (
            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
              <Clock className="w-3 h-3 mr-1" />
              {pendingOperationsCount} action{pendingOperationsCount > 1 ? 's' : ''} en attente
            </Badge>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={syncNow}
            disabled={isSyncing || pendingOperationsCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Synchroniser maintenant
              </>
            )}
          </Button>
        </>
      ) : (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <Wifi className="w-3 h-3 mr-1" />
          En ligne
        </Badge>
      )}
    </div>
  );
}
