'use strict';

module.exports = {
    collectCoverage: false,
    collectCoverageFrom: ['src/*/**/*.{js,jsx,ts,tsx}'],
    coverageReporters: ['text-summary', 'lcov'],
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/build', '<rootDir>/coverage'],
    testRegex: '(/__tests__/.*|(\\.|/).+?\\.(test|spec))\\.[jt]sx?$',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};