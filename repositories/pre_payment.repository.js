const { PrePayment,DetailPrePayment,Servicio,DetalleUsuarioFactura } = require('../models');

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

    async getPrePayments(userId,page, limit) {
        console.log('userId', userId, 'page', page, 'limit', limit);
        const { count, rows } =  await PrePayment.findAndCountAll({
            offset: (page - 1) * limit,
            limit: limit,
            include: [
                {
                    model: DetailPrePayment,
                    include: [
                        {
                            model: DetalleUsuarioFactura,
                            required: false,
                            include: [
                                {
                                    model: Servicio,
                                }
                            ]
                        }
                    ]
                }
            ],
            where: {
                user_id: userId
            },
            order: [['date', 'DESC']],
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        });
        const total = await PrePayment.count({
            lean: true,
            where: {
                user_id: userId
            }
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