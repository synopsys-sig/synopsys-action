/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  clearMocks: false,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/contract/**/*.e2e.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  "moduleDirectories": [
    "node_modules",
    "src"
  ]
}