const { Usuario, Suscripcion, Servicio, Medidor,DetalleUsuarioFactura,Factura ,Configuracion} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const apiWhatsappWeb = require('../adapter/whatsapp/api-whatsapp-web');
class UsuarioRepository {
  async listarUsuarios(page, limit) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Usuario.findAndCountAll({
      offset,
      limit: +limit,
    });
    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: +page,
      data: rows,
    };
  }

  async listarUsuarioConSuscripciones(page, limit) {
    const offset = (page - 1) * parseInt(limit);
    limit = parseInt(limit);
    const { rows: usuarios, count: total } = await Usuario.findAndCountAll({
      include: [
        {
          model: Servicio,
          as: 'Servicios',
          attributes: [
            'id',
            'nombre',
            'asociar',
            'estado',
            [
              sequelize.literal(`
                (SELECT 
                  IFNULL( ROUND(
                    SUM(IF(duf.estado = 0 or duf.estado = 1, duf.monto , 0)) -
                    SUM(IF(duf.estado = 0 or duf.estado = 1, duf.monto_pago , 0)), 2
                  ),0)
                FROM detalles_usuario_factura duf 
                WHERE duf.usuarioid = Usuario.id 
                AND duf.servicioid = Servicios.id 
                AND duf.deletedAt IS NULL)
              `),
              'monto_por_servicio'
            ]
          ]
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`
              (SELECT 
                IFNULL( ROUND(
                  SUM(IF(duf.estado = 0 or duf.estado = 1, duf.monto , 0)) -
                  SUM(IF(duf.estado = 0 or duf.estado = 1, duf.monto_pago , 0)), 2
                ),0)
              FROM detalles_usuario_factura duf 
              WHERE duf.usuarioid = Usuario.id 
              AND duf.deletedAt IS NULL)
            `),
            'suma_montos'
          ]
        ]
      },
      offset,
      limit
    });
    const count = await Usuario.count({
      lean: true
    });
    console.log("total: " + count);
    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: +page,
      data: usuarios,
    };
  }

  async crearUsuario(nombre, apellidos,cod_pais,telefono) {
    const usuario = await Usuario.create({
      nombre,
      apellidos,
      cod_pais,
      telefono,
      estado: true,
    });
    return usuario;
  }

  async actualizarUsuario(id, nombre, apellidos,cod_pais,telefono) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.nombre = nombre;
    usuario.apellidos = apellidos;
    usuario.cod_pais = cod_pais;
    usuario.telefono = telefono;
    await usuario.save();
    return usuario;
  }

  async eliminarUsuario(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    await usuario.destroy();
    return { message: 'Usuario eliminado correctamente' };
  }

  async activarUsuario(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.estado = true;
    await usuario.save();
    return usuario;
  }

  async desactivarUsuario(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.estado = false;
    await usuario.save();
    return usuario;
  }

  async usuarioSuscripciones() {
    const usuarios = await Usuario.findAll({
      include: [
        {
          model: Servicio,
          as: 'Servicios',
        },
      ],
      where: {
        estado: true,
      }
    });

    return usuarios;
  }
  async conSuscripcionDelServicio(servicioid) {
    return await Usuario.findAll({
      include: [
        {
          model: Suscripcion,
          as: 'Suscripciones',
          required: true,
          where: {
            servicioid: servicioid,
            habilitado: true,
            tiene_medidor: true,
          },
        },
      ],
    });
  }
  async conSuscripcionAlServicio(servicioid) {
    return await Usuario.findAll({
      include: [
        {
          model: Suscripcion,
          as: 'Suscripciones',
          required: true,
          where: {
            servicioid: servicioid,
            habilitado: true,
          },
        },
      ],
    });
  }

  async sinRegistroDelMedidorPorFecha(fecha, servicioid) {
    const usuariosConSuscripcion = await this.conSuscripcionDelServicio(servicioid);
    if (usuariosConSuscripcion.length == 0) {
      return [];
    }
    const usuariosIds = usuariosConSuscripcion.map(usuario => usuario.id);
    const usuariosSinRegistroMedidor = await Usuario.findAll({
      where: {
        id: usuariosIds
      },
      include: [
        {
          model: Medidor,
          as: 'Medidores',
          required: false,
          where: {
            fecha: {
              [Op.startsWith]: fecha,
            }
          }
        },
        {
          model: Suscripcion,
          as: 'Suscripciones',
          where: {
            servicioid: servicioid,
            habilitado: true,
            tiene_medidor: true,
          },
          required: true
        }
      ],
      having: sequelize.literal('COUNT(Medidores.id) = 0') // Filtra solo los usuarios sin registros de medidor
    });

    return usuariosSinRegistroMedidor;
  }

  async medidoresConSuscripcionEnFecha(servicioid, fecha) {
    try {
      const medidores = await Medidor.findAll({
        include: [
          {
            model: Usuario,
            as: 'Usuario',
            required: true,
            include: [
              {
                model: Suscripcion,
                as: 'Suscripciones',
                where: {
                  servicioid: servicioid,
                  habilitado: true,
                  tiene_medidor: true,
                },
                required: true
              }
            ]
          }
        ],
        where: {
          fecha: {
            [Op.startsWith]: fecha,
          }
        }
      });
      return medidores;
    } catch (error) {
      console.error('Error al obtener los medidores del servicio:', error);
      throw error;
    }
  }
  async conSuscripcionFija(servicioid) {
    return await Suscripcion.findAll({
      include: [
        {
          model: Usuario,
          as: 'Usuario',
          required: true,
          where: {
            estado: true,
          }
        },
      ],
      where: {
        servicioid: servicioid,
        habilitado: true,
        tipo: Suscripcion.FIJO
      },
    });
  }

  async conSuscripcionDinamico(servicioid) {
    return await Suscripcion.findAll({
      include: [
        {
          model: Usuario,
          as: 'Usuario',
          required: true,
          where: {
            estado: true,
          }
        },
      ],
      where: {
        servicioid: servicioid,
        habilitado: true,
        tipo: Suscripcion.CALCULAR
      },
    });
  }

  async getUserConFacturasNoPagadas(){
    return await Usuario.findAll({
      include: [
        {
          model: DetalleUsuarioFactura,
          as: "DetalleUsuarioFactura",
          include:[
            {
              model: Factura,
              required:false,
            },
            {
              model: Servicio
            },
          ],
          where:{
            [Op.or]: [
              { estado: { [Op.not]: DetalleUsuarioFactura.COMPLETADO } },
            ],
          }
        }
      ],
    });
  }

  async notificarPorWhatsappLasDeudasPendientes(instanciaId){
    let users = await this.getUserConFacturasNoPagadas();
    for (let index = 0; index < users.length; index++) {
      const user = users[index]; 
      if(user.cod_pais != "" && user.telefono != ""){
        let message = user.nombre+" " + user.apellidos+"\r\n";
        message += "*Tienes deudas pendientes.*"+"\r\n\r\n";
        let montoTotal = 0;
        user.DetalleUsuarioFactura.forEach(detalle => {
            message+=`*Servicio:* ${detalle.Servicio.nombre}\r\n`;
            message+=`*Fecha:* ${detalle.getFechaFormateada()}\r\n`;
            message+=`*Monto:* Bs. ${detalle.monto.toFixed(2)}\r\n`;
            message+=`*Pago:* Bs. ${detalle.monto_pago.toFixed(2)}\r\n`;
            message+=`*Debe:* Bs. ${(detalle.monto-detalle.monto_pago).toFixed(2)}\r\n`;
            message+=`-------------------------------------\r\n\r\n`;
            let saldo = detalle.monto - detalle.monto_pago;
            montoTotal += saldo < 0 ? 0: saldo;
        });
        message+= `*Monto Total Debe: Bs. ${montoTotal.toFixed(2)}*`;
        await apiWhatsappWeb.enviarMensajeTexto(user.cod_pais+user.telefono,message,instanciaId);
      }
    }
  }
}

module.exports = UsuarioRepository;