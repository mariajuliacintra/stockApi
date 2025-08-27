# Estoque SENAI - API de Gerenciamento de Estoque

Estoque SENAI é uma API desenvolvida para gerenciar o estoque da oficina mecânica da instituição.  
O sistema abrange materiais, ferramentas, equipamentos, matérias-primas e diversos itens do estoque, permitindo um controle organizado e centralizado para estudantes e administradores.

## Descrição

Este projeto foi desenvolvido como parte de atividades acadêmicas no curso de Desenvolvimento de Sistemas.  
A API fornece funcionalidades para registro, controle, movimentação e relatórios detalhados do estoque da oficina.

## Tecnologias Utilizadas

A API foi construída utilizando:

- **Node.js**  
- **Express.js**  
- **MySQL** (via `mysql2`)  
- **JWT** para autenticação  
- **Bcrypt** para criptografia de senhas  
- **ExcelJS** para geração de planilhas  
- **PDFKit** para geração de relatórios em PDF  
- **Nodemailer** para envio de emails  
- **NodeCron** para agendamento de tarefas  
- **Axios**, **CORS**, **dotenv-safe**


### Passos para Instalação

1. **Clonar o Repositório**

   ```bash
   git clone https://github.com/mariajuliacintra/stockApi.git

   ```

2. **Entre na Pasta**

   ```bash
   cd stockApi
   ```

3. **Executar o projeto via Docker**

- Com o Docker Desktop aberto
- Criar o .env (use o .env.example como exemplo)
- abra o terminal e execute a seguinte linha de código

```bash
    docker-compose up --build
```

4. **Instalar as Dependências**

- Se estiver usando npm, execute:

  ```bash
    npm i
  ```

  4.1. **Iniciar o Servidor de Desenvolvimento**

- Com npm, execute:
  ```bash
    npm start
  ```

## Configuração da Conexão com MySQL

O projeto utiliza o pacote `mysql2` para gerenciar a conexão com o banco de dados MySQL. Para configurar a conexão, crie o arquivo `.env` e o preencha com essas informações:

```javascript
SECRET = "{Segredo usado para criar TokenJWT}";
DB_HOST = "{Seu IP / localhost}";
DB_USER = "{Seu usuário SQL}";
DB_PASSWORD = "{Senha do seu usuário SQL}";
DB_NAME = "stock";
```

## Configuração da Conexão com `nodemailer`

O projeto utiliza o pacote `nodemiler` para envio de e-mails, no arquivo `.env` e o preencha com essas informações:

- É necessário configurar uma Senha de Aplicativo (App Password).

- Ative a Verificação em Duas Etapas na sua conta Google: Configurações de Segurança

- Vá até [Senhas de App](https://myaccount.google.com/apppasswords)

- Copie essa senha e adicione no .env (GMAIL_PASS)

```
GMAIL_USER=seu.email@gmail.com
GMAIL_PASS=sua_senha_de_16_digitos_gerada_aqui
```


## Documentação Completa dos Endpoints

Os exemplos de requisição cURL foram movidos para um arquivo separado. Acesse-os [aqui](https://github.com/mariajuliacintra/stockApi/tree/main/src/documentation).

- Documentação Completa - [Notion](https://www.notion.so/endpoints-24c9ea6603bd81a19209f3446f846808)

## Autores

- [@fogazza](https://github.com/Fogazzaa)

- [@guelin](https://github.com/m1guelzin)

- [@yasmin](https://github.com/souzayasmin)
