# CSSTORAGE - API de Gerenciamento de Estoque

CSSTORAGE é uma API desenvolvida para gerenciar o estoque da oficina mecânica da instituição.  
O sistema abrange materiais, ferramentas, equipamentos, matérias-primas e diversos itens do estoque, permitindo um controle organizado e centralizado para estudantes e administradores.

## 📖 Sobre

Este projeto foi desenvolvido como parte de atividades acadêmicas no curso de Desenvolvimento de Sistemas.  
A API fornece funcionalidades para registro, controle, movimentação e relatórios detalhados do estoque da oficina.

---

## ⚙️ Tecnologias

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

---

## 💻 Instalação

### Clonar o repositório
```bash
git clone https://github.com/mariajuliacintra/stockApi.git
```

dentro do projeto -->

⚙️ Configuração
Crie um arquivo .env na raiz do projeto com as variáveis de ambiente.
Configure o .env, com base no .env.example


Configurações de Envio de E-mail (Nodemailer + Gmail)
Este projeto utiliza uma API do Google para envio de e-mails.

⚠️ Não use sua senha principal do Gmail.

É necessário configurar uma Senha de Aplicativo (App Password).

Passos:

-Ative a Verificação em Duas Etapas na sua conta Google: Configurações de Segurança
-Vá até Senhas de App

-App: Correio

-Dispositivo: escolha Outro (ex: “API Projeto”)

-Gere a senha de 16 dígitos.

-Copie essa senha e adicione no .env (gmail_pass):


GMAIL_USER=seu.email@gmail.com
GMAIL_PASS=sua_senha_de_16_digitos_gerada_aqui
```bash
-- Para rodar a API localmente:
npm install
npm start

-- Usando Docker
docker compose build
docker compose up
```

A API estará disponível no endereço configurado
http://localhost:5000/stock

👉 Documentação Completa - Endpoints
https://www.notion.so/endpoints-24c9ea6603bd81a19209f3446f846808

🔒 Autenticação
A autenticação da API é feita via JWT.

Fluxo:
Faça login via endpoint de usuário (via documentação).

O retorno será um JSON com a mensagem de sucesso + token JWT (POSTMAN).

Para acessar as demais rotas protegidas, inclua o token no header da requisição:

📬 Contato
Vinicius Fogaça 
(https://github.com/Fogazzaa)

Miguel Garrido Souza
(https://github.com/m1guelzin)

Yasmin Souza
(https://github.com/souzayasmin)




