// src/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const path = require('path');
const fs = require('fs');

// Define o diretório base como a raiz 'src' (subindo um nível de 'config')
const baseDir = path.join(__dirname, '..');
const docsDir = path.join(baseDir, 'docs');

// 1. Importa os arquivos estáticos de definição e componentes
// NOTE: Estes arquivos (swaggerDef.js e components.js) são considerados existentes.
const swaggerDefinition = require(path.join(docsDir, 'swaggerDef.js'));
const componentsDefinition = require(path.join(docsDir, 'components.js'));

// 2. Mescla o 'components' e a definição principal
const definition = {
    ...swaggerDefinition,
    ...componentsDefinition, // Mescla components, securitySchemes, etc.
    paths: {}, // Inicializa o objeto paths
};

// 3. Encontra dinamicamente e importa todos os arquivos de paths
const pathsDir = path.join(docsDir, 'paths');

try {
    // Lê o diretório de paths de forma síncrona e filtra apenas arquivos .js
    const jsFiles = fs.readdirSync(pathsDir).filter(file => file.endsWith('.js'));

    // Importa e mescla o conteúdo de cada arquivo de paths
    jsFiles.forEach(file => {
        const absolutePath = path.join(pathsDir, file);
        // Usa require para importar o objeto de paths
        const pathsObject = require(absolutePath); 

        // Mescla as novas rotas no objeto 'definition.paths'
        definition.paths = {
            ...definition.paths,
            ...pathsObject,
        };
    });

} catch (error) {
    // Mantém a lógica de erro em caso de falha na leitura ou importação
    console.error(`[ERRO SWAGGER] Não foi possível ler ou importar o diretório de paths: ${pathsDir}`, error.message);
    // Para garantir que a aplicação não trave se o swagger for usado em produção
    definition.paths = {}; 
}

// 4. Configura as opções do swaggerJsdoc
const options = {
    // A definição completa já está montada
    definition: definition, 
    // Mantido como array vazio, pois a documentação é montada via arquivos estáticos
    apis: [], 
};

// Gera a especificação final
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;