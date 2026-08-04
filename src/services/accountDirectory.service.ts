import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { COLLECTIONS, MASTER_UID } from '../config/constants';
import { db } from '../config/firebase';
import type { AccountProfile } from '../types';

const directoryCollection = () => collection(db, COLLECTIONS.ACCOUNT_DIRECTORY);

/** Atualiza o perfil público administrativo da própria conta ao fazer login. */
export const syncOwnAccountProfile = async (user: User): Promise<AccountProfile> => {
  const profile: AccountProfile = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    createdAt: user.metadata.creationTime ?? '',
    lastSignInAt: user.metadata.lastSignInTime ?? '',
    syncedAt: new Date().toISOString(),
  };

  await setDoc(doc(directoryCollection(), user.uid), profile, { merge: true });
  return profile;
};

/** Lista as contas que já acessaram o aplicativo após a criação do diretório. */
export const getAccountProfiles = async (): Promise<AccountProfile[]> => {
  const snapshot = await getDocs(directoryCollection());
  return snapshot.docs
    .map((item) => item.data() as AccountProfile)
    .filter((profile) => profile.uid !== MASTER_UID)
    .sort((a, b) => (a.email || a.displayName).localeCompare(b.email || b.displayName));
};
