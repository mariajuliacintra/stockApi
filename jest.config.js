// jest.config.js

module.exports = {
  // O Jest procurará por arquivos de teste dentro da pasta `tests`
  roots: ['<rootDir>/tests'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // Jest precisa saber onde encontrar a aplicação para o Supertest
  testPathIgnorePatterns: ['/node_modules/'],
};