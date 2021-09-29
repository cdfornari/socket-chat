const txtUid = document.querySelector('#txtUid')
const txtMensaje = document.querySelector('#txtMensaje')
const ulUsuarios = document.querySelector('#ulUsuarios')
const ulMensajes = document.querySelector('#ulMensajes')
const ulPrivados = document.querySelector('#ulPrivados')
const btnSalir = document.querySelector('#btnSalir')

let user = null;
let socket = null;

const url = ( window.location.hostname.includes('localhost') )
                ? 'http://localhost:8080/api/auth/'
                : 'https://socket-chat-cdfo.herokuapp.com/api/auth/';


const validarJWT = async()=>{

    try {

        const token = localStorage.getItem('token') || '';

        const res = await fetch(url,{
            headers: {'x-token': token}
        })

        const {usuario: userDB, token: tokenDB,msg} = await res.json()

        if(msg){
            throw msg
        }

        localStorage.setItem('token',tokenDB);

        user = userDB;
        document.title = user.nombre;

        await conectarSocket();

    } catch (error) {

        window.location = 'index.html'
        console.log(error)

    }
    
}

const conectarSocket = async()=>{

    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect',()=>{

    })

    socket.on('disconnect',()=>{
        
    })

    socket.on('recibir-mensaje',dibujarMensajes)

    socket.on('usuarios-activos',dibujarUsuarios)

    socket.on('mensaje-privado',dibujarMensajesPrivados)

}

const dibujarUsuarios = (usuarios = [])=>{

    let usersHtml = '';
    usuarios.forEach(({nombre,uid}) => {
        
        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success">${nombre}</h5>
                    <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `;
    })

    ulUsuarios.innerHTML = usersHtml;
}

const dibujarMensajes = (mensajes = [])=>{

    let mensajesHtml = '';
    mensajes.forEach(({mensaje,nombre}) => {
        
        mensajesHtml += `
            <li>
                <p>
                    <span class="text-primary">${nombre}:</span>
                    <span>${mensaje}</span>
                </p>
            </li>
        `;
    })

    ulMensajes.innerHTML = mensajesHtml;
}

const dibujarMensajesPrivados = (mensajes = [])=>{

    let privadosHtml = '';
    mensajes.forEach(({mensaje,nombre,para}) => {
        
        privadosHtml += `
            <li>
                <p>
                    <span class="text-primary">${nombre}:</span>
                    <span>${mensaje}</span>
                    <br>
                    <span class="text-secondary">para: ${para}</span>
                </p>
            </li>
        `;
    })

    ulPrivados.innerHTML = privadosHtml;
}

txtMensaje.addEventListener('keyup', ({keyCode}) =>{
    
    const mensaje = txtMensaje.value;
    const uid = txtUid.value;

    if (keyCode !== 13 || mensaje.length === 0){return;}

    socket.emit('enviar-mensaje',{mensaje,uid})

    txtMensaje.value = '';
})

btnSalir.addEventListener('click', ()=> {

    localStorage.removeItem('token');

    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then( () => {
        console.log('User signed out.');
        window.location = 'index.html';
    });
});

const main = async()=>{

    (()=>{
        gapi.load('auth2', () => {
            gapi.auth2.init();
            main();
        });
    })();
    
    await validarJWT()
}

main();