// ============================================================================
// COMMITLINT CONFIGURATION
// Enforces conventional commits for fintech audit trails
// Format: <type>(<scope>): <subject>
// Example: feat(auth): add 2FA support for banking transactions
// ============================================================================

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the following
    'type-enum': [
      2,
      'always',
      [
        'feat',       // New feature
        'fix',        // Bug fix
        'docs',       // Documentation
        'style',      // Formatting, missing semicolons, etc.
        'refactor',   // Code restructuring without changing behavior
        'perf',       // Performance improvements
        'test',       // Adding/fixing tests
        'build',      // Build system or external dependencies
        'ci',         // CI/CD configuration
        'chore',      // Maintenance tasks
        'revert',     // Reverting a previous commit
        'security',   // Security patches (critical for fintech)
        'hotfix',     // Production hotfixes
        'release',    // Release commits
      ],
    ],
    // Scope is optional but recommended
    'scope-enum': [
      1, // Warning level (not enforced)
      'always',
      [
        'frontend',
        'backend',
        'auth',
        'payments',
        'accounts',
        'kyc',
        'transfers',
        'notifications',
        'api',
        'db',
        'docker',
        'ci',
        'config',
        'deps',
        'infra',
        'ledger',
        'compliance',
      ],
    ],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
    'header-max-length': [2, 'always', 120],
  },
};
