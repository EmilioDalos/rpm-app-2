module.exports = {
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testMatch: ["**/test/**/*.test.js", "**/test/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/Mendix/SocialFlexModel-Feature_branch_Maandsluiting_2/"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
};
