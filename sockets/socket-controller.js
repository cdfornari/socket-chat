const { Socket } = require("socket.io");

const { comprobarJWT } = require("../helpers");
const { ChatMensajes, Usuario, Mensaje } = require("../models");

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

            socket.emit('mensaje-privado',new Mensaje(usuario.id,usuario.nombre,mensaje,para.nombre,uid))
            socket.to(uid).emit('mensaje-privado',new Mensaje(usuario.id,usuario.nombre,mensaje,para.nombre,uid))
        }else{
            chatMensajes.enviarMensaje(usuario.id,usuario.nombre,mensaje)
            io.emit('recibir-mensaje',chatMensajes.ultimos10)
        }
        
    })
}

module.exports = {
    socketController
}