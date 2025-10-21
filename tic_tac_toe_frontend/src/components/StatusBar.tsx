//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-UI-003
// User Story: As a player, I can see the game status, next turn, and winner/draw indications.
// Acceptance Criteria: Status updates dynamically; uses theme badges.
// GxP Impact: NO
// Risk Level: LOW
// Validation Protocol: VP-TTT-UI-003
// ============================================================================

import React from 'react';
import { GameMode, AIDifficulty, GameState, Player } from '../types';

type StatusBarProps = {
  state: GameState;
  activeUser: Player;
  error?: string | null;
  mode?: GameMode;
  difficulty?: AIDifficulty;
};

/**
 * PUBLIC_INTERFACE
 * StatusBar
 * Displays contextual status info with themed badges.
 *
 * GxP Critical: No
 * Parameters:
 *  - state: GameState
 *  - activeUser: Player - currently selected identity
 *  - error?: string|null
 * Returns: JSX.Element
 * Throws: never
 * Audit: Display only; not audited.
 */
export default function StatusBar({ state, activeUser, error, mode, difficulty }: StatusBarProps) {
  const { nextPlayer, winner, isDraw } = state;

  return (
    <div className="status-wrap">
      <div className="stack">
        <div className="ocean-badge">
          <span>Signed in as:</span>
          <strong>{activeUser}</strong>
        </div>
        <div className="ocean-badge" aria-live="polite">
          {winner ? (
            <>
              <span>Winner</span>
              <strong style={{ color: 'var(--color-success)' }}>{winner}</strong>
            </>
          ) : isDraw ? (
            <>
              <span>Result</span>
              <strong style={{ color: 'var(--color-secondary)' }}>Draw</strong>
            </>
          ) : (
            <>
              <span>Next</span>
              <strong style={{ color: 'var(--color-primary)' }}>{nextPlayer}</strong>
            </>
          )}
        </div>
        {mode && (
          <div className="ocean-badge">
            <span>Mode</span>
            <strong>{mode === 'HUMAN_VS_AI' ? 'Human vs AI' : 'Human vs Human'}</strong>
          </div>
        )}
        {mode === 'HUMAN_VS_AI' && difficulty && (
          <div className="ocean-badge">
            <span>AI</span>
            <strong>{difficulty}</strong>
          </div>
        )}
      </div>
      {error ? (
        <div className="error-msg" role="alert">
          {error}
        </div>
      ) : null}
      <style>{`
        .status-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 10px;
        }
        .error-msg {
          color: white;
          background: var(--color-error);
          border-radius: 10px;
          padding: 8px 12px;
          box-shadow: var(--shadow-sm);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
