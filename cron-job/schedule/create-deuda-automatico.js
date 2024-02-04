const DetalleUsuarioFacturaRepository = require("../../repositories/detalle.factura.repository");

class CreateDeudaAutomatico{
    static async handle(){
        try {
            DetalleUsuarioFacturaRepository.createAutomaticDebts();
        } catch (error) {
            
        }
    }
}