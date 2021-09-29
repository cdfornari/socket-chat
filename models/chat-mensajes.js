class Mensaje {
    constructor(uid,nombre,mensaje,para,idReceptor){
        this.uid = uid;
        this.nombre = nombre;
        this.mensaje = mensaje;
        this.para = para;
        this.idReceptor = idReceptor;
    }
}

class ChatMensajes {

    constructor(){
        this.mensajes = [];
        this.usuarios = {};
        this.privados = [];
    }

    get ultimos10(){
        this.mensajes = this.mensajes.splice(0,10)
        return this.mensajes;
    }

    get usuariosArr (){
        return Object.values(this.usuarios)
    }

    enviarMensaje(uid,nombre,mensaje){
        this.mensajes.unshift(new Mensaje(uid,nombre,mensaje,null))
    }

    get ultimos10Privados(){
        this.privados = this.privados.splice(0,10)
        return this.privados;
    }
    priv(id){
        const privMsgs = this.ultimos10Privados.map((mensaje)=>{
            if(mensaje.idReceptor === id || mensaje.uid === id){
                return mensaje;
            }
        })
        return privMsgs

    }
    enviarMensajePrivado(uid,nombre,mensaje,para){
        this.privados.unshift(new Mensaje(uid,nombre,mensaje,para))
    }

    conectarUsuario(usuario){
        this.usuarios[usuario.id] = usuario
    }

    desconectarUsuario(id){
        delete this.usuarios[id]
    }
}

module.exports = ChatMensajes;