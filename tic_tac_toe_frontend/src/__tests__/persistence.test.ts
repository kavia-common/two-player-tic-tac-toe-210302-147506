import { getScores, saveScores, clearScores } from '../lib/persistence';
import type { ScoreBoard } from '../types';

const STORAGE_KEY = 'ttt.scoreboard.v1';

function makeScores(overrides: Partial<ScoreBoard> = {}): ScoreBoard {
  return {
    xWins: 1,
    oWins: 2,
    draws: 3,
    sessions: 4,
    history: [],
    ...overrides,
  };
}

describe('Persistence - scoreboard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('returns defaults when no data present', () => {
    const s = getScores();
    expect(s).toEqual({
      xWins: 0,
      oWins: 0,
      draws: 0,
      sessions: 0,
      history: [],
    });
  });

  test('save and read roundtrip', () => {
    const initial = makeScores({ history: [
      { timestamp: new Date().toISOString(), winner: 'X', board: Array(9).fill(null) }
    ]});
    saveScores(initial);
    const loaded = getScores();
    expect(loaded).toEqual(initial);
  });

  test('clear removes data', () => {
    const initial = makeScores();
    saveScores(initial);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeTruthy();

    clearScores();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    const after = getScores();
    expect(after).toEqual({
      xWins: 0,
      oWins: 0,
      draws: 0,
      sessions: 0,
      history: [],
    });
  });

  test('corrupted JSON falls back to defaults', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-json');
    const s = getScores();
    expect(s).toEqual({
      xWins: 0,
      oWins: 0,
      draws: 0,
      sessions: 0,
      history: [],
    });
  });

  test('invalid schema falls back to defaults and does not throw', () => {
    // negative numbers invalid per validator
    const bad: any = {
      xWins: -1,
      oWins: 0,
      draws: 0,
      sessions: 0,
      history: [],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bad));
    const s = getScores();
    expect(s).toEqual({
      xWins: 0,
      oWins: 0,
      draws: 0,
      sessions: 0,
      history: [],
    });
  });

  test('saveScores fails closed on invalid structure (does not persist)', () => {
    // @ts-expect-error deliberately wrong types
    const invalid = { xWins: 'nope', oWins: 0, draws: 0, sessions: 0, history: [] };
    saveScores(invalid as any);
    // no item written
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
