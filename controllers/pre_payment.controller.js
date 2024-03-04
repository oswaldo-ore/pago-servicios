const PrePaymentRepository = require("../repositories/pre_payment.repository");
const UsuarioRepository = require("../repositories/usuario.repository");
const ResponseHelper = require("../utils/helper_response");

const prePaymentRepository = new PrePaymentRepository();
const usuarioRepository = new UsuarioRepository();

const PrePaymentController = {
    async registerPrePayment(req, res) {
        try {
            const { userId, amount, description } = req.body;
            const prePayment = await prePaymentRepository.registerPrePayment(
                userId,
                amount,
                description
            );
            let user = await usuarioRepository.addBalanceToUser(userId, amount);
            let data = {
                prePayment: prePayment,
                amount: user.balance,
            }
            return res.json(ResponseHelper.success(data, ResponseHelper.created("pago adelantado" )));
        } catch (error) {
            return res.json(ResponseHelper.error('Error al pagar adelantado'));
        }
    },

    async getPrePayments(req, res) {
        try {
            const { page = 1, limit = 8, userId} = req.query;
            const prePayments = await prePaymentRepository.getPrePayments(parseInt(userId),parseInt(page), parseInt(limit));
            return res.json(ResponseHelper.success(prePayments, ResponseHelper.listar('pagos adelantados')));
        } catch (error) {
            console.log(error);
            return res.json(ResponseHelper.error(ResponseHelper.errorListar('pagos adelantados')));
        }
    }
};

module.exports = PrePaymentController;
