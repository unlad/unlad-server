/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  rootDir: ".",
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};