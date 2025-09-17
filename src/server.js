const app = require("./index");
const cors = require("cors");
const testConnect = require('./db/testConnect');

const port = process.env.PORT || 5000;

testConnect();

const corsOptions = {
    origin: '*', // qual o ip vai poder usar esses métodos, '*' = todos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // métodos http permitidos
    credentials: true, // permiti o uso de cookies e credenciais
    optionsSucessStatus: 204, // define o método de resposta para o método option
};

app.use(cors(corsOptions));

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
