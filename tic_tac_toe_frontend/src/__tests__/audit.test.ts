//
// ============================================================================
// UNIT TESTS - AUDIT TRAIL
// ============================================================================

import { appendAudit, getAuditLog, clearAudit } from '../lib/audit';

describe('Audit Trail', () => {
  beforeEach(() => {
    clearAudit();
  });

  test('append entry structure and immutability', () => {
    const beforeLen = getAuditLog().length;
    const entry = appendAudit({
      userId: 'X',
      action: 'CREATE',
      after: { demo: true },
    });

    const afterLen = getAuditLog().length;
    expect(afterLen).toBe(beforeLen + 1);
    expect(entry.id).toBeTruthy();
    expect(entry.timestamp).toBeTruthy();

    const logCopy = getAuditLog();
    // ensure append-only outwardly
    expect(Object.isFrozen ? !Object.isFrozen(logCopy) : true).toBe(true);
    expect(() => {
      (logCopy as any).push('x');
    }).not.toThrow();
    // but the source should not be modified by external mutation
    expect(getAuditLog().length).toBe(afterLen);
  });

  test('reject invalid entries', () => {
    expect(() =>
      appendAudit({ userId: '', action: 'MOVE', after: {} as any })
    ).toThrow(/userId/);

    expect(() =>
      appendAudit({ userId: 'X', action: 'BOGUS' as any, after: {} })
    ).toThrow(/action/);
  });
});
