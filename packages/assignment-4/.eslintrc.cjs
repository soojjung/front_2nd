module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'], // 우선순위 앞 높음
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  ignorePatterns: ['dist', '.eslintrc.cjs', '**/__tests__/*.js'], // eslint 무시
  rules: {
    // 여기에 custom 규칙 추가
    'no-var': 'warn', // var 금지
    'no-multiple-empty-lines': 'warn', // 여러 줄 공백 금지
    'no-console': ['warn', { allow: ['warn', 'error'] }], // console.log() 금지
    eqeqeq: 'warn', // 일치 연산자 사용 필수
    'dot-notation': 'warn', // 가능하다면 dot notation 사용
    'no-unused-vars': 'warn', // 사용하지 않는 변수 금지
    'prettier/prettier': 'error',
  },
};
