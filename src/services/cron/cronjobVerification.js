const cron = require('node-cron');
const { queryAsync } = require('../../utils/functions');
const { sendWarningEmail } = require('../mail/mailSender');

// Rota para verificar as datas de validade
async function checkExpirationDates() {
    try {
        const queryAllItems = 'SELECT i.idItem, i.name, i.sapCode, l.lotNumber, l.expirationDate, c.categoryValue FROM item i JOIN lots l ON i.idItem = l.fkIdItem JOIN category c ON i.fkIdCategory = c.idCategory WHERE l.expirationDate IS NOT NULL AND (l.expirationDate < CURDATE() OR l.expirationDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))';
        const allItems = await queryAsync(queryAllItems);

        if (allItems.length > 0) {
            const today = new Date().toISOString().slice(0, 10);
            const itemsWithStatus = allItems.map(item => ({
                ...item,
                status: item.expirationDate.toISOString().slice(0, 10) < today ? 'Expirado' : 'Próximo de Vencer',
            }));

            const users = await queryAsync('SELECT email FROM user WHERE role = "manager"');
            const managerEmails = users.map(user => user.email);

            if (managerEmails.length > 0) {
                await sendWarningEmail(managerEmails, 'Aviso de Validade', 'Os seguintes itens estão com a data de validade expirada ou próxima de expirar:', itemsWithStatus);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar datas de validade:', error);
    }
}

// Rota para verificar o estoque mínimo
async function checkMinimumStock() {
    try {
        const queryStock = `
            SELECT 
                i.idItem,
                i.name,
                i.sapCode,
                i.minimumStock,
                SUM(l.quantity) AS totalQuantity
            FROM item i
            JOIN lots l ON i.idItem = l.fkIdItem
            WHERE i.minimumStock IS NOT NULL
            GROUP BY i.idItem
            HAVING totalQuantity < i.minimumStock;
        `;
        const lowStockItems = await queryAsync(queryStock);

        if (lowStockItems.length > 0) {
            const users = await queryAsync('SELECT email FROM user WHERE role = "manager"');
            const managerEmails = users.map(user => user.email);

            if (managerEmails.length > 0) {
                await sendWarningEmail(managerEmails, 'Aviso de Estoque Mínimo', 'Os seguintes itens estão com o estoque abaixo do mínimo:', lowStockItems);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar estoque mínimo:', error);
    }
}

// Agendamento do cron para toda segunda-feira à meia-noite
cron.schedule('0 0 * * 1', () => {
    console.log('Executando tarefas agendadas...');
    checkExpirationDates();
    checkMinimumStock();
});