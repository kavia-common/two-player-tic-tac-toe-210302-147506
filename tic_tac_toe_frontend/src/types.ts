//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-TYPES-001
// User Story: As a developer, I need shared types for game state and audit entries to ensure consistency.
// Acceptance Criteria: Types cover board state, players, audit entries, and actions.
// GxP Impact: YES - Types ensure data integrity and legibility.
// Risk Level: LOW
// Validation Protocol: VP-TTT-BASE-001
// ============================================================================

/**
 * PUBLIC_INTERFACE
 * Player symbols permitted in the game.
 */
export type Player = 'X' | 'O';

/**
 * PUBLIC_INTERFACE
 * A 3x3 Tic Tac Toe board represented as a flat array of 9 cells.
 * Each cell contains the Player symbol or null if empty.
 */
export type Board = Array<Player | null>;

/**
 * PUBLIC_INTERFACE
 * Represents the full game state for audit and UI updates.
 */
export interface GameState {
  board: Board;
  nextPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  gameOver: boolean;
}

/**
 * PUBLIC_INTERFACE
 * Audit action types allowed.
 */
export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'MOVE'
  | 'RESET'
  | 'NEW_GAME'
  | 'ERROR'
  | 'SIGN';

/**
 * PUBLIC_INTERFACE
 * Structure of an audit entry to satisfy ALCOA+.
 */
export interface AuditEntry<T = unknown> {
  id: string; // unique id for entry
  userId: string; // attributable
  timestamp: string; // ISO 8601
  action: AuditAction;
  reason?: string;
  before?: T;
  after?: T;
  metadata?: Record<string, unknown>;
}

/**
 * PUBLIC_INTERFACE
 * GameMode indicates whether two humans are playing locally or one human vs AI.
 */
export type GameMode = 'HUMAN_VS_HUMAN' | 'HUMAN_VS_AI';

/**
 * PUBLIC_INTERFACE
 * AI difficulty levels available.
 */
export type AIDifficulty = 'EASY' | 'OPTIMAL';
