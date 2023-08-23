const fs = require('fs');
const path = require('path');
class SaveImage {
    /*Directorio despues del public */
    static save(destino, file) {
        const directorio = SaveImage.eliminarCaracteresInicio(destino);
        const extension = path.extname(file.originalname);
        const buffer = file.buffer;
        const nombreArchivo = `${Date.now()}${extension}`;
        SaveImage.crearRuta(directorio);
        const rutaDestino = path.join(__dirname, `../public/images/${directorio}`, nombreArchivo);
        fs.writeFileSync(rutaDestino, buffer);
        return "/images/" + directorio + nombreArchivo;
    }
    static eliminarCaracteresInicio(cadena) {
        return cadena.replace(/^[/\\]+/, '');
    }
    static crearRuta(ruta) {
        const rutaDirectorio = path.join(__dirname, '../public/images/'+ruta);
        if (!fs.existsSync(rutaDirectorio)) {
            fs.mkdirSync(rutaDirectorio, { recursive: true });
        }
    }
}

module.exports = SaveImage;