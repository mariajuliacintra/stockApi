const connect = require("./connect");

let attempts = 0;
const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 5000;

module.exports = function testConnection() {
  connect.query("SELECT 1", (err, result) => {
    if (err) {
      if (attempts < MAX_ATTEMPTS) {
        console.log(`Tentativa de conexão falhou. Tentando novamente em ${RETRY_DELAY / 1000} segundos...`);
        attempts++;
        setTimeout(testConnection, RETRY_DELAY);
      } else {
        console.error("Conexão falhou após várias tentativas. Encerrando o processo.", err);
        process.exit(1); 
      }
    } else {
      console.log("Conexão com o MySQL realizada com sucesso!");
    }
  });
};