const fs = require('fs');
const https = require('https');
const http = require('http');
const app = require("./index");

// Opções para o HTTPS com os certificados gerados
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/maju-api.eastus2.cloudapp.azure.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/maju-api.eastus2.cloudapp.azure.com/fullchain.pem')
};

// Iniciar o servidor HTTPS na porta 5000
https.createServer(options, app).listen(5000, () => {
  console.log('Servidor HTTPS rodando na porta 5000');
});

// (Opcional) Redirecionar HTTP para HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80, () => {
  console.log('Redirecionamento HTTP para HTTPS habilitado na porta 80');
});
