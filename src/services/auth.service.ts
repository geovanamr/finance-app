// ============================================================
// SERVIÇO DE AUTENTICAÇÃO
// Encapsula todas as operações do Firebase Auth.
// ============================================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Login com email e senha.
 */
export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

/**
 * Cadastro com email e senha.
 */
export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

/**
 * Logout.
 */
export const logOut = () => signOut(auth);

/**
 * Envia email de redefinição de senha.
 */
export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

/**
 * Observa mudanças no estado de autenticação.
 * Retorna a função de unsubscribe.
 */
export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);
