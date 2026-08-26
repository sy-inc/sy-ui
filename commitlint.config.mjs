import conventional from "@commitlint/config-conventional";

/**
 * Commitlint config
 */
const commitLintConfig = {
  extends: ["@commitlint/config-conventional"],
  helpUrl: "https://github.com/sy-ui/sy-ui/blob/main/CONTRIBUTING.md#commit-convention",
  rules: {
    ...conventional.rules,
    "header-max-length": [0],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "refactor",
        "style",
        "docs",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "feature",
      ],
    ],
  },
};

export default commitLintConfig;
