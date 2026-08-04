import { useAuthStore } from '../store/auth.store';
import { useMasterStore } from '../store/master.store';
import { isMasterUser, isReadOnlyAccount, resolveDataOwner } from '../utils/master';

export const useDataOwner = () => {
  const authenticatedUid = useAuthStore((state) => state.user?.uid ?? null);
  const selectedAccountUid = useMasterStore((state) => state.selectedAccountUid);
  const isMaster = isMasterUser(authenticatedUid);
  const dataOwnerId = resolveDataOwner(authenticatedUid, selectedAccountUid);

  return {
    authenticatedUid,
    dataOwnerId,
    isMaster,
    isReadOnly: isReadOnlyAccount(authenticatedUid, selectedAccountUid),
  };
};
