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

async function sendWarningEmail(toEmails, subject, message, items) {
    try {
        const templatePath = path.join(__dirname, 'templates', 'warningEmail.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');

        // Determina se o e-mail é sobre validade ou estoque mínimo.
        const isExpirationEmail = items.some(item => 'expirationDate' in item);

        // Gera o cabeçalho da tabela dinamicamente
        let tableHeaderHtml = '';
        if (isExpirationEmail) {
            tableHeaderHtml = `
                <tr>
                    <th>Categoria</th>
                    <th>Nome</th>
                    <th>Lote</th>
                    <th>Data de Validade</th>
                    <th>Status</th>
                </tr>
            `;
        } else {
            tableHeaderHtml = `
                <tr>
                    <th>Nome</th>
                    <th>Código SAP</th>
                    <th>Total em Estoque</th>
                    <th>Estoque Mínimo</th>
                </tr>
            `;
        }

        // Gera as linhas da tabela
        let itemsHtml = '';
        if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
                if (isExpirationEmail) {
                    const expirationDate = item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('pt-BR') : 'N/A';
                    itemsHtml += `
                        <tr>
                            <td>${item.categoryValue || 'N/A'}</td>
                            <td>${item.name || 'N/A'}</td>
                            <td>${item.lotNumber || 'N/A'}</td>
                            <td>${expirationDate}</td>
                            <td>${item.status || 'N/A'}</td>
                        </tr>
                    `;
                } else {
                    itemsHtml += `
                        <tr>
                            <td>${item.name || 'N/A'}</td>
                            <td>${item.sapCode || 'N/A'}</td>
                            <td>${item.totalQuantity || 'N/A'}</td>
                            <td>${item.minimumStock || 'N/A'}</td>
                        </tr>
                    `;
                }
            });
        } else {
            // Caso não haja itens para exibir (para evitar que a tabela seja gerada vazia).
            itemsHtml = '<tr><td colspan="5">Nenhum item encontrado.</td></tr>';
        }

        // Substitui os placeholders no template
        htmlTemplate = htmlTemplate.replace('{{message}}', message);
        htmlTemplate = htmlTemplate.replace('{{tableHeader}}', tableHeaderHtml);
        htmlTemplate = htmlTemplate.replace('{{items}}', itemsHtml);

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: toEmails.join(', '),
            subject: subject,
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Erro ao enviar e-mail de aviso:', error);
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
