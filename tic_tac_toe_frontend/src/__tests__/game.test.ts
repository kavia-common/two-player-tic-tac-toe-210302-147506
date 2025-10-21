//
// ============================================================================
// UNIT TESTS - GAME LOGIC
// ============================================================================

import { applyMove, createInitialState, isDraw, detectWinner } from '../lib/game';

describe('Game Logic - Winner detection', () => {
  test('row win', () => {
    const s0 = createInitialState();
    const s1 = applyMove(s0, 0, 'X');
    const s2 = applyMove(s1, 3, 'O');
    const s3 = applyMove(s2, 1, 'X');
    const s4 = applyMove(s3, 4, 'O');
    const s5 = applyMove(s4, 2, 'X');
    expect(s5.winner).toBe('X');
    expect(detectWinner(s5.board)).toBe('X');
  });

  test('col win', () => {
    const s0 = createInitialState();
    const s1 = applyMove(s0, 0, 'X');
    const s2 = applyMove(s1, 1, 'O');
    const s3 = applyMove(s2, 3, 'X');
    const s4 = applyMove(s3, 2, 'O');
    const s5 = applyMove(s4, 6, 'X');
    expect(s5.winner).toBe('X');
  });

  test('diag win', () => {
    const s0 = createInitialState();
    const s1 = applyMove(s0, 0, 'X');
    const s2 = applyMove(s1, 1, 'O');
    const s3 = applyMove(s2, 4, 'X');
    const s4 = applyMove(s3, 2, 'O');
    const s5 = applyMove(s4, 8, 'X');
    expect(s5.winner).toBe('X');
  });
});

describe('Game Logic - Draw detection', () => {
  test('detect draw board', () => {
    // X O X
    // X O O
    // O X X
    let s = createInitialState();
    s = applyMove(s, 0, 'X');
    s = applyMove(s, 1, 'O');
    s = applyMove(s, 2, 'X');
    s = applyMove(s, 4, 'O');
    s = applyMove(s, 3, 'X');
    s = applyMove(s, 5, 'O');
    s = applyMove(s, 7, 'X');
    s = applyMove(s, 6, 'O');
    s = applyMove(s, 8, 'X');
    expect(s.isDraw).toBe(true);
    expect(isDraw(s.board)).toBe(true);
    expect(s.winner).toBeNull();
  });
});

describe('Game Logic - Invalid moves', () => {
  test('prevent playing out of turn', () => {
    const s0 = createInitialState();
    expect(() => applyMove(s0, 0, 'O')).toThrow(/turn/i);
  });

  test('prevent playing in occupied cell', () => {
    const s0 = createInitialState();
    const s1 = applyMove(s0, 0, 'X');
    expect(() => applyMove(s1, 0, 'O')).toThrow(/occupied/i);
  });

  test('prevent playing after game over', () => {
    let s = createInitialState();
    s = applyMove(s, 0, 'X');
    s = applyMove(s, 3, 'O');
    s = applyMove(s, 1, 'X');
    s = applyMove(s, 4, 'O');
    s = applyMove(s, 2, 'X'); // X wins
    expect(s.gameOver).toBe(true);
    expect(() => applyMove(s, 8, 'O')).toThrow(/already over/i);
  });
});
