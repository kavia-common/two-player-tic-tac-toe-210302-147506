/* Ambient declarations to allow importing .ts modules and types in a JS-based CRA without type checking during Jest runtime. */
declare module '*.ts';
declare module '*.tsx';

// Minimal ambient re-exports to satisfy JS imports referencing TS modules in runtime (no type checking in Jest/CRA runtime)
declare module './lib/persistence.ts' {
  export function getScores(): any;
  export function saveScores(scoreBoard: any): void;
  export function clearScores(): void;
}
