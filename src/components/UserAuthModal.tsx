import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  LogOut,
  LogIn,
  Cloud,
  CheckCircle2,
  RefreshCw,
  FolderArchive,
  Save,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isAuthLoading,
    isSyncing,
    lastSyncedAt,
    syncStatus,
    cloudBackups,
    isLoadingBackups,
    loginWithGoogle,
    loginAsGuest,
    logout,
    forceCloudSync,
    saveCloudBackup,
    restoreCloudBackup,
    deleteCloudBackup,
    exportDataAsJSON,
    importDataFromJSON,
    data,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'profile' | 'backups' | 'files'>('profile');
  const [newBackupName, setNewBackupName] = useState('');
  const [isSavingBackup, setIsSavingBackup] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBackupName.trim()) return;
    setIsSavingBackup(true);
    setFeedbackMessage(null);
    try {
      await saveCloudBackup(newBackupName);
      setNewBackupName('');
      setFeedbackMessage('Arquivo salvo com sucesso na sua nuvem Firebase!');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage('Erro ao salvar arquivo na nuvem: ' + err.message);
    } finally {
      setIsSavingBackup(false);
    }
  };

  const handleRestore = async (backup: any) => {
    const confirmRestore = window.confirm(
      `Deseja restaurar o arquivo "${backup.name}" gravado em ${new Date(
        backup.createdAt
      ).toLocaleDateString('pt-BR')}? Seus dados atuais serão substituídos.`
    );
    if (!confirmRestore) return;
    try {
      await restoreCloudBackup(backup);
      setFeedbackMessage(`Arquivo "${backup.name}" restaurado com sucesso!`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage('Falha ao restaurar: ' + err.message);
    }
  };

  const handleDeleteBackup = async (backupId: string, backupName: string) => {
    const confirmDel = window.confirm(`Excluir o arquivo de backup "${backupName}" permanentemente?`);
    if (!confirmDel) return;
    try {
      await deleteCloudBackup(backupId);
      setFeedbackMessage('Arquivo removido com sucesso.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setFeedbackMessage('Falha ao excluir: ' + err.message);
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedEmail = user?.email ? user.email.replace(/[@.]/g, '_') : 'guest';
    a.download = `finanzen_backup_${sanitizedEmail}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataFromJSON(content);
        if (ok) {
          setImportError(null);
          setFeedbackMessage('Arquivo importado com sucesso!');
          setTimeout(() => setFeedbackMessage(null), 3500);
        } else {
          setImportError('Formato de arquivo JSON inválido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D121F] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                Conta & Arquivos do Usuário
              </h3>
              <p className="text-xs text-slate-400">
                Persistência em nuvem Firebase Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Meu Perfil
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'backups'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Arquivos na Nuvem</span>
            {cloudBackups.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300">
                {cloudBackups.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'files'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Exportar / Importar
          </button>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {user ? (
                <>
                  {/* Logged in User Card */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Usuário'}
                        className="w-14 h-14 rounded-2xl border-2 border-emerald-500/40 object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-100 text-base truncate">
                          {user.displayName || 'Usuário FinanZen'}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {user.isAnonymous ? 'Convidado' : 'Google'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {user.email || 'Sessão temporária'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">
                        ID: {user.uid}
                      </p>
                    </div>
                  </div>

                  {/* Sync status & actions */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-300">
                          Status de Sincronização
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        {syncStatus === 'synced' && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            100% Salvo na Nuvem
                          </span>
                        )}
                        {syncStatus === 'saving' && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Salvando...
                          </span>
                        )}
                        {syncStatus === 'offline' && (
                          <span className="flex items-center gap-1 text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Modo Offline (Salvo local)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                      <span>
                        Última sincronização:{' '}
                        {lastSyncedAt ? lastSyncedAt.toLocaleTimeString('pt-BR') : 'Agora'}
                      </span>
                      <button
                        onClick={forceCloudSync}
                        disabled={isSyncing}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 hover:underline"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sincronizar agora
                      </button>
                    </div>
                  </div>

                  {/* Reassurance Message */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Garantia de Não Perda de Dados
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Todas as suas despesas, receitas, contratos de financiamento e análises de IA
                      são sincronizadas automaticamente no banco de dados Firestore. Mesmo se você sair,
                      fechar o navegador ou limpar o cache, ao entrar novamente com esta conta tudo
                      será recarregado exatamente de onde parou.
                    </p>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        const confirmLogout = window.confirm(
                          'Deseja sair da sua conta? Suas informações foram salvas na nuvem com segurança.'
                        );
                        if (confirmLogout) {
                          await logout();
                          onClose();
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-medium text-xs flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da Conta (Logout)</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Unauthenticated View */
                <div className="space-y-4 text-center py-2">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-xl">
                    <UserIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-100">
                      Entrar no FinanZen
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      Conecte sua conta para garantir que seus arquivos e dados financeiros fiquem
                      guardados para sempre na nuvem Firebase.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={async () => {
                        try {
                          await loginWithGoogle();
                        } catch (e) {
                          // Handled in context
                        }
                      }}
                      disabled={isAuthLoading}
                      className="w-full py-3 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Entrar com Conta Google</span>
                    </button>

                    <button
                      onClick={loginAsGuest}
                      disabled={isAuthLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Acesso Rápido Anônimo (Salvar na Nuvem)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-4">
              {!user ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <Cloud className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Faça login para gerenciar snapshots e arquivos na nuvem.
                </div>
              ) : (
                <>
                  {/* Create Snapshot Form */}
                  <form onSubmit={handleCreateBackup} className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Criar Novo Snapshot / Arquivo na Nuvem
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBackupName}
                        onChange={(e) => setNewBackupName(e.target.value)}
                        placeholder="Ex: Fechamento Setembro 2026, Antes de Quitar Carro"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={isSavingBackup || !newBackupName.trim()}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-950/40"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar</span>
                      </button>
                    </div>
                  </form>

                  {/* List of User Cloud Backups */}
                  <div className="space-y-2 pt-2">
                    <h5 className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                      <span>Arquivos Salvos ({cloudBackups.length})</span>
                      {isLoadingBackups && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Carregando...
                        </span>
                      )}
                    </h5>

                    {cloudBackups.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                        <FolderArchive className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        Nenhum snapshot arquivado ainda. Crie um snapshot acima para ter pontos de restauração da sua vida financeira!
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {cloudBackups.map((b) => (
                          <div
                            key={b.id}
                            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                          >
                            <div className="min-w-0 flex-1">
                              <h6 className="font-semibold text-xs text-slate-200 truncate">
                                {b.name}
                              </h6>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>{new Date(b.createdAt).toLocaleDateString('pt-BR')} às {new Date(b.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-medium">
                                  Saldo: {formatCurrency(b.summary?.balance || 0)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleRestore(b)}
                                title="Restaurar este arquivo"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center gap-1 transition"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Restaurar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteBackup(b.id, b.name)}
                                title="Excluir arquivo"
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-200">
                      Baixar Arquivo Completo (.JSON)
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Exporte todos os seus dados para backup offline no seu celular ou computador.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadJSON}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Baixar Arquivo JSON do Usuário</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-200">
                      Restaurar de Arquivo (.JSON)
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Carregue um arquivo JSON previamente exportado para recuperar dados.
                    </p>
                  </div>
                </div>

                <label className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700">
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Selecionar Arquivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {importError && (
                  <p className="text-rose-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {importError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            Persistência Nuvem + Local
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
