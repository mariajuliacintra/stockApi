const connect = require("../db/connect");
const { validatePassword } = require("../utils/functions");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Seu Código de Verificação',
    html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                .email-container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                .code { display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; color: #ffffff; background-color: #007bff; border-radius: 5px; margin-top: 20px; }
                h1 { color: #333333; }
                p { color: #666666; line-height: 1.6; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <h1>Verificação de Conta</h1>
                <p>Olá,</p>
                <p>Para concluir a verificação da sua conta, use o código abaixo:</p>
                <div class="code">${code}</div>
                <p style="margin-top: 20px;">Este código é válido por 5 minutos. Se você não solicitou esta verificação, ignore este e-mail.</p>
                <p>Atenciosamente,<br>Sua Equipe</p>
            </div>
        </body>
        </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

const validateUser = function ({ name, email, password, confirmPassword }) {
  const senaiDomains = [
    "@sp.senai.br",
    "@gmail.com"
  ];

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Todos os campos devem ser preenchidos" };
  }
  if (!email.includes("@")) {
    return { error: "Email inválido. Deve conter @" };
  }
  const emailDomain = email.substring(email.lastIndexOf("@"));
  if (!senaiDomains.includes(emailDomain)) {
    return {
      error: "Email inválido. Deve pertencer a um domínio SENAI autorizado",
    };
  }
  if (password != confirmPassword) {
    return { error: "As senhas não coincidem" };
  }
  if (!validatePassword(password)) {
    return {
      error:
        "A senha deve ter no mínimo 8 caracteres, incluindo letras, números e um caractere especial.",
    };
  }
  return null;
};

const validateEmail = async function (email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT idUser FROM user WHERE email = ?";
    const values = [email];

    connect.query(query, values, (err, results) => {
      if (err) {
        return reject("Erro ao verificar email");
      }
      if (results.length > 0) {
        return resolve({
          error: "O Email já está vinculado a outro usuário",
        });
      }
      return resolve(null);
    });
  });
};

const validateLogin = function ({ email, password }) {
  const senaiDomains = [
    "@sp.senai.br",
  ];
  if (!email || !password) {
    return { error: "Todos os campos devem ser preenchidos" };
  }
  if (!email.includes("@")) {
    return { error: "Email inválido. Deve conter @" };
  }
  const emailDomain = email.substring(email.lastIndexOf("@"));
  if (!senaiDomains.includes(emailDomain)) {
    return {
      error: "Email inválido. Deve pertencer a um domínio SENAI autorizado",
    };
  }
  return null;
};

module.exports = {
  validateUser,
  validateEmail,
  validateLogin,
  generateRandomCode,
  sendVerificationEmail,
};
