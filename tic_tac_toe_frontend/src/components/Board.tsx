//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-UI-002
// User Story: As a player, I can see a 3x3 board and interact with cells.
// Acceptance Criteria: 3x3 grid, delegates click handling, disabled when game over.
// GxP Impact: NO
// Risk Level: LOW
// Validation Protocol: VP-TTT-UI-002
// ============================================================================

import React from 'react';
// @ts-ignore - JSX typing handled by CRA/Babel in mixed JS/TS setup
import Cell from './Cell';
import { Board as BoardType, Player } from '../types';

type BoardProps = {
  board: BoardType;
  gameOver: boolean;
  onCellClick: (index: number) => void;
  nextPlayer: Player;
};

/**
 * PUBLIC_INTERFACE
 * Board
 * Render the 3x3 game board with themed styling.
 *
 * GxP Critical: No
 * Parameters:
 *  - board: Board - current values
 *  - gameOver: boolean - disable cells if true
 *  - onCellClick: handler
 *  - nextPlayer: Player - used if needed for accessibility text
 * Returns: JSX.Element
 * Throws: never
 * Audit: Higher-level components audit user actions.
 */
export default function Board({ board, gameOver, onCellClick }: BoardProps) {
  return (
    <div className="board ocean-card" role="grid" aria-label="Tic Tac Toe Board">
      {board.map((v, i) => (
        <Cell
          key={i}
          index={i}
          value={v}
          onClick={onCellClick}
          disabled={gameOver}
          aria-label={`Cell ${i}`}
        />
      ))}
      <style>{`
        .board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          padding: 16px;
          background: linear-gradient(180deg, rgba(255,255,255,1), rgba(249,250,251,1));
        }
      `}</style>
    </div>
  );
}
