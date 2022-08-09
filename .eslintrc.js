module.exports = {
  extends: ['airbnb-typescript-prettier', 'plugin:jsx-a11y/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['*.js'],
      parser: 'babel-eslint',
      rules: {},
    },
  ],
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    'react/no-array-index-key': 0,
    'react/prop-types': 0,
    'react/require-default-props': 0,
    'react/destructuring-assignment': 0,
    'react/static-property-placement': 0,
    'react/function-component-definition': [
      2,
      {
        namedComponents: ['arrow-function', 'function-declaration'],
        unnamedComponents: 'arrow-function',
      },
    ],
    'jsx-a11y/alt-text': 0,
    'react/jsx-props-no-spreading': 0,
    '@typescript-eslint/camelcase': ['off'], // There seems to be no other way to override this than disabling it and rewriting the rules in the naming-convention
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
        // leadingUnderscore: 'allow',
        // trailingUnderscore: 'allow',
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'property',
        format: ['camelCase', 'snake_case', 'PascalCase', 'UPPER_CASE'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['camelCase', 'snake_case', 'UPPER_CASE'],
      },
    ],
    '@typescript-eslint/ban-ts-comment': 1,
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        labelComponents: [],
        labelAttributes: [],
        controlComponents: [],
        assert: 'htmlFor',
        depth: 25,
      },
    ],
    camelcase: 0,
    // TODO: These were disabled during migration to new React
    '@typescript-eslint/ban-types': 0,
    'react/jsx-no-constructed-context-values': 0,
    'no-console': 0,
    'func-names': 0,
    'react/no-unstable-nested-components': 0,
    'react/jsx-no-useless-fragment': 0,
    'import/no-anonymous-default-export': 0,
    'testing-library/no-await-sync-query': 0,
  },
  globals: {
    cy: true,
  },
  plugins: ['jsx-a11y'],
};
