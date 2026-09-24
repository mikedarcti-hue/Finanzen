import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-medium">PWA Instalado</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-400 bg-emerald-500/20 rounded-lg border border-emerald-500/40">
        <Check className="w-4 h-4" />
        <span>Instalado com sucesso!</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        className={`group flex items-center gap-2 font-medium text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all shadow-lg shadow-emerald-950/40 rounded-lg border border-emerald-400/30 ${
          variant === 'full' ? 'w-full justify-center py-2.5 px-4' : 'py-1.5 px-3'
        }`}
        title="Instalar Gasto Inteligente no celular ou computador"
      >
        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 font-medium text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg transition-all ${
            variant === 'full' ? 'w-full justify-center py-2.5 px-4' : 'py-1.5 px-2.5'
          }`}
        >
          <Apple className="w-3.5 h-3.5 text-slate-300" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-emerald-500/30 flex items-center justify-center mb-4">
                <img src="/logo.png" alt="Gasto Inteligente" className="w-full h-full object-cover" />
              </div>

              <h3 className="text-lg font-bold text-white mb-2">Instalar no iPhone / iPad</h3>
              <p className="text-xs text-slate-400 mb-4">
                Siga 2 passos simples no Safari para ter o Gasto Inteligente como app nativo:
              </p>

              <ol className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-5">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima na barra inferior do Safari).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default button for environments where beforeinstallprompt hasn't fired yet or desktop browser
  return (
    <>
      <button
        onClick={() => setShowGeneralGuide(true)}
        className={`flex items-center gap-1.5 font-medium text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all ${
          variant === 'full' ? 'w-full justify-center py-2.5 px-4' : 'py-1.5 px-2.5'
        }`}
        title="Instalar Aplicativo Gasto Inteligente (PWA)"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">PWA / App</span>
        <span className="sm:hidden">App</span>
      </button>

      {showGeneralGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200 relative">
            <button
              onClick={() => setShowGeneralGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-emerald-500/30 flex items-center justify-center mb-4">
              <img src="/logo.png" alt="Gasto Inteligente" className="w-full h-full object-cover" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Instalar Gasto Inteligente</h3>
            <p className="text-xs text-slate-400 mb-4">
              O Gasto Inteligente é um Progressive Web App (PWA) 100% offline e instalável sem lojas de aplicativos:
            </p>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                <span><strong>No Celular (Chrome/Brave/Edge):</strong> Toque no menu ⋮ (três pontinhos) e clique em <em>&ldquo;Instalar aplicativo&rdquo;</em> ou <em>&ldquo;Adicionar à tela inicial&rdquo;</em>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                <span><strong>No Computador:</strong> Clique no ícone de instalar na barra de endereços do Chrome/Edge.</span>
              </div>
            </div>

            <button
              onClick={() => setShowGeneralGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
