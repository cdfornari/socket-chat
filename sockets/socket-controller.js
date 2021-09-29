const { Socket } = require("socket.io");

const { comprobarJWT } = require("../helpers");
const { ChatMensajes, Usuario } = require("../models");

const chatMensajes = new ChatMensajes();


const socketController = async(socket = new Socket(), io)=>{

    const token = socket.handshake.headers['x-token'];

    const usuario = await comprobarJWT(token);

    if(!usuario){
        return socket.disconnect();
    }

    chatMensajes.conectarUsuario(usuario);
    io.emit('usuarios-activos',chatMensajes.usuariosArr);
    socket.emit('recibir-mensaje',chatMensajes.ultimos10)

    socket.join(usuario.id);

    socket.on('disconnect',()=>{
        chatMensajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-activos',chatMensajes.usuariosArr)
    })
    
    socket.on('enviar-mensaje', async({mensaje,uid})=>{

        if (uid){

            const para = await Usuario.findById(uid);

            chatMensajes.enviarMensajePrivado(usuario.id,usuario.nombre,mensaje,para.nombre,uid)
            socket.emit('mensaje-privado',chatMensajes.priv(usuario.id))
            socket.to(uid).emit('mensaje-privado',chatMensajes.priv(usuario.id))
        }else{
            chatMensajes.enviarMensaje(usuario.id,usuario.nombre,mensaje)
            io.emit('recibir-mensaje',chatMensajes.ultimos10)
        }
        
    })
}

module.exports = {
    socketController
}