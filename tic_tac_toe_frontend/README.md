# Ocean Professional Tic Tac Toe (React)

A modern, two-player-on-one-device Tic Tac Toe built with React. Includes in-memory audit trail, validation, error handling, and a simple electronic signature demonstration for critical actions.

## Quick Start

- Install: npm install
- Run: npm start (http://localhost:3000)
- Test: npm test

## Features

- 3x3 board, alternate turns (X then O).
- Win/draw detection and invalid move prevention.
- Ocean Professional theme (blue + slate, rounded corners, subtle shadows).
- In-memory audit trail with:
  - ISO timestamps
  - action types (MOVE, NEW_GAME, RESET, ERROR, SIGN, etc.)
  - before/after state snapshots
  - attributable userId (local role selection X/O)
- Simple E-Signature: confirm modal captures initials and binds to action.
- Basic access control: select which identity (X/O) is acting.

## Architecture

- Game logic: src/lib/game.ts (pure, testable)
- Audit trail: src/lib/audit.ts (append-only in-memory log)
- Validation: src/lib/validation.ts
- UI Components: src/components/*
- Theme: src/styles/theme.css
- Types: src/types.ts

## GxP Notes (Demonstration)

- ALCOA+ Attributable/Contemporaneous/Accurate:
  - appendAudit ensures userId and ISO timestamp; callers log before/after and reasons where applicable.
- Validation:
  - validateBoard and validateMoveIndex used in game logic; invalid operations trigger user-friendly errors and ERROR audit entries.
- Access Control:
  - Player identity selection (X/O) required; actions are attributed.
- Electronic Signature:
  - Critical actions (New Game, Reset) prompt for initials; a SIGN audit entry is recorded and bound to the action.
- Error Handling:
  - try/catch in App component; error shown in UI and recorded as ERROR in audit trail.

## Testing

- Unit tests (Jest via CRA):
  - src/__tests__/game.test.ts: winner detection, draw, invalid moves.
  - src/__tests__/audit.test.ts: entry structure and append-only behavior.
- Target coverage: >=80% for lib files.

## Notes

- This demo uses in-memory storage only; logs are not persisted across refresh unless integrated with a backend.
- No external dependencies added beyond CRA default.
