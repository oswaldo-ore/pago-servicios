const {
    Factura,
    DetalleUsuarioFactura,
    Usuario,
    Servicio,
    Suscripcion,
    Medidor,Movimiento,DetalleMovimiento
} = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const SaveImage = require('../utils/save_images');
const moment = require('moment');
const UsuarioRepository = require('./usuario.repository');
const apiWhatsappWeb = require('../adapter/whatsapp/api-whatsapp-web');
const ConfiguracionRepository = require('./configuracion.repository');
const configuracionRepository = new ConfiguracionRepository();
nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

class FacturaRepository {
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
    }

    async listarFacturas(page = 1, limit = 8) {
        const offset = (page - 1) * limit;
        const { count, rows } = await Factura.findAndCountAll({
            offset,
            limit: +limit,
            include: [
                {
                    model: DetalleUsuarioFactura,
                    required: false,
                    include: [
                        {
                            model: Usuario,
                            required: true
                        }
                    ]
                },
                {
                    model: Servicio,
                }
            ],
            order: [
                ['fecha', 'DESC']
              ],
        });
        const total = await Factura.count({
            lean: true
          });
        return {
            total: total,
            totalPages: Math.ceil(total / limit),
            currentPage: +page,
            data: rows,
        };
    }

    async verFactura(id) {
        const factura = await Factura.findByPk(id,{
            include: [
                {
                    model: DetalleUsuarioFactura,
                    required: false,
                    include: [
                        {
                            model: Usuario,
                            required: true
                        }
                    ]
                },
                {
                    model: Servicio,
                }
            ]
        });
        return factura;
    }

    async registrarDetalleFactura(monto,detalleFacturaId,isPrestado){
        const transaction = await sequelize.transaction();
        try {
            const fechaActual = new Date();
            let detalle = await DetalleUsuarioFactura.findByPk(detalleFacturaId,{
                include: [
                    {
                        model: Servicio,
                    },
                    {
                        model: Usuario,
                    }
                ]
            });
            let cambio = 0;
            let montoInicial = monto;
            let montoAnterior = detalle.monto_pago;
            monto += detalle.monto_pago;
            if(monto >= detalle.monto){
                cambio= monto - detalle.monto;
                detalle.estado = DetalleUsuarioFactura.COMPLETADO;
            }
            
            detalle.monto_pago = parseFloat(monto.toFixed(2));
            detalle.cambio_pago = parseFloat(cambio.toFixed(2));
            detalle.fecha_pago = fechaActual;
            let descripcion = "";
            if(isPrestado){
                detalle.estado = DetalleUsuarioFactura.PRESTADO;
                descripcion = "Pago del servicio "+detalle.Servicio.nombre+" del mes de "+detalle.fecha+" PRESTADO";
            }else{
                descripcion = "Pago del servicio "+detalle.Servicio.nombre+" del mes de "+detalle.fecha;
            }
            await detalle.save({ transaction: transaction });
            // await  MovimientoRepository.crearMovimientoConUnDetalle(montoInicial,detalle.usuarioid,descripcion,detalle.id);
            let movimiento = await Movimiento.create({
                monto: monto,
                fecha: new Date(),
                usuarioid: detalle.usuarioid,
                descripcion: descripcion,
                saldo_anterior: 0,
                a_cuenta: 0
            },{ transaction});
            let detalleMovimiento = await DetalleMovimiento.create({
                monto: monto,
                fecha: new Date(),
                detalleusuariofacturaid: detalleFacturaId,
                descripcion: descripcion,
                movimientoid: movimiento.id
            },{transaction});
            await transaction.commit();
            let configuracion = await configuracionRepository.getConfiguracion();
            console.log("--------------------------------------");
            console.log(configuracion.estado_conexion);
            if(configuracion.estado_conexion){
                this.enviarPagoDelServicioAlCliente(montoAnterior,descripcion,montoInicial,detalle,configuracion.instancia_id);
            }
            return detalle;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error);
        }
    }

    async verificarSiLaFacturaPagada(facturaId){
        let factura = await this.verFactura(facturaId);
        let montoTotal = await DetalleUsuarioFactura.sum('monto_pago',{
            where:{
                facturaid:facturaId,
            }
        });

        if(montoTotal >= factura.monto){
            // factura.ispagado = true;
            factura.estado= Factura.CANCELADO;
            await factura.save();
        }
    }
    async actualizarEstadoDeLasFacturas(){
        let facturas = await this.getFacturasNoPagadas();
        facturas.forEach(factura => {
            this.verificarSiLaFacturaPagada(factura.id);
        });
    }
    async getFacturasNoPagadas(){
        let facturas = await Factura.findAll({
            where:{
                estado: {
                    [Op.not]: Factura.CANCELADO
                },
            }
        });
        return facturas;
    }

    async cambiarEstadoFacturaACanceladoPrestamo(facturaId){
        let factura = await this.verFactura(facturaId);
        factura.estado= Factura.PRESTADO;
        await factura.save();
    }

    async devolverPrestamoDelPago(detalleFacturaId){
        let detalle = await DetalleUsuarioFactura.findByPk(detalleFacturaId);
        detalle.isprestado = false;
        detalle.fecha_pago = new Date();
        await detalle.save();
    }
    async crearFactura(monto, fecha, foto, servicioid) {
        const transaction = await sequelize.transaction();
        try {
            const fechaFormateada = moment(fecha).format('YYYY-MM');
            let verificarFactura = await Factura.findAll({
                where: {
                    fecha: {
                        [Op.startsWith]: fecha,
                    },
                    servicioid: servicioid
                }
            });
            if(verificarFactura.length > 0){
                throw new Error("Ya ha sido registrado una factura con la Fecha: " + fechaFormateada);
            }

            const usuariosSinRegistroMedidor = await this.usuarioRepository.sinRegistroDelMedidorPorFecha(fechaFormateada, servicioid);
            if (usuariosSinRegistroMedidor.length > 0) {
                throw new Error("Hay usuarios sin registro del medidor. Fecha: " + fechaFormateada);
            }

            const usuarioConMedidor = await this.usuarioRepository.medidoresConSuscripcionEnFecha(servicioid, fechaFormateada);
            let sumaMontoMedidorFecha = usuarioConMedidor.reduce((total, medidor) => total + parseFloat(medidor.monto), 0);
            sumaMontoMedidorFecha = parseFloat(sumaMontoMedidorFecha.toFixed(2));

            const suscripcionesFijaDeUsuarios = await this.usuarioRepository.conSuscripcionFija(servicioid);
            let sumaMontoUsuarioConMontoFijo = suscripcionesFijaDeUsuarios.reduce((total, suscripcion) => total + parseFloat(suscripcion.monto), 0);
            sumaMontoUsuarioConMontoFijo = parseFloat(sumaMontoUsuarioConMontoFijo.toFixed(2));

            const suscripcionesDinamicoDeUsuarios = await this.usuarioRepository.conSuscripcionDinamico(servicioid);

            let calcular = (monto - sumaMontoMedidorFecha - sumaMontoUsuarioConMontoFijo) / suscripcionesDinamicoDeUsuarios.length;
            // console.log(monto, sumaMontoMedidorFecha, sumaMontoUsuarioConMontoFijo, suscripcionesDinamicoDeUsuarios.length);
            // console.log(calcular);
            /* Creamos la factura  */
            let url_image = "";
            if(foto){
                url_image = SaveImage.save(`facturas-serv-${servicioid}/`, foto);
            }
            const factura = await Factura.create({
                monto: monto,
                fecha: fecha,
                foto_factura: url_image,
                servicioid: servicioid,
            }, { transaction: transaction });
            let detallesFactura = [];
            for (let index = 0; index < usuarioConMedidor.length; index++) {
                const element = usuarioConMedidor[index];//medidor
                let detalle = await DetalleUsuarioFactura.create({
                    servicioid: servicioid,
                    usuarioid: element.usuarioId,
                    facturaid: factura.id,
                    monto: parseFloat(element.monto),
                    fecha: fecha,
                }, { transaction: transaction });
                detallesFactura.push(detalle);
            }
            for (let index = 0; index < suscripcionesFijaDeUsuarios.length; index++) {
                const element = suscripcionesFijaDeUsuarios[index];//suscripcion
                let detalle = await DetalleUsuarioFactura.create({
                    servicioid: servicioid,
                    usuarioid: element.usuarioid,
                    facturaid: factura.id,
                    monto: parseFloat(element.monto),
                    fecha: fecha,
                }, { transaction: transaction });
                detallesFactura.push(detalle);
            }

            for (let index = 0; index < suscripcionesDinamicoDeUsuarios.length; index++) {
                const element = suscripcionesDinamicoDeUsuarios[index];//suscripcion
                let detalle = await DetalleUsuarioFactura.create({
                    servicioid: servicioid,
                    usuarioid: element.usuarioid,
                    facturaid: factura.id,
                    monto: parseFloat(calcular.toFixed(2)),
                    fecha: fecha,
                }, { transaction: transaction });
                detallesFactura.push(detalle);
            }
            await transaction.commit();
            let configuracion = await configuracionRepository.getConfiguracion();
            if(configuracion.estado_conexion){
                await this.enviarFacturaASuscriptores(factura.id,configuracion.instancia_id);
            }
            return factura;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error);
        }
    }

    async enviarFacturaASuscriptores(facturaId,sessionId){
        try {
            let factura = await this.verFactura(facturaId);
            let servicio = await factura.Servicio;
            let usuarioRepository= new UsuarioRepository;
            let usuarios = await usuarioRepository.conSuscripcionAlServicio(servicio.id);
            let fecha =new Date(factura.fecha);
            let nameMes = nombresMeses[fecha.getMonth()]+" - " + fecha.getFullYear();
            let mensaje = `*Factura:* ${nameMes}\r\n*Servicio:* ${servicio.nombre}\r\n*Monto:* Bs. ${factura.monto}\r\n\r\n`;
            let detalles = factura.DetalleUsuarioFacturas;
            detalles.forEach(detalle => {
                let usuario = detalle.Usuario;
                mensaje+=`*${usuario.nombre}:* Bs. ${detalle.monto}\r\n`;
            });
            usuarios.forEach(async usuario =>  {
                if(usuario.cod_pais != "" && usuario.telefono != ""){
                    let number = usuario.cod_pais + usuario.telefono;
                    if(factura.foto_factura != ""){
                        let fotoFacturaUrl = "https://servicios.tecnosoft.xyz" + factura.foto_factura;
                        await apiWhatsappWeb.enviarMensajeFileForUrl(number,fotoFacturaUrl,sessionId);
                    }
                    await apiWhatsappWeb.enviarMensajeTexto(number,mensaje.trim(),sessionId);
                }
            });
        } catch (error) {
            console.log("Ocurrio un error" + error);
        }
    }

    async enviarPagoDelServicioAlCliente(montoAnterior,descripcion,montoInicial,detalle,sessionId){
        try {
            if(detalle.Usuario.cod_pais != "" && detalle.Usuario.telefono != ""){
                let message = "*Registro del pago*\r\n\r\n";
                message+=`${descripcion}\r\n\r\n`;
                if(montoAnterior > 0){
                    message+=`*Pago anterior:* Bs. ${montoAnterior}\r\n`;
                }
                message+=`*Monto Pago:* Bs. ${montoInicial}\r\n`;
                if(detalle.estado == DetalleUsuarioFactura.COMPLETADO){
                    message+=`*El pago fue completado*\r\n`;
                }else{
                    message+=`*Saldo debe:* ${(detalle.monto - detalle.monto_pago).toFixed(2)}\r\n`;
                }
                let number= detalle.Usuario.cod_pais+detalle.Usuario.telefono;
                await apiWhatsappWeb.enviarMensajeTexto(number,message,sessionId);
            }
        } catch (error) {
            console.log("ocurrio un error al enviar al whatsapp",error);
        }
    }

    async eliminarFactura(id) {
        try {
            const factura = await Factura.findByPk(id);
            if (!factura) {
                throw new Error('Factura no encontrada');
            }
            // const rutaArchivo = path.join(__dirname, `../public${factura.foto_factura}`);
            // if (fs.existsSync(rutaArchivo)) {
            //     fs.unlinkSync(rutaArchivo);
            // }
            await DetalleUsuarioFactura.destroy({
                where: {
                    facturaid: factura.id
                }
            });
            await factura.destroy();
            return { message: 'Factura eliminada correctamente' };
        } catch (error) {
            // Manejo de errores
            throw new Error(error);
        }
    }
}

module.exports = FacturaRepository;