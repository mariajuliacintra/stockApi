# stockApi

Este é o back-end de um sistema de estoque desenvolvido durante uma Sprint.

## Descrição

Estoque SENAI é uma API desenvolvida para gerenciar o estoque da oficina mecânica da instituição.  
O sistema abrange materiais, ferramentas, equipamentos, matérias-primas e diversos itens do estoque, permitindo um controle organizado e centralizado para estudantes e administradores.

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
- **NodeCron** para verificação de estoque e data de validade
- **Gemini** para geração de dados    
- **Axios**, **CORS**, **dotenv-safe**

## Configuração da Conexão com MySQL

O projeto utiliza o pacote `mysql2` para gerenciar a conexão com o banco de dados MySQL. Para configurar a conexão, crie o arquivo `.env` e o preencha com essas informações:

```javascript
SECRETKEY = "{Segredo usado para criar TokenJWT}";
DATABASEHOST = "{Seu IP / localhost}";
DATABASEUSER = "{Seu usuário SQL}";
DATABASEPASSWORD = "{Senha do seu usuário SQL}";
DATABASENAME = "stock";
```

## Configuração da Conexão com `nodemailer`

O projeto utiliza o pacote `nodemailer` para envio de e-mails, no arquivo `.env` e o preencha com essas informações:

- É necessário configurar uma Senha de Aplicativo (App Password).

- Ative a Verificação em Duas Etapas na sua conta Google: Configurações de Segurança

- Vá até [Senhas de App](https://myaccount.google.com/apppasswords)

- Copie essa senha e adicione no .env (MAILPASSWORD)

```javascript
MAILUSERNAME= "{seu.email@gmail.com}"
MAILPASSWORD= "{Sua Senha de Serviço de 16 Dígitos}"
```

## Configuração da Conexão com `Gemini`

O projeto utiliza o pacote `Gemini` para gerar dados, no arquivo `.env` e o preencha com essas informações:

- É necessário gerar uma apiKey.

- Vá até [AI Studio](https://aistudio.google.com/api-keys)

- Copie essa senha e adicione no .env (GEMINIAPIKEY)

```javascript
GEMINIAPIKEY= "{Chave da Api da Google}"
```

### Passos para Instalação

**1.** **Clonar o Repositório**

   ```bash
   git clone https://github.com/mariajuliacintra/stockApi.git

   ```

**2.** **Entre na Pasta**

   ```bash
   cd stockApi
   ```

**3.** **Executar o projeto via Docker**

- Com o Docker Desktop aberto
- Criar o .env (use o .env.example como exemplo)
- abra o terminal e execute a seguinte linha de código

**3.1.** **Comandos Úteis**

- Cria e roda o container

```bash
    docker-compose up --build
```

- Apaga o container

```bash
    docker-compose down
```

- Apaga o container e os volumes (Banco de Dados)

```bash
    docker-compose down -v
```

**4.** **Instalar as Dependências**

- Se estiver usando npm, execute:

  ```bash
    npm i
  ```

**4.1.** **Iniciar o Servidor de Desenvolvimento**

- Com npm, execute:
  ```bash
    npm start
  ```

## Documentação Completa dos Endpoints

- Documentação Completa - [Notion](https://www.notion.so/endpoints-24c9ea6603bd81a19209f3446f846808)

## Autores

- [@fogazza](https://github.com/Fogazzaa)

- [@guelin](https://github.com/m1guelzin)

- [@yasmin](https://github.com/souzayasmin)
