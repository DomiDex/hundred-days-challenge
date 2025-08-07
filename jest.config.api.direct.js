module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.api.js'],
  testEnvironment: 'node',
  fakeTimers: {
    enableGlobally: true,
  },
  testMatch: ['<rootDir>/src/__tests__/api/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/src/__tests__/api/test-utils/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^feed$': '<rootDir>/__mocks__/feed.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(feed|xml-js)/)'],
  collectCoverageFrom: ['src/app/api/**/*.{js,jsx,ts,tsx}', '!src/app/api/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
