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
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  ArrowRight,
  Info,
  ExternalLink,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
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
    registerWithEmail,
    loginWithEmail,
    resetPassword,
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

  // Auth form states
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

  const firebaseProjectId = 'chrome-perigee-bsmzh';
  const firebaseProvidersUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/providers`;
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`;

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
      setFeedbackMessage('Conectado com o Google com sucesso!');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err: any) {
      setAuthError(err.message || 'Falha ao autenticar com o Google.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPass) {
      setAuthError('Preencha o e-mail e a senha.');
      return;
    }

    if (authMode === 'register' && !trimmedName) {
      setAuthError('Informe seu nome para concluir o cadastro.');
      return;
    }

    if (trimmedPass.length < 6) {
      setAuthError('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'register') {
        await registerWithEmail(trimmedEmail, trimmedPass, trimmedName);
        setFeedbackMessage('Cadastro realizado com sucesso! Seus dados foram guardados na sua conta.');
      } else {
        await loginWithEmail(trimmedEmail, trimmedPass);
        setFeedbackMessage('Login realizado com sucesso! Suas informações foram carregadas.');
      }
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao processar sua solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAuthError('Digite seu e-mail no campo acima para enviarmos o link de recuperação.');
      return;
    }
    setIsResettingPassword(true);
    setAuthError(null);
    try {
      await resetPassword(trimmedEmail);
      setFeedbackMessage(`Link de redefinição enviado para ${trimmedEmail}! Verifique sua caixa de entrada.`);
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch (err: any) {
      setAuthError(err.message || 'Falha ao enviar e-mail de recuperação.');
    } finally {
      setIsResettingPassword(false);
    }
  };

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
                          {user.displayName || 'Usuário Gasto Inteligente'}
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
                /* Unauthenticated View: Full Cadastro & Login */
                <div className="space-y-4 py-1">
                  {/* Branding Header */}
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 mx-auto rounded-2xl overflow-hidden bg-black border border-emerald-500/40 shadow-lg shadow-emerald-950/40 flex items-center justify-center p-0.5">
                      <img src="/logo.png" alt="Gasto Inteligente" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <h4 className="font-bold text-base text-slate-100">
                      Acesse o <span className="text-white">Gasto</span> <span className="text-emerald-400">Inteligente</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Seus arquivos, despesas, rendas e contratos de financiamento ficam salvos com segurança na nuvem Firebase.
                    </p>
                  </div>

                  {/* Mode Switcher: Cadastrar vs Entrar */}
                  <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError(null);
                      }}
                      className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                        authMode === 'register'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Cadastrar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                      }}
                      className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                        authMode === 'login'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Entrar</span>
                    </button>
                  </div>

                  {/* Error Alert Box with Action Link */}
                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <p className="font-medium leading-relaxed">{authError}</p>
                        {authError.includes('Firebase Console') && (
                          <div className="pt-1 flex flex-wrap gap-2">
                            <a
                              href={firebaseProvidersUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-white font-semibold text-[11px] transition"
                            >
                              <span>Ativar Métodos no Firebase</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={firebaseSettingsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-[11px] transition"
                            >
                              <span>Domínios Autorizados</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Firebase Setup Helper Accordion */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
                      className="w-full px-3 py-2 flex items-center justify-between text-slate-300 hover:text-white transition font-medium text-[11px]"
                    >
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Settings className="w-3.5 h-3.5" />
                        <span>Configurar Firebase Console (Sign-in Methods)</span>
                      </span>
                      {showFirebaseGuide ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {showFirebaseGuide && (
                      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2.5 text-[11px] text-slate-300">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">Projeto Firebase:</span>
                          <code className="text-emerald-400 font-mono font-bold text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {firebaseProjectId}
                          </code>
                        </div>

                        <div className="space-y-1.5">
                          <p className="font-semibold text-slate-200">
                            Passo a passo no Firebase Console:
                          </p>
                          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[10px]">
                            <li>
                              Acesse o Firebase Console com seu e-mail Google (
                              <strong className="text-slate-300">mikedarcti@gmail.com</strong>).
                            </li>
                            <li>
                              Vá em <strong className="text-slate-300">Authentication &gt; Sign-in method</strong> e ative os provedores:
                              <ul className="list-disc list-inside pl-3 pt-0.5 text-slate-400">
                                <li><strong className="text-emerald-400">Google</strong> (informe seu e-mail de suporte).</li>
                                <li><strong className="text-emerald-400">E-mail/senha</strong>.</li>
                              </ul>
                            </li>
                            <li>
                              Vá em <strong className="text-slate-300">Configurações (Settings) &gt; Domínios autorizados</strong> e adicione o domínio do seu app (ex: <code className="text-slate-200">vercel.app</code>).
                            </li>
                          </ol>
                        </div>

                        <div className="pt-1 flex flex-col sm:flex-row gap-2">
                          <a
                            href={firebaseProvidersUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center flex items-center justify-center gap-1.5 transition text-[10px]"
                          >
                            <span>1. Abrir Sign-in method</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={firebaseSettingsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-center flex items-center justify-center gap-1.5 transition text-[10px]"
                          >
                            <span>2. Abrir Domínios Autorizados</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Google 1-Click Auth Button */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isAuthLoading || isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition disabled:opacity-50"
                    >
                      {isAuthLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      )}
                      <span>
                        {authMode === 'register' ? 'Cadastrar com Conta Google' : 'Entrar com Conta Google'}
                      </span>
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-3">
                      <div className="border-t border-slate-800 w-full" />
                      <span className="bg-[#0D121F] px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Ou com e-mail e senha
                      </span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                      {authMode === 'register' && (
                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>Seu Nome Completo</span>
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Carlos Silva"
                            required={authMode === 'register'}
                            className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
                          />
                        </div>
                      )}

                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>E-mail</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          required
                          className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Senha</span>
                          </label>
                          {authMode === 'login' && (
                            <button
                              type="button"
                              onClick={handleForgotPassword}
                              disabled={isResettingPassword}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline"
                            >
                              {isResettingPassword ? 'Enviando...' : 'Esqueci minha senha'}
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={authMode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                            required
                            minLength={6}
                            className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-0.5"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || isAuthLoading}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-98 transition disabled:opacity-50 mt-2"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        ) : authMode === 'register' ? (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Criar Conta & Sincronizar Tudo na Nuvem</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            <span>Entrar na Minha Conta</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Anonymous Access fallback */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={loginAsGuest}
                        disabled={isAuthLoading || isSubmitting}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Continuar sem cadastro (Modo Convidado na nuvem)</span>
                      </button>
                    </div>

                    {/* Reassurance note */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Todos os seus gastos já adicionados serão vinculados automaticamente.</span>
                    </div>
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
