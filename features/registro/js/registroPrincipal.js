// 1. Seleccionar el botón de continuar
const btnContinuar = document.querySelector(".contenedor-next-icon");
const btnRetroceder = document.getElementById("btnRetroceder");

btnRetroceder.addEventListener("click", function () {
  window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
});

// -------------------------------------------
// CARGAR DATOS PERSONALES SI EXISTE USUARIO
// -------------------------------------------
window.addEventListener("DOMContentLoaded", function () {

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    if (!usuarioIncompleto) return;

    const datos = usuarioIncompleto.datosPersonales || {};

    // Rellenar inputs de esta página
    document.querySelector('input[name="input-nombres"]').value = datos.nombres || "";
    document.querySelector('input[name="input-apellido-paterno"]').value = datos.apellidoPaterno || "";
    document.querySelector('input[name="input-apellido-materno"]').value = datos.apellidoMaterno || "";
    document.querySelector('input[name="input-numero-celular"]').value = datos.numeroCelular || "";
    document.querySelector('input[name="bday"]').value = datos.fechaNacimiento || "";
    document.querySelector('input[name="input-direccion-domicilio"]').value = datos.direccionDomicilio || "";

    // Selects
    document.getElementById("id_universidad").value = datos.universidad || "upc";
    document.getElementById("id_carrera").value = datos.carrera || "software";
});

// 2. Escuchar el click
btnContinuar.addEventListener("click", function(event) {
    event.preventDefault(); // evita que el formulario recargue la página

    // --- 3. Traer usuarios de localStorage ---
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Buscar usuario incompleto (registroCompleto: false)
    let usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    // --- 4. Obtener los inputs de datos personales ---
    const nombres = document.querySelector('input[name="input-nombres"]').value;
    const apellidoPaterno = document.querySelector('input[name="input-apellido-paterno"]').value;
    const apellidoMaterno = document.querySelector('input[name="input-apellido-materno"]').value;
    const numeroCelular = document.querySelector('input[name="input-numero-celular"]').value;
    const fechaNacimiento = document.querySelector('input[name="bday"]').value;
    const direccion = document.querySelector('input[name="input-direccion-domicilio"]').value;
    const universidad = document.querySelector('#id_universidad').value;
    const carrera = document.querySelector('#id_carrera').value;

    const nuevosDatosPersonales = {
        nombres: nombres,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        numeroCelular: numeroCelular,
        fechaNacimiento: fechaNacimiento,
        direccionDomicilio: direccion,
        universidad: universidad,
        carrera: carrera
    };

    if (usuarioIncompleto) {
        // --- 5A. SI YA EXISTE usuario incompleto → SOLO ACTUALIZAR ---
        usuarioIncompleto.datosPersonales = nuevosDatosPersonales;
    } else {
        // --- 5B. SI NO EXISTE → CREAR UNO NUEVO ---
        const nuevoUsuario = {
            id: crypto.randomUUID(),  // genera un id único
            correo: "",               // todavía no se llena
            contraseña: "",           // todavía no se llena
            rol: "",                  // todavía no se define
            registroCompleto: false,  // importante

            datosPersonales: nuevosDatosPersonales,

            cursos: [],               // se llenará después
            datosVehiculares: null    // solo si es conductor se llena luego
        };

        usuarios.push(nuevoUsuario);
    }

    // --- 6. Guardar el array actualizado en localStorage ---
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // --- 7. Redirigir a la siguiente pantalla ---
    window.location.href = "registroSecundario.html";
});
