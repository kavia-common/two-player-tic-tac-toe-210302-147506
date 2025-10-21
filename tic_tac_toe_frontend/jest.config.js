/**
 * Jest configuration to enable running TypeScript-based unit tests in a CRA app without adding new deps.
 * CRA provides babel-jest and a default transform via react-app preset; we extend to include ts/tsx mapping.
 */
module.exports = {
  preset: 'react-app',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testEnvironment: 'jsdom',
};
