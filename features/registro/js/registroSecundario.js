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
// FUNCIONES DE VALIDACIÓN
// -------------------------------------------

// Verificar si un string está vacío o solo tiene espacios
function estaVacio(valor) {
    return !valor || valor.trim() === "";
}

// Validar correo institucional: tiene @ y termina en .edu.pe
function esCorreoInstitucionalValido(correo) {
    if (estaVacio(correo)) return false;

    // Normalizamos espacios y a minúsculas por si acaso
    const correoLimpio = correo.trim().toLowerCase();

    // Debe tener formato algo@algo.edu.pe
    const regex = /^[^@\s]+@[^@\s]+\.edu\.pe$/;
    return regex.test(correoLimpio);
}

// -------------------------------------------
// GUARDAR DATOS AL PRESIONAR "ACEPTAR"
// -------------------------------------------
const btnAceptar = document.querySelector(".btn_aceptar");

btnAceptar.addEventListener("click", function (event) {
    event.preventDefault();

    const correo = document.getElementById("correo-institucional").value.trim();
    const password = document.getElementById("contraseña").value;
    const passwordConfirm = document.getElementById("confirmar-contraseña").value;

    // 1) Validar que nada esté vacío
    if (estaVacio(correo) || estaVacio(password) || estaVacio(passwordConfirm)) {
        alert("Por favor, completa todos los campos antes de continuar.");
        return;
    }

    // 2) Validar formato de correo institucional
    if (!esCorreoInstitucionalValido(correo)) {
        alert("Ingresa un correo institucional válido que termine en .edu.pe (ejemplo: g@example.edu.pe).");
        return;
    }

    // 3) Validar que las contraseñas coincidan
    if (password !== passwordConfirm) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    // 4) Buscar usuario en registro
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    if (!usuarioIncompleto) {
        alert("No hay usuario en registro.");
        return;
    }

    // 5) Guardar datos en el usuario incompleto
    usuarioIncompleto.correo = correo;
    usuarioIncompleto.contraseña = password;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // 6) Ir a la siguiente pantalla
    window.location.href = "registroSeleccionarRol.html";
});

// -------------------------------------------
// BOTÓN RETROCEDER (icono)
// -------------------------------------------
document.getElementById("btn-volver").addEventListener("click", function () {
    // No se borra nada, solo retrocede
    window.location.href = "registroPrincipal.html";
});

// -------------------------------------------
// ENLACE "¿Deseas volver?"
// -------------------------------------------
document.getElementById("btn-volver-form").addEventListener("click", function (event) {
    event.preventDefault(); // evitar que "a" haga cosas raras
    window.location.href = "registroPrincipal.html";
});
