import { appendAudit, getAuditLog, clearAudit } from '../lib/audit';

describe('Audit Extensions - expected action types and metadata presence', () => {
  beforeEach(() => {
    clearAudit();
  });

  test('AI MOVE entry structure with metadata (index, difficulty)', () => {
    const before = { board: Array(9).fill(null), nextPlayer: 'O' };
    const after = { board: (() => { const b = Array(9).fill(null); b[4] = 'O'; return b; })(), nextPlayer: 'X' };
    appendAudit({
      userId: 'AI',
      action: 'MOVE',
      reason: 'AI move',
      before,
      after,
      metadata: { difficulty: 'OPTIMAL', index: 4 }
    });

    const log = getAuditLog();
    expect(log.length).toBe(1);
    const entry = log[0];
    expect(entry.userId).toBe('AI');
    expect(entry.action).toBe('MOVE');
    expect(entry.metadata).toBeTruthy();
    expect(entry.metadata && (entry.metadata as any).index).toBe(4);
    expect(entry.metadata && (entry.metadata as any).difficulty).toBe('OPTIMAL');
  });

  test('Scoreboard UPDATE entry includes before/after and result metadata', () => {
    const beforeScores = { xWins: 0, oWins: 0, draws: 0, sessions: 0, history: [] };
    const afterScores = { xWins: 1, oWins: 0, draws: 0, sessions: 0, history: [] };
    appendAudit({
      userId: 'X',
      action: 'UPDATE',
      reason: 'Update scoreboard after game end (Human)',
      before: beforeScores,
      after: afterScores,
      metadata: { result: 'X' }
    });

    const log = getAuditLog();
    expect(log.length).toBe(1);
    const entry = log[0];
    expect(entry.action).toBe('UPDATE');
    expect(entry.before).toEqual(beforeScores);
    expect(entry.after).toEqual(afterScores);
    expect(entry.metadata && (entry.metadata as any).result).toBe('X');
  });

  test('Scoreboard DELETE (reset) includes signature metadata when provided', () => {
    const beforeScores = { xWins: 5, oWins: 4, draws: 3, sessions: 2, history: [] };
    const afterScores = { xWins: 0, oWins: 0, draws: 0, sessions: 0, history: [] };
    appendAudit({
      userId: 'X',
      action: 'DELETE',
      reason: 'Reset scores by user request',
      before: beforeScores,
      after: afterScores,
      metadata: { component: 'App', signature: { initials: 'AB' } }
    });

    const log = getAuditLog();
    expect(log.length).toBe(1);
    const entry = log[0];
    expect(entry.action).toBe('DELETE');
    expect(entry.metadata && (entry.metadata as any).signature).toEqual({ initials: 'AB' });
    expect(entry.metadata && (entry.metadata as any).component).toBe('App');
  });
});
