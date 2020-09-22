module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jest-environment-node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testPathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/node_modules/"
  ],
  "transformIgnorePatterns": [
    "<rootDir>/node_modules/"
  ],
  globals: {
    "ts-jest": {
      tsConfig: {
        allowJs: true
      }
    }
  }
};
