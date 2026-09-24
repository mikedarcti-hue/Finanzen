import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function getFriendlyAuthErrorMessage(errorCodeOrMessage: string): string {
  const code = errorCodeOrMessage.toLowerCase();
  if (code.includes('popup-blocked')) {
    return 'O pop-up de login foi bloqueado pelo navegador. Por favor, libere pop-ups para este site ou utilize o cadastro/login por E-mail e Senha abaixo.';
  }
  if (code.includes('unauthorized-domain')) {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'seu-app.vercel.app';
    return `O domínio da sua aplicação (${currentHost}) não está na lista de "Domínios Autorizados" do Firebase Console. Para liberar o login com Google no Vercel, acesse o Firebase Console > Authentication > Settings (Configurações) > Authorized domains e adicione "${currentHost}" (ou "vercel.app"). Enquanto isso, você pode se cadastrar e entrar com E-mail e Senha abaixo!`;
  }
  if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) {
    return 'Janela de login com Google fechada antes de concluir.';
  }
  if (code.includes('email-already-in-use')) {
    return 'Este e-mail já está cadastrado. Alterne para a aba "Entrar" para fazer login.';
  }
  if (code.includes('invalid-email')) {
    return 'Formato de e-mail inválido. Por favor, confira o endereço digitado.';
  }
  if (code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'E-mail ou senha incorretos. Verifique suas credenciais.';
  }
  if (code.includes('user-not-found')) {
    return 'Nenhum usuário encontrado com este e-mail. Crie uma conta na aba "Cadastrar".';
  }
  if (code.includes('weak-password')) {
    return 'Senha muito fraca. Digite pelo menos 6 caracteres.';
  }
  if (code.includes('operation-not-allowed')) {
    return 'Este método de login não está ativado no Firebase Console. Use o cadastro por E-mail e Senha.';
  }
  if (code.includes('too-many-requests')) {
    return 'Muitas tentativas consecutivas. Aguarde alguns instantes antes de tentar novamente.';
  }
  if (code.includes('network-request-failed')) {
    return 'Falha na conexão de internet. Verifique sua rede.';
  }
  return errorCodeOrMessage;
}

// Test initial connection as required by Skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.warn('Firebase connection check: Client might be offline');
    }
  }
}

testConnection();

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateAuthProfile,
  sendPasswordResetEmail,
};
export type { User };
