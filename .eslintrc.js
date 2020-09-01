module.exports =  {
    parser:  '@typescript-eslint/parser',  // Specifies the ESLint parser
    parserOptions: {
      ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      ecmaFeatures: {
      },
    },
    env: {
      browser: true, // enable all browser global variables
      commonjs: true,
      es6: true,
      jest: true,
      node: true
    },
    settings: {
      'import/parser': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          directory: './tsconfig.json'
        },
      }  
    },
    extends:  [
      '@dking/typescript'
    ],
    rules:  {},
  };
  