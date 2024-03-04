const { PrePayment } = require('../models');

class PrePaymentRepository {
    async registerPrePayment(userId,amount,description) {
        return await PrePayment.create({
            user_id: userId,
            amount: amount,
            available_amount: amount,
            date: new Date(),
            description: description,
        })
    }

    async getPrePayments(page, limit) {
        const { count, rows } =  await PrePayment.findAndCountAll({
            offset: (page - 1) * limit,
            limit: limit,
            order: [['date', 'DESC']],
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        });
        console.log(count);
        const total = await PrePayment.count({
            lean: true
        });
        return {
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: +page,
            data: rows,
        };
    }
}

module.exports = PrePaymentRepository;