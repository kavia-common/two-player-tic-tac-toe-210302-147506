/*
==============================================================================
REQUIREMENT TRACEABILITY
------------------------------------------------------------------------------
Requirement ID: REQ-TTT-APP-001
User Story: As a user, I can play Tic Tac Toe locally with audit trail and basic access controls.
Acceptance Criteria:
 - 3x3 clickable board, alternate X/O
 - Win/draw detection, invalid move prevention
 - New game and reset controls with e-signature capture
 - In-memory audit trail with timestamp, before/after, userId, action
 - Role selection (X or O) and attribution
 - Ocean Professional theme applied
GxP Impact: YES - Includes audit trail, validation, access control.
Risk Level: MEDIUM
Validation Protocol: VP-TTT-APP-001
==============================================================================
*/

import React, { useEffect, useMemo, useState } from 'react';
import './index.css';

import { Board, StatusBar, Controls, ScorePanel } from './components';

import { createInitialState, applyMove } from './lib/game';
import { appendAudit, getAuditLog, clearAudit } from './lib/audit';
// @ts-ignore - TS module used in JS
import { getScores, saveScores, clearScores } from './lib/persistence.ts';
// @ts-ignore - allow TS import in JS env
import { nextAIMove } from './lib/ai.ts';
// @ts-ignore
import { } from './types.d';

/**
 * PUBLIC_INTERFACE
 * App
 * Root application component integrating game logic, audit logging, and UI.
 *
 * GxP Critical: Yes
 * Parameters: none
 * Returns: JSX.Element
 * Throws: never (internal errors are caught and displayed)
 * Audit:
 *  - MOVE: on each valid move with before/after state
 *  - ERROR: on validation or runtime errors
 *  - NEW_GAME / RESET: when initiating a new game or resetting
 *  - SIGN: electronic signature entries bound to critical action
 */
function App() {
  // local role/identity
  const [activeUser, setActiveUser] = useState('X'); // 'X' | 'O'
  // game state
  const [state, setState] = useState(createInitialState());
  // scoreboard persistence
  const [scores, setScores] = useState(() => {
    try {
      const loaded = getScores();
      return loaded;
    } catch {
      return { xWins: 0, oWins: 0, draws: 0, sessions: 0, history: [] };
    }
  });
  // error surface
  const [error, setError] = useState(null);

  // game mode and AI difficulty
  /** @type {[('HUMAN_VS_HUMAN'|'HUMAN_VS_AI'), Function]} */
  const [mode, setMode] = useState('HUMAN_VS_HUMAN');
  /** @type {[('EASY'|'OPTIMAL'), Function]} */
  const [difficulty, setDifficulty] = useState('EASY');

  // on mount: record initial create
  useEffect(() => {
    try {
      appendAudit({
        userId: activeUser,
        action: 'CREATE',
        after: state,
        metadata: { component: 'App', message: 'Initial state created' },
      });
      // Record we loaded scores from persistence (READ)
      appendAudit({
        userId: activeUser,
        action: 'READ',
        reason: 'Load scoreboard from persistence',
        after: scores,
        metadata: { component: 'App' },
      });
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // simple theme application (Ocean Professional uses our css variables)
  useEffect(() => {
    document.title = 'Ocean TTT';
  }, []);

  const auditCount = useMemo(() => getAuditLog().length, [state, activeUser]);

  const switchUser = (p) => {
    try {
      setActiveUser(p);
      appendAudit({
        userId: p,
        action: 'UPDATE',
        reason: 'Switch identity',
        metadata: { field: 'activeUser' },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetScores = (signature) => {
    try {
      // Bind signature to delete action
      appendAudit({
        userId: activeUser,
        action: 'SIGN',
        reason: 'Signature for RESET_SCORES',
        metadata: { signature },
      });

      const beforeScores = scores;
      clearScores();
      const resetScores = { xWins: 0, oWins: 0, draws: 0, sessions: 0, history: [] };
      setScores(resetScores);

      appendAudit({
        userId: activeUser,
        action: 'DELETE',
        reason: 'Reset scores by user request',
        before: beforeScores,
        after: resetScores,
        metadata: { component: 'App' },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unexpected error';
      setError(message);
      appendAudit({
        userId: activeUser,
        action: 'ERROR',
        reason: message,
        before: scores,
        after: scores,
      });
    }
  };

  const onCellClick = (index) => {
    setError(null);
    try {
      // Disallow human move if it's AI turn in HvAI mode
      const isHvAI = mode === 'HUMAN_VS_AI';
      const aiPlaysAs = isHvAI ? (activeUser === 'X' ? 'O' : 'X') : null;
      if (isHvAI && state.nextPlayer === aiPlaysAs) {
        throw new Error('Wait for AI move');
      }

      const before = state;
      const updated = applyMove(state, index, activeUser);
      setState(updated);
      appendAudit({
        userId: activeUser,
        action: 'MOVE',
        before,
        after: updated,
        metadata: { index },
      });

      // If the move ended the game, update the scoreboard and persist
      if (updated.gameOver) {
        const winner = updated.winner; // 'X' | 'O' | null
        const beforeScores = scores;
        const nextScores = {
          xWins: beforeScores.xWins + (winner === 'X' ? 1 : 0),
          oWins: beforeScores.oWins + (winner === 'O' ? 1 : 0),
          draws: beforeScores.draws + (winner ? 0 : 1),
          sessions: beforeScores.sessions, // incremented on NEW_GAME
          history: [
            ...beforeScores.history,
            { timestamp: new Date().toISOString(), winner, board: updated.board.slice() },
          ].slice(-50), // keep last 50 records to limit growth
        };
        setScores(nextScores);
        saveScores(nextScores);
        appendAudit({
          userId: activeUser,
          action: 'UPDATE',
          reason: 'Update scoreboard after game end',
          before: beforeScores,
          after: nextScores,
          metadata: { result: winner ?? 'DRAW' },
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unexpected error';
      setError(message);
      appendAudit({
        userId: activeUser,
        action: 'ERROR',
        reason: message,
        before: state,
        after: state,
        metadata: { index },
      });
    }
  };

  const handleNewGame = (signature) => {
    // e-signature binding then new game
    try {
      appendAudit({
        userId: activeUser,
        action: 'SIGN',
        reason: 'Signature for NEW_GAME',
        metadata: { signature },
      });
      const before = state;
      const fresh = createInitialState();
      setState(fresh);
      clearAudit(); // clear demo log for fresh session log if desired
      appendAudit({
        userId: activeUser,
        action: 'NEW_GAME',
        before,
        after: fresh,
        reason: 'Start new game',
      });

      // Update sessions counter and persist
      const beforeScores = scores;
      const nextScores = {
        ...beforeScores,
        sessions: beforeScores.sessions + 1,
      };
      setScores(nextScores);
      saveScores(nextScores);
      appendAudit({
        userId: activeUser,
        action: 'UPDATE',
        reason: 'Increment sessions counter for new game',
        before: beforeScores,
        after: nextScores,
        metadata: { field: 'sessions' },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unexpected error';
      setError(message);
      appendAudit({
        userId: activeUser,
        action: 'ERROR',
        reason: message,
        before: state,
        after: state,
      });
    }
  };

  const handleResetBoard = (signature) => {
    try {
      appendAudit({
        userId: activeUser,
        action: 'SIGN',
        reason: 'Signature for RESET',
        metadata: { signature },
      });
      const before = state;
      const reset = { ...createInitialState(), nextPlayer: state.nextPlayer };
      setState(reset);
      appendAudit({
        userId: activeUser,
        action: 'RESET',
        before,
        after: reset,
        reason: 'Reset board',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unexpected error';
      setError(message);
      appendAudit({
        userId: activeUser,
        action: 'ERROR',
        reason: message,
        before: state,
        after: state,
      });
    }
  };

  // Trigger AI move automatically on AI's turn in HvAI mode.
  useEffect(() => {
    const isHvAI = mode === 'HUMAN_VS_AI';
    if (!isHvAI) return;
    if (state.gameOver) return;

    const aiPlayer = activeUser === 'X' ? 'O' : 'X';
    if (state.nextPlayer !== aiPlayer) return;

    const timer = setTimeout(() => {
      try {
        const idx = nextAIMove(state.board, aiPlayer, difficulty);
        const before = state;
        const updated = applyMove(state, idx, aiPlayer);
        setState(updated);
        appendAudit({
          userId: 'AI',
          action: 'MOVE',
          before,
          after: updated,
          metadata: { difficulty, index: idx },
        });

        if (updated.gameOver) {
          const winner = updated.winner;
          const beforeScores = scores;
          const nextScores = {
            xWins: beforeScores.xWins + (winner === 'X' ? 1 : 0),
            oWins: beforeScores.oWins + (winner === 'O' ? 1 : 0),
            draws: beforeScores.draws + (winner ? 0 : 1),
            sessions: beforeScores.sessions,
            history: [
              ...beforeScores.history,
              { timestamp: new Date().toISOString(), winner, board: updated.board.slice() },
            ].slice(-50),
          };
          setScores(nextScores);
          saveScores(nextScores);
          appendAudit({
            userId: 'AI',
            action: 'UPDATE',
            reason: 'Update scoreboard after game end',
            before: beforeScores,
            after: nextScores,
            metadata: { result: winner ?? 'DRAW', difficulty },
          });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unexpected error';
        setError(message);
        appendAudit({
          userId: 'AI',
          action: 'ERROR',
          reason: message,
          before: state,
          after: state,
          metadata: { difficulty },
        });
      }
    }, 300); // small delay to feel natural

    return () => clearTimeout(timer);
  }, [mode, difficulty, state, activeUser]);

  // Inline component: signature-confirmed Reset Scores action
  const SignatureResetScores = ({ onConfirm }) => {
    const [open, setOpen] = React.useState(false);
    const [initials, setInitials] = React.useState('');
    return (
      <>
        <button className="ocean-btn error" onClick={() => setOpen(true)} aria-label="Reset scores">
          Reset Scores
        </button>
        {open && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Signature confirmation for reset scores">
            <div className="modal ocean-card">
              <h3 style={{ marginTop: 0 }}>Confirm reset scores</h3>
              <p className="subtle">Type your initials to sign and confirm deleting all score history.</p>
              <input
                aria-label="Initials for score reset"
                className="sig-input"
                placeholder="Your initials"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                maxLength={8}
              />
              <div className="stack" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="ocean-btn secondary" onClick={() => setOpen(false)}>Cancel</button>
                <button
                  className="ocean-btn"
                  onClick={() => { onConfirm({ initials: initials.trim() }); setOpen(false); setInitials(''); }}
                  disabled={!initials.trim()}
                >
                  Sign & Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="center-wrap">
      <div className="app-container">
        <div className="header">
          <h1>Ocean Tic Tac Toe</h1>
          <div className="subtle">Audit entries: {auditCount}</div>
        </div>
        <div className="stack-vert">
          <div className="ocean-card" style={{ padding: 16 }}>
            <StatusBar state={state} activeUser={activeUser} error={error} mode={mode} difficulty={difficulty} />
            <Board
              board={state.board}
              gameOver={state.gameOver}
              onCellClick={onCellClick}
              nextPlayer={state.nextPlayer}
            />
          </div>
          <Controls
            state={state}
            activeUser={activeUser}
            onSwitchUser={switchUser}
            onNewGame={handleNewGame}
            onResetBoard={handleResetBoard}
            mode={mode}
            difficulty={difficulty}
            onChangeMode={(m) => setMode(m)}
            onChangeDifficulty={(d) => setDifficulty(d)}
          />
          <ScorePanel scores={scores} />
          <div className="ocean-card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <small className="subtle">
                Tip: Select identity (X/O). In Human vs AI, the AI plays the opposite mark and moves automatically.
                New Game clears audit (demo) and starts fresh. Reset preserves turn.
              </small>
              <SignatureResetScores onConfirm={handleResetScores} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
