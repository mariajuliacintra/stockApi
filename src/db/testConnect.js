const connect = require("./connect");

let attempts = 0;
const MAXATTEMPTS = 10;
const DELAY = 5000;

module.exports = function testConnection() {
  connect.query("SELECT 1", (err, result) => {
    if (err) {
      if (attempts < MAXATTEMPTS) {
        console.log(`Tentativa de conexão falhou. Tentando novamente em ${DELAY / 1000} segundos...`);
        attempts++;
        setTimeout(testConnection, DELAY);
      } else {
        console.error("Conexão falhou após várias tentativas. Encerrando o processo.", err);
        process.exit(1); 
      }
    } else {
      console.log("Conexão com o MySQL realizada com sucesso!");
    }
  });
};