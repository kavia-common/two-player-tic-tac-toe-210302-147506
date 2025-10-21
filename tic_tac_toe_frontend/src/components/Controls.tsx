//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-UI-004
// User Story: As a player, I can select role (X/O), start new games, and reset with signature.
// Acceptance Criteria: Buttons for New Game/Reset; modal to capture initials for critical ops.
// GxP Impact: YES - Electronic signature demonstration.
// Risk Level: MEDIUM
// Validation Protocol: VP-TTT-UI-004
// ============================================================================

import React, { useState } from 'react';
import { GameState, Player } from '../types';

type ControlsProps = {
  state: GameState;
  activeUser: Player;
  onSwitchUser: (p: Player) => void;
  onNewGame: (signature: { initials: string }) => void;
  onResetBoard: (signature: { initials: string }) => void;
};

/**
 * PUBLIC_INTERFACE
 * Controls
 * Renders action controls and role selection with signature capture.
 *
 * GxP Critical: Yes (signature capture for critical actions)
 * Parameters: see ControlsProps
 * Returns: JSX.Element
 * Throws: never
 * Audit: Critical operations must be logged by parent with SIGN and respective action.
 */
export default function Controls({
  state,
  activeUser,
  onSwitchUser,
  onNewGame,
  onResetBoard,
}: ControlsProps) {
  const [showModal, setShowModal] = useState<null | 'new' | 'reset'>(null);
  const [initials, setInitials] = useState('');

  const confirm = () => {
    if (!initials.trim()) return;
    const sig = { initials: initials.trim() };
    if (showModal === 'new') onNewGame(sig);
    if (showModal === 'reset') onResetBoard(sig);
    setInitials('');
    setShowModal(null);
  };

  return (
    <>
      <div className="controls ocean-card">
        <div className="row">
          <div className="stack">
            <button
              className={`ocean-btn ${activeUser === 'X' ? '' : 'secondary'}`}
              onClick={() => onSwitchUser('X')}
              aria-pressed={activeUser === 'X'}
            >
              Use X
            </button>
            <button
              className={`ocean-btn ${activeUser === 'O' ? '' : 'secondary'}`}
              onClick={() => onSwitchUser('O')}
              aria-pressed={activeUser === 'O'}
            >
              Use O
            </button>
          </div>
          <div className="stack">
            <button className="ocean-btn success" onClick={() => setShowModal('new')}>
              New game
            </button>
            <button className="ocean-btn error" onClick={() => setShowModal('reset')} disabled={!state.board.some(Boolean)}>
              Reset board
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Signature confirmation">
          <div className="modal ocean-card">
            <h3 style={{ marginTop: 0 }}>Confirm action</h3>
            <p className="subtle">
              Please type your initials to electronically sign this {showModal === 'new' ? 'New Game' : 'Reset Board'} action.
            </p>
            <input
              aria-label="Initials"
              className="sig-input"
              placeholder="Your initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value)}
              maxLength={8}
            />
            <div className="stack" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="ocean-btn secondary" onClick={() => setShowModal(null)}>Cancel</button>
              <button className="ocean-btn" onClick={confirm} disabled={!initials.trim()}>Sign & Continue</button>
            </div>
          </div>
          <style>{`
            .modal-backdrop {
              position: fixed;
              inset: 0;
              background: rgba(17,24,39,0.4);
              display: grid;
              place-items: center;
              padding: 16px;
              z-index: 50;
            }
            .modal {
              max-width: 420px;
              width: 100%;
              padding: 16px;
              background: var(--color-surface);
            }
            .sig-input {
              width: 100%;
              padding: 10px 12px;
              border-radius: 10px;
              border: 1px solid rgba(17,24,39,0.12);
              outline: none;
              transition: border-color var(--transition), box-shadow var(--transition);
            }
            .sig-input:focus {
              border-color: rgba(59,130,246,0.5);
              box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
            }
            .controls {
              padding: 14px;
            }
            .row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              flex-wrap: wrap;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
