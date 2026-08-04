import { describe, expect, it } from 'vitest';
import { MASTER_UID } from '../config/constants';
import { isMasterUser, isReadOnlyAccount, resolveDataOwner } from './master';

describe('acesso master', () => {
  it('mantém usuários comuns restritos ao próprio UID', () => {
    expect(isMasterUser('common-user')).toBe(false);
    expect(resolveDataOwner('common-user', 'another-user')).toBe('common-user');
    expect(isReadOnlyAccount('common-user', 'another-user')).toBe(false);
  });

  it('permite ao master selecionar outra conta somente para leitura', () => {
    expect(resolveDataOwner(MASTER_UID, 'another-user')).toBe('another-user');
    expect(isReadOnlyAccount(MASTER_UID, 'another-user')).toBe(true);
  });

  it('não atribui uma conta financeira própria ao master', () => {
    expect(resolveDataOwner(MASTER_UID, null)).toBeNull();
    expect(isReadOnlyAccount(MASTER_UID, null)).toBe(false);
  });
});
