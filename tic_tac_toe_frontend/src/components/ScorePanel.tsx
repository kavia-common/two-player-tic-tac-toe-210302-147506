//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-UI-005
// User Story: As a player, I can view cumulative scores and a short recent history.
// Acceptance Criteria: Totals for X/O/Draws and a list of last 5 results.
// GxP Impact: NO (Display only); persistence and audit handled elsewhere.
// Risk Level: LOW
// Validation Protocol: VP-TTT-UI-005
// ============================================================================

import React from 'react';
import { ScoreBoard, ScoreRecord } from '../types';

type ScorePanelProps = {
  scores: ScoreBoard;
  maxHistory?: number;
};

/**
 * PUBLIC_INTERFACE
 * ScorePanel
 * Render the scoreboard totals and the most recent history entries.
 *
 * GxP Critical: No
 * Parameters:
 *  - scores: ScoreBoard - aggregated data
 *  - maxHistory?: number - how many history items to display (default 5)
 * Returns: JSX.Element
 * Throws: never
 * Audit: Read/display only; no audit writes here.
 */
export default function ScorePanel({ scores, maxHistory = 5 }: ScorePanelProps) {
  const recent: ScoreRecord[] = scores.history.slice(-maxHistory).reverse();

  return (
    <div className="ocean-card" style={{ padding: 12 }}>
      <div className="header" style={{ marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Scoreboard</h3>
        <span className="subtle">Sessions: {scores.sessions}</span>
      </div>
      <div className="stack" style={{ marginBottom: 8, flexWrap: 'wrap' as const }}>
        <div className="ocean-badge"><span>X Wins</span><strong style={{ color: 'var(--color-primary)' }}>{scores.xWins}</strong></div>
        <div className="ocean-badge"><span>O Wins</span><strong style={{ color: 'var(--color-success)' }}>{scores.oWins}</strong></div>
        <div className="ocean-badge"><span>Draws</span><strong style={{ color: 'var(--color-secondary)' }}>{scores.draws}</strong></div>
      </div>
      <div>
        <div className="subtle" style={{ marginBottom: 6 }}>Recent Games</div>
        {recent.length === 0 ? (
          <div className="subtle">No games played yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {recent.map((r, i) => (
              <li key={i}>
                <span style={{ fontWeight: 600 }}>
                  {r.winner ? `Winner: ${r.winner}` : 'Draw'}
                </span>
                <span className="subtle"> — {new Date(r.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
