import React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';

// Note: We rely on CRA's jest and testing-library setup via setupTests.js (jest-dom installed)

function clickCell(index: number) {
  const cell = screen.getByRole('button', { name: `Cell ${index}` });
  fireEvent.click(cell);
}

function selectOption(label: string, value: string) {
  const select = screen.getByLabelText(label) as HTMLSelectElement;
  fireEvent.change(select, { target: { value } });
}

function getScoreNumbers() {
  // From ScorePanel: three badges X Wins, O Wins, Draws; each badge has <strong> with number
  const xWinsBadge = screen.getByText('X Wins').closest('.ocean-badge') as HTMLElement;
  const oWinsBadge = screen.getByText('O Wins').closest('.ocean-badge') as HTMLElement;
  const drawsBadge = screen.getByText('Draws').closest('.ocean-badge') as HTMLElement;

  const xWins = Number((within(xWinsBadge).getByText((content, el) => el?.tagName === 'STRONG') as HTMLElement).textContent);
  const oWins = Number((within(oWinsBadge).getByText((content, el) => el?.tagName === 'STRONG') as HTMLElement).textContent);
  const draws = Number((within(drawsBadge).getByText((content, el) => el?.tagName === 'STRONG') as HTMLElement).textContent);
  return { xWins, oWins, draws };
}

describe('App UI - Human vs AI (integration)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });

  test('AI auto-moves in Human vs AI (Easy) after human move; human cannot play twice; scoreboard increments and persists; reset scores clears and persists', async () => {
    render(<App />);

    // Switch to Human vs AI and Easy difficulty
    selectOption('Game mode', 'HUMAN_VS_AI');
    selectOption('AI difficulty', 'EASY');

    // Initial scoreboard should be zeros
    let scores = getScoreNumbers();
    expect(scores).toEqual({ xWins: 0, oWins: 0, draws: 0 });

    // Active user defaults to X; AI is O. Human (X) makes a move at center (4).
    clickCell(4);

    // Immediately after click, it's AI's turn; human should not be allowed to move again right away.
    clickCell(0); // Attempt to play twice
    // Expect an error alert message "Wait for AI move"
    expect(await screen.findByRole('alert')).toHaveTextContent(/wait for ai move/i);

    // Advance timers to trigger AI move (setTimeout 300ms)
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    // After AI move, one of the remaining cells should now be filled (we can't assert exact index in EASY randomness)
    // Validate that cell 4 is still X and another cell is now filled with O by checking number of disabled cells > 1
    const allCells = screen.getAllByRole('button', { name: /Cell \d/ });
    const filledCount = allCells.filter((btn) => btn.getAttribute('data-filled') === 'true').length;
    expect(filledCount).toBeGreaterThan(1);

    // Play through to a finished game deterministically:
    // To avoid randomness, switch to OPTIMAL to get deterministic AI behavior for finishing.
    selectOption('AI difficulty', 'OPTIMAL');

    // Create a simple forced X win sequence where AI (O) can still respond:
    // X at 0, AI responds, X at 1, AI responds, X at 2 -> X wins (top row)
    // We must avoid clicking an already filled cell.
    const plannedMoves = [0, 1, 2];
    for (const idx of plannedMoves) {
      const btn = screen.getByRole('button', { name: `Cell ${idx}` }) as HTMLButtonElement;
      if (!btn.disabled) {
        clickCell(idx);
      }
      // Let AI respond after each human move unless game already ended
      await act(async () => {
        jest.advanceTimersByTime(300);
      });
      // Break if winner shown to avoid extra clicks
      const statusBadges = screen.getAllByText(/Next|Winner|Result/i);
      const hasWinner = statusBadges.some((el) => /Winner/i.test(el.textContent || ''));
      if (hasWinner) break;
    }

    // Verify game is over and winner is shown (likely X given moves)
    const winnerBadge = await screen.findByText(/Winner/i);
    expect(winnerBadge).toBeInTheDocument();

    // Scoreboard should have incremented either X or O wins (depending on how AI responded),
    // but not both, and not draws.
    scores = getScoreNumbers();
    const sum = scores.xWins + scores.oWins + scores.draws;
    expect(sum).toBe(1);

    // Simulate page reload by unmounting and remounting (localStorage persists)
    cleanup();
    render(<App />);

    // After remount, the scoreboard values should persist
    const persisted = getScoreNumbers();
    expect(persisted).toEqual(scores);

    // Test Reset Scores via signature-confirmed flow in App footer:
    // Click "Reset Scores" button
    const resetScoresBtn = screen.getByRole('button', { name: /Reset scores/i });
    fireEvent.click(resetScoresBtn);

    // Modal appears with "Signature confirmation for reset scores"
    const modal = await screen.findByRole('dialog', {
      name: /Signature confirmation for reset scores/i,
    });
    expect(modal).toBeInTheDocument();

    // Enter initials and confirm
    const initialsInput = within(modal).getByLabelText(/Initials for score reset/i) as HTMLInputElement;
    fireEvent.change(initialsInput, { target: { value: 'AB' } });
    const signAndReset = within(modal).getByRole('button', { name: /Sign & Reset/i });
    expect(signAndReset).not.toBeDisabled();
    fireEvent.click(signAndReset);

    // After reset, scoreboard should be cleared to zeros
    const cleared = getScoreNumbers();
    expect(cleared).toEqual({ xWins: 0, oWins: 0, draws: 0 });

    // Simulate another reload to ensure cleared state persists
    cleanup();
    render(<App />);
    const persistedCleared = getScoreNumbers();
    expect(persistedCleared).toEqual({ xWins: 0, oWins: 0, draws: 0 });
  });
});
