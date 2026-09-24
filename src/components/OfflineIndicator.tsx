import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/90 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-amber-950 shadow-2xl border border-amber-400">
      <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
      <div className="flex-1">
        <span className="font-bold">Modo Offline Ativo</span>: Seus dados estão salvos localmente no dispositivo e a sincronização retomará quando conectar.
      </div>
    </div>
  );
};
