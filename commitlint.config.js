module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Neue Features
        'fix', // Bug-Fixes
        'docs', // Dokumentation
        'style', // Code-Formatierung (keine funktionalen Änderungen)
        'refactor', // Code-Refactoring
        'perf', // Performance-Verbesserungen
        'test', // Tests hinzufügen oder ändern
        'build', // Build-System oder externe Dependencies
        'ci', // CI-Konfiguration
        'chore', // Sonstige Änderungen (z.B. .gitignore)
        'revert', // Revert eines vorherigen Commits
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-empty': [2, 'never'],
  },
};
