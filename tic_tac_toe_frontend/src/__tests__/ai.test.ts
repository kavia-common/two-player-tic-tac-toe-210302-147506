import { nextAIMove } from '../lib/ai';
import { detectWinner } from '../lib/game';
import type { Board } from '../types';

describe('AI - EASY difficulty', () => {
  test('picks only from available cells', () => {
    const board: Board = [
      'X', null, 'O',
      null, 'X', null,
      'O', null, null
    ];
    const emptyIndices = board
      .map((v, i) => (v === null ? i : -1))
      .filter(i => i >= 0);

    // Run multiple times to mitigate randomness; must always be in emptyIndices
    for (let i = 0; i < 20; i++) {
      const idx = nextAIMove(board, 'O', 'EASY');
      expect(emptyIndices).toContain(idx);
    }
  });

  test('throws when no moves available', () => {
    const board: Board = [
      'X','O','X',
      'X','O','O',
      'O','X','X'
    ];
    expect(() => nextAIMove(board, 'X', 'EASY')).toThrow(/No available moves/i);
  });
});

describe('AI - OPTIMAL difficulty', () => {
  test('wins when a winning move exists', () => {
    // Board where O can win at index 8
    // O O .
    // X X .
    // . . .
    const board: Board = [
      'O','O',null,
      'X','X',null,
      null,null, null
    ];
    const move = nextAIMove(board, 'O', 'OPTIMAL');
    expect(move).toBe(2); // complete top row for O
    const newBoard = board.slice();
    newBoard[move] = 'O';
    expect(detectWinner(newBoard)).toBe('O');
  });

  test('blocks immediate opponent win', () => {
    // X X .
    // . O .
    // . . .
    const board: Board = [
      'X','X',null,
      null,'O',null,
      null,null,null
    ];
    // O should block at index 2
    const move = nextAIMove(board, 'O', 'OPTIMAL');
    expect(move).toBe(2);
  });

  test('chooses center on empty board (one optimal strategy) or a corner; must be a valid strong opening', () => {
    const empty: Board = Array(9).fill(null);
    const move = nextAIMove(empty, 'X', 'OPTIMAL');
    // Valid optimal openings: center (4) or a corner (0,2,6,8)
    const strongOpenings = [4,0,2,6,8];
    expect(strongOpenings).toContain(move);
  });
});
