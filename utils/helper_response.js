class ResponseHelper {
    static success(data,message) {
        return {
            success: true,
            data: data,
            message: message,
        };
    }
    static error(message) {
        return {
            success: false,
            data: null,
            message: message,
        };
    }
    static listar(itemName) {
        return `Lista de ${itemName}`;
    }

    static errorListar(itemName){
        return `Error al listar los ${itemName}`;
    }

    static created(itemName) {
        return `Se ha creado un ${itemName} nuevo`;
    }

    static updated(itemName) {
        return `Se ha actualizado el ${itemName}`;
    }

    static deleted(itemName) {
        return `Se ha eliminado el ${itemName}`;
    }

    static activated(itemName) {
        return `Se ha activado el ${itemName}`;
    }

    static desactivated(itemName) {
        return `Se ha desactivado el ${itemName}`;
    }
}

module.exports = ResponseHelper;