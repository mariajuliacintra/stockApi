const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

async function sendVerificationEmail(email, code) {
    try {
        const templatePath = path.join(__dirname, 'templates/mailVerification.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');
        htmlTemplate = htmlTemplate.replace('{{code}}', code);

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Seu Código de Verificação',
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail de verificação:", error);
        return false;
    }
}

module.exports = {
    sendVerificationEmail,
};
