module.exports = {
  openapi: "3.0.0",
  info: {
    title: "SENAI Estoque API",
    description:
      "Documentação da API do sistema de controle de estoque do SENAI. Utilize o botão 'Authorize' para inserir o JWT (apenas o valor do token) após o login.",
    version: "1.2.2",
  },
  servers: [
    {
      url: "https://senai604estoque.eastus2.cloudapp.azure.com/api",
      description: "Servidor de Produção",
    },
    {
      url: "http://localhost:5000/api",
      description: "Servidor Local de Desenvolvimento (Porta padrão 5000)",
    },
  ],
  tags: [
    {
      name: "Location",
      description: "Gerenciamento de locais de estoque",
    },
    {
      name: "Category",
      description: "Gerenciamento de categorias de itens",
    },
    {
      name: "Lot",
      description:
        "Gerenciamento de lotes de itens (Entrada, Saída, Ajuste e Alterações)",
    },
    {
      name: "Technical Spec",
      description:
        "Gerenciamento de chaves para especificações técnicas de itens (ex: Cor, Tensão)",
    },
    {
      name: "Transaction",
      description:
        "Registro de movimentações de estoque e consultas de histórico.",
    },
  ],
  components: {
    securitySchemes: {
      jwtAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description:
          "Insira o JWT (apenas o token) obtido após o login no campo de valor. Ex: **eyJh...**",
      },
    },
  },
  security: [
    {
      jwtAuth: [],
    },
  ],
};