const app = require("./index");
const cors = require("cors");
const testConnect = require('./db/testConnect');

const port = process.env.PORT || 5000;

testConnect();

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSucessStatus: 204,
};

app.use(cors(corsOptions));

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
