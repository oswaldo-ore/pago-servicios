const { Factura } = require('../models');
const SaveImage = require('../utils/save_images');
class FacturaRepository {
    async crearFactura(monto, fecha, foto, servicioid) {
        try {
            // const extension = path.extname(foto.originalname);
            // const buffer = foto.buffer;
            // const nombreArchivo = `${Date.now()}${extension}`;
            // const rutaDestino = path.join(__dirname, '../public/facturas', nombreArchivo);
            // fs.writeFileSync(rutaDestino, buffer);
            let url_image = SaveImage.save(`facturas-serv-${servicioid}/`,foto);
            const factura = await Factura.create({
                monto,
                fecha,
                foto_factura: url_image,
                servicioid: servicioid,
            });

            return factura;
        } catch (error) {
            // Manejo de errores
            throw new Error('Error al crear la factura: ' + error);
        }
    }

    async eliminarFactura(id) {
        try {
            const factura = await Factura.findByPk(id);

            if (!factura) {
                throw new Error('Factura no encontrada');
            }

            // Obtener la ruta del archivo de la factura
            const rutaArchivo = path.join(__dirname, `../public${factura.foto_factura}`);

            // Verificar si el archivo existe y eliminarlo
            if (fs.existsSync(rutaArchivo)) {
                fs.unlinkSync(rutaArchivo);
            }

            // Eliminar la factura de la base de datos
            await factura.destroy();

            return { message: 'Factura eliminada correctamente' };
        } catch (error) {
            // Manejo de errores
            throw new Error('Error al eliminar la factura');
        }
    }
}

module.exports = FacturaRepository;