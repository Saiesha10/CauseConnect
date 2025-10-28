module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^../utils/cloudinary$": "<rootDir>/src/__mocks__/cloudinary.js",
    "^@utils/cloudinary$": "<rootDir>/src/__mocks__/cloudinary.js",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@apollo|graphql|ts-invariant)/)",
    "/node_modules/(?!(@apollo/client|react-router-dom)/)"
  ],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.js"
  ],
};
