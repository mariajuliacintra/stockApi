const cron = require('node-cron');
const { queryAsync } = require('../utils/functions'); 
const { sendWarningEmail } = require('./mail/mailSender');

async function checkExpirationDates() {
    try {
        const queryExpiredMaterial = 'SELECT idMaterial, name, batchNumber, expirationDate FROM material WHERE expirationDate < CURDATE()';
        const querySoonToExpireMaterial = 'SELECT idMaterial, name, batchNumber, expirationDate FROM material WHERE expirationDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)';

        const expiredMaterials = await queryAsync(queryExpiredMaterial);
        const soonToExpireMaterials = await queryAsync(querySoonToExpireMaterial);

        const queryExpiredProduct = 'SELECT idProduct, name, batchNumber, expirationDate FROM product WHERE expirationDate < CURDATE()';
        const querySoonToExpireProduct = 'SELECT idProduct, name, batchNumber, expirationDate FROM product WHERE expirationDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)';

        const expiredProducts = await queryAsync(queryExpiredProduct);
        const soonToExpireProducts = await queryAsync(querySoonToExpireProduct);

        const queryExpiredDiverses = 'SELECT idDiverses, name, batchNumber, expirationDate FROM diverses WHERE expirationDate < CURDATE()';
        const querySoonToExpireDiverses = 'SELECT idDiverses, name, batchNumber, expirationDate FROM diverses WHERE expirationDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)';

        const expiredDiverses = await queryAsync(queryExpiredDiverses);
        const soonToExpireDiverses = await queryAsync(querySoonToExpireDiverses);

        const allItems = [];
        if (expiredMaterials.length > 0) {
            expiredMaterials.forEach(item => {
                allItems.push({ ...item, itemType: 'Material', status: 'Expirado' });
            });
        }
        if (soonToExpireMaterials.length > 0) {
            soonToExpireMaterials.forEach(item => {
                allItems.push({ ...item, itemType: 'Material', status: 'Próximo de Vencer' });
            });
        }
        if (expiredProducts.length > 0) {
            expiredProducts.forEach(item => {
                allItems.push({ ...item, itemType: 'Produto', status: 'Expirado' });
            });
        }
        if (soonToExpireProducts.length > 0) {
            soonToExpireProducts.forEach(item => {
                allItems.push({ ...item, itemType: 'Produto', status: 'Próximo de Vencer' });
            });
        }
        if (expiredDiverses.length > 0) {
            expiredDiverses.forEach(item => {
                allItems.push({ ...item, itemType: 'Diversos', status: 'Expirado' });
            });
        }
        if (soonToExpireDiverses.length > 0) {
            soonToExpireDiverses.forEach(item => {
                allItems.push({ ...item, itemType: 'Diversos', status: 'Próximo de Vencer' });
            });
        }

        if (allItems.length > 0) {
            const users = await queryAsync('SELECT email FROM user WHERE role = "manager"');
            const managerEmails = users.map(user => user.email);
            if (managerEmails.length > 0) {
                await sendWarningEmail(managerEmails, allItems);
            }
        }

    } catch (error) {
    }
}

cron.schedule('0 0 * * *', () => {
    checkExpirationDates();
});
