import { MASTER_UID } from '../config/constants';

export const isMasterUser = (uid: string | null): boolean => uid === MASTER_UID;

export const resolveDataOwner = (
  authenticatedUid: string | null,
  selectedAccountUid: string | null
): string | null =>
  isMasterUser(authenticatedUid) && selectedAccountUid
    ? selectedAccountUid
    : authenticatedUid;

export const isReadOnlyAccount = (
  authenticatedUid: string | null,
  selectedAccountUid: string | null
): boolean => Boolean(
  isMasterUser(authenticatedUid)
  && selectedAccountUid
  && selectedAccountUid !== authenticatedUid
);
