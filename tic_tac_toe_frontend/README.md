# Ocean Professional Tic Tac Toe (React)

A modern, two-player-on-one-device Tic Tac Toe built with React. Includes in-memory audit trail, validation, error handling, AI opponent (Easy/Optimal), persistent score history, and simple electronic signature demonstrations for critical actions.

## Quick Start

- Install: npm install
- Run: npm start (http://localhost:3000)
- Test: npm test

## Features

- 3x3 board, alternate turns (X then O).
- Win/draw detection and invalid move prevention.
- Ocean Professional theme (blue + slate, rounded corners, subtle shadows).
- Human vs Human and Human vs AI modes with selectable AI difficulty:
  - Easy: random valid moves.
  - Optimal: minimax with alpha-beta pruning for best play.
- Persistent scoreboard and history via localStorage:
  - Aggregates X wins, O wins, draws, sessions count, and a rolling history of results.
  - Data is validated on load and defaults are returned if corruption is detected.
- Reset Scores with signature: a modal collects user initials and binds the signature to the delete action.
- In-memory audit trail with:
  - ISO timestamps
  - action types (CREATE, READ, UPDATE, DELETE, MOVE, NEW_GAME, RESET, ERROR, SIGN)
  - before/after state snapshots where applicable
  - attributable userId (X, O, or AI for automated moves)
  - metadata such as AI difficulty, move indices, results, and signature details
- Basic access control: select which identity (X/O) is acting.

## Usage

### Selecting game mode and difficulty
Open the Controls panel below the board. Use “Mode” to switch between:
- Human vs Human: two local players alternate turns.
- Human vs AI: the currently selected identity (X or O) represents the human; the AI plays the opposite mark.
When in Human vs AI, the “AI difficulty” dropdown becomes active:
- Easy selects a random valid move.
- Optimal uses a minimax strategy with alpha–beta pruning to avoid mistakes and to block or win when possible.

### How AI turns work
In Human vs AI mode, after your valid move is recorded, the game automatically schedules the AI move with a short delay to feel natural. If you try to play again while it is the AI’s turn, the app will display an alert instructing you to wait for the AI move. AI moves are fully audited and indicate the difficulty used and the chosen cell index in the metadata.

### Understanding StatusBar and ScorePanel
- StatusBar shows the active identity, next player, and the current result (winner or draw). It also reflects the selected mode and AI difficulty. Any errors (e.g., “Wait for AI move”, invalid actions) are shown as an alert banner.
- ScorePanel shows aggregate counters for X wins, O wins, and draws, and displays a recent-game list with timestamps and outcomes. The sessions counter increments each time you start a new game with signature confirmation.

### Resetting scores (signature required)
Use the “Reset Scores” button in the footer card. A confirmation modal appears and requires initials. Upon confirmation:
- A SIGN audit entry records the signature.
- A DELETE audit entry records the score reset with before/after snapshots and embeds the signature metadata.
- The scoreboard is cleared to zeros and persisted in localStorage.

## Architecture

- Game logic: src/lib/game.ts (pure, testable)
- AI logic: src/lib/ai.ts (Easy/Optimal move selection)
- Score persistence: src/lib/persistence.ts (localStorage with validation and fail-closed behavior)
- Audit trail: src/lib/audit.ts (append-only in-memory log)
- Validation: src/lib/validation.ts
- UI Components: src/components/*
- Theme: src/styles/theme.css
- Types: src/types.ts
- App composition: src/App.js (ties together game, AI orchestration, audit, persistence)

## Audit & Compliance (GxP)

### ALCOA+ mapping
- Attributable: Audit entries include userId; automated turns use userId = “AI”.
- Legible: Code and documentation include JSDoc and structure comments; log schema is simple and consistent.
- Contemporaneous: Entries are appended at the moment of action with ISO timestamps.
- Original: Append-only in-memory log for demo; before/after snapshots preserve data provenance for each change.
- Accurate: Validation guards in game, validation, and persistence modules prevent invalid state transitions.
- Complete: MOVE, NEW_GAME, RESET, UPDATE, DELETE, ERROR, SIGN actions capture relevant metadata and reasons.
- Consistent: All audit writes go through appendAudit with validation of required fields and allowed actions.
- Enduring: Scoreboard persists to localStorage with schema validation and default fallback on corruption.
- Available: Local identity selection ensures actions can be attributed even without authentication backend.

### Audit entries for AI and scores
- AI MOVE: userId = “AI”, action = MOVE, metadata includes difficulty and index; before/after capture board transitions.
- SCORE UPDATE (on game end): userId = “X”, “O”, or “AI” depending on actor, action = UPDATE with before/after scoreboard and metadata.result = “X”, “O”, or “DRAW”. When AI finishes a game, difficulty is captured in metadata.
- SCORE RESET: action = DELETE with before/after of the scoreboard and metadata.signature containing initials. A preceding SIGN entry binds the signature to the critical operation.
- NEW_GAME: action = NEW_GAME with before/after board state; scoreboard sessions is incremented via UPDATE with before/after.

## Testing

Unit and integration tests were added to verify AI behavior, persistence, and audit extensions:

- src/__tests__/ai.test.ts
  Verifies EASY only selects empty cells and throws when no moves are available. Validates OPTIMAL wins when possible, blocks immediate threats, and chooses strong opening squares.
- src/__tests__/persistence.test.ts
  Ensures scoreboard defaults when absent or corrupted, roundtrips valid data, clears data correctly, and fails closed on invalid structures.
- src/__tests__/audit-extensions.test.ts
  Confirms AI MOVE entries include difficulty and index metadata; validates scoreboard UPDATE and DELETE include before/after and relevant metadata (result, signature).
- src/__tests__/app-ai.integration.test.tsx
  Exercises Human vs AI flow end-to-end: AI auto-moves after human, prevents human double move during AI turn, updates scoreboard on game end, persists across reloads, and clears on signature-confirmed reset.

Target coverage remains >=80% for core library modules.

## Traceability

- REQ-TTT-AI-001 (AI Opponent Easy/Optimal)
  - Implementation: src/lib/ai.ts; orchestration and audit in src/App.js; mode and difficulty selection in src/components/Controls.tsx; status display in src/components/StatusBar.tsx.
  - Tests: src/__tests__/ai.test.ts, src/__tests__/app-ai.integration.test.tsx.
- REQ-TTT-SCORE-001 (Persistent Score History and Reset with Signature)
  - Implementation: src/lib/persistence.ts; integration and audit in src/App.js; display in src/components/ScorePanel.tsx; signature flows in src/components/Controls.tsx and App footer.
  - Tests: src/__tests__/persistence.test.ts, src/__tests__/audit-extensions.test.ts, src/__tests__/app-ai.integration.test.tsx.

## Release Gate Checklist

- Inputs validated across modules:
  - Board and moves validated via src/lib/validation.ts
  - Scoreboard schema validated in src/lib/persistence.ts
- Audit trail implemented for:
  - Human moves, AI moves, new game, resets, score updates, errors, and signatures
- Electronic signature:
  - Modal capture with initials for New Game, Reset Board, and Reset Scores; SIGN entries precede critical actions; signature metadata is bound to subsequent audit entries
- Unit test coverage >= 80% for lib modules; all unit tests green
- Integration tests pass; verify AI auto-moves, persistence, and reset flow
- Error handling:
  - try/catch around critical interactions with user-friendly alerts and ERROR audit entries
- Documentation complete:
  - This README documents features, usage, GxP mapping, tests, and traceability
- Security and access controls:
  - Local identity selection ensures attribution; no network I/O or external dependencies introduced
- Performance acceptable for the demo scope; AI uses efficient minimax with pruning for Tic Tac Toe
- Code review ready

## Notes

- This demo uses in-memory audit storage; logs are not persisted across refresh unless integrated with a backend.
- Scoreboard is persisted in localStorage with schema validation and defaults on corruption.
- No external dependencies added beyond CRA defaults.
