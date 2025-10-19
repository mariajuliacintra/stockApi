// jest.config.js

module.exports = {
  // O Jest procurará por arquivos de teste dentro da pasta `tests`
  roots: ['<rootDir>/src/tests'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  // Jest precisa saber onde encontrar a aplicação para o Supertest
  testPathIgnorePatterns: ['/node_modules/'],
};