module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    'subject-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 3],
    'subject-case': [2, 'always', 'lower-case']
  }
};