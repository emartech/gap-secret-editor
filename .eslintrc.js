module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:vue/strongly-recommended',
    'eslint:recommended',
    'emarsys'
  ],
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-prototype-builtins': 'off',
    'jest/no-try-expect': 'off',
    'curly': ['error', 'multi-line'],
    'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }]
  },
  overrides: [
    {
      files: ['*.spec.js', 'test-helpers/*.js'],
      env: {
        'mocha': true
      },
      rules: {
        'no-unused-expressions': 'off'
      },
      globals: {
        expect: true,
        should: true,
        sinon: true
      }
    }
  ]
}
