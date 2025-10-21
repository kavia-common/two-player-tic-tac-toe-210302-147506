//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-UI-001
// User Story: As a player, I can click individual cells to place my mark.
// Acceptance Criteria: Cell shows X/O, disabled if filled or game over, styled with theme.
// GxP Impact: NO (UI only), but contributes to usability.
// Risk Level: LOW
// Validation Protocol: VP-TTT-UI-001
// ============================================================================

import React from 'react';
import { Player } from '../types';

type CellProps = {
  index: number;
  value: Player | null;
  disabled?: boolean;
  onClick: (index: number) => void;
} & Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick'>;

/**
 * PUBLIC_INTERFACE
 * Cell
 * Render a single Tic Tac Toe cell respecting theme and disabled state.
 *
 * GxP Critical: No
 * Parameters:
 *  - index: number - cell index
 *  - value: Player|null - displayed mark
 *  - disabled?: boolean - interaction disabled
 *  - onClick: (index) => void - click handler
 * Returns: JSX.Element
 * Throws: never
 * Audit: Interaction is audited at higher level (Board/App).
 */
export default function Cell({ index, value, disabled, onClick }: CellProps) {
  return (
    <button
      aria-label={`Cell ${index}`}
      className="cell"
      onClick={() => onClick(index)}
      disabled={disabled || value !== null}
      data-filled={value !== null}
    >
      <span className={`mark ${value === 'X' ? 'mark-x' : value === 'O' ? 'mark-o' : ''}`}>
        {value ?? ''}
      </span>
      <style>{`
        .cell {
          width: 92px;
          height: 92px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--color-surface);
          border: 1px solid rgba(17,24,39,0.08);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: transform var(--transition), box-shadow var(--transition), background var(--transition), border-color var(--transition);
        }
        .cell:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
          background: linear-gradient(180deg, rgba(59,130,246,0.06), rgba(255,255,255,1));
          border-color: rgba(59,130,246,0.32);
        }
        .cell:disabled {
          cursor: default;
          opacity: 0.9;
        }
        .cell[data-filled="true"] {
          border-color: rgba(17,24,39,0.14);
        }
        .mark {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--color-text);
        }
        .mark-x { color: var(--color-primary); text-shadow: 0 2px 6px rgba(59,130,246,0.25); }
        .mark-o { color: var(--color-success); text-shadow: 0 2px 6px rgba(6,182,212,0.25); }
      `}</style>
    </button>
  );
}
