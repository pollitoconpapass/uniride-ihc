// -------------------------------------------
// CARGAR DATOS EN ESTA PANTALLA (SI EXISTEN)
// -------------------------------------------
window.addEventListener("DOMContentLoaded", function () {

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    if (!usuarioIncompleto) return;

    // Rellenar campos
    document.getElementById("correo-institucional").value = usuarioIncompleto.correo || "";
    document.getElementById("contraseña").value = usuarioIncompleto.contraseña || "";
    document.getElementById("confirmar-contraseña").value = usuarioIncompleto.contraseña || "";
});


// -------------------------------------------
// GUARDAR DATOS AL PRESIONAR "ACEPTAR"
// -------------------------------------------
const btnAceptar = document.querySelector(".btn_aceptar");

btnAceptar.addEventListener("click", function (event) {
    event.preventDefault();

    const correo = document.getElementById("correo-institucional").value.trim();
    const password = document.getElementById("contraseña").value;
    const passwordConfirm = document.getElementById("confirmar-contraseña").value;

    if (password !== passwordConfirm) {
        alert("Las contraseñas no coinciden");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    if (!usuarioIncompleto) {
        alert("No hay usuario en registro");
        return;
    }

    usuarioIncompleto.correo = correo;
    usuarioIncompleto.contraseña = password;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Ir a la siguiente pantalla
    window.location.href = "registroSeleccionarRol.html";
});


// -------------------------------------------
// BOTÓN RETROCEDER (icono) — MISMA LÓGICA
// -------------------------------------------
document.getElementById("btn-volver").addEventListener("click", function () {
    // No se borra nada, solo retrocede
    window.location.href = "registroPrincipal.html";
});


// -------------------------------------------
// ENLACE "¿Deseas volver?" — MISMA ACCIÓN
// -------------------------------------------
document.getElementById("btn-volver-form").addEventListener("click", function (event) {
    event.preventDefault(); // evitar que "a" haga cosas raras
    window.location.href = "registroPrincipal.html";
});

