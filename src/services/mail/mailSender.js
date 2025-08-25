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

async function sendVerificationEmail(email, code, templateName) {
    try {
        const templatePath = path.join(__dirname, 'templates', templateName);
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

async function sendProfileUpdatedEmail(email, userData) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'profileUpdated.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');
        htmlTemplate = htmlTemplate.replace('{{name}}', userData.name);
        htmlTemplate = htmlTemplate.replace('{{email}}', userData.email);
        
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Seu Perfil Foi Atualizado',
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail de confirmação de atualização:", error);
        return false;
    }
}

async function sendDeletionEmail(email, name) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'profileDeleted.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');
        htmlTemplate = htmlTemplate.replace('{{name}}', name);
        
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Confirmação de Deleção de Conta',
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail de confirmação de deleção:", error);
        return false;
    }
}

async function sendPasswordRecoveryEmail(email, code) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'passwordReset.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');
        htmlTemplate = htmlTemplate.replace('{{code}}', code);
        
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Recuperação de Senha',
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail de atualização de senha:", error);
        return false;
    }
}

async function sendWarningEmail(toEmails, items) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'warningEmail.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');

        let itemsHtml = '';
        items.forEach(item => {
            itemsHtml += `
            <tr>
                <td>${item.itemType}</td>
                <td>${item.name}</td>
                <td>${item.batchNumber}</td>
                <td>${item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td>${item.status}</td>
            </tr>
            `;
        });

        htmlTemplate = htmlTemplate.replace('{{items}}', itemsHtml);

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: toEmails.join(', '),
            subject: 'Aviso de Validade de Itens de Estoque',
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    sendVerificationEmail,
    sendProfileUpdatedEmail,
    sendDeletionEmail,
    sendPasswordRecoveryEmail,
    sendWarningEmail
};
