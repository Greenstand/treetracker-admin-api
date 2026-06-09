module.exports = {
  testEnvironment: 'jest-environment-node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(.*/)?uuid/)'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: { allowJs: true } }],
  },
};
