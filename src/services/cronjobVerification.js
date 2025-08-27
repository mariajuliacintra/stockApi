const cron = require('node-cron');
const { queryAsync } = require('../utils/functions'); 
const { sendWarningEmail } = require('./mail/mailSender');

// Função para verificar as datas de validade de todos os itens em uma única tabela
async function checkExpirationDates() {
    try {
        // Query unificada para encontrar todos os itens expirados e próximos de vencer
        const queryAllItems = 'SELECT idItem, name, batchCode, expirationDate, category FROM item WHERE expirationDate IS NOT NULL AND (expirationDate < CURDATE() OR expirationDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))';
        
        const allItems = await queryAsync(queryAllItems);

        // Mapeia os resultados para adicionar o status de "Expirado" ou "Próximo de Vencer"
        const itemsWithStatus = allItems.map(item => {
            const status = item.expirationDate < new Date().toISOString().slice(0, 10) ? 'Expirado' : 'Próximo de Vencer';
            return {
                ...item,
                status,
                // O tipo do item já está na coluna 'category', então basta usá-la
                itemType: item.category
            };
        });

        // Se houver itens expirados ou próximos de vencer, envia o e-mail de alerta
        if (itemsWithStatus.length > 0) {
            const users = await queryAsync('SELECT email FROM user WHERE role = "manager"');
            const managerEmails = users.map(user => user.email);
            if (managerEmails.length > 0) {
                await sendWarningEmail(managerEmails, itemsWithStatus);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar datas de validade:', error);
    }
}

// Agendamento para rodar a função todos os dias à meia-noite
cron.schedule('0 0 * * *', () => {
    checkExpirationDates();
});
