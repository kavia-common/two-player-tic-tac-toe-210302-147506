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

import { Board, StatusBar, Controls } from './components';

import { createInitialState, applyMove } from './lib/game';
import { appendAudit, getAuditLog, clearAudit } from './lib/audit';

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
  // error surface
  const [error, setError] = useState(null);

  // on mount: record initial create
  useEffect(() => {
    try {
      appendAudit({
        userId: activeUser,
        action: 'CREATE',
        after: state,
        metadata: { component: 'App', message: 'Initial state created' },
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

  const onCellClick = (index) => {
    setError(null);
    try {
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

  return (
    <div className="center-wrap">
      <div className="app-container">
        <div className="header">
          <h1>Ocean Tic Tac Toe</h1>
          <div className="subtle">Audit entries: {auditCount}</div>
        </div>
        <div className="stack-vert">
          <div className="ocean-card" style={{ padding: 16 }}>
            <StatusBar state={state} activeUser={activeUser} error={error} />
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
          />
          <div className="ocean-card" style={{ padding: 12 }}>
            <small className="subtle">
              Tip: Select identity (X/O), click a square to play. New Game clears audit (demo) and starts fresh. Reset preserves turn.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
