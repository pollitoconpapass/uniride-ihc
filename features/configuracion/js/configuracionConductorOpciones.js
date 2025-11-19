const btnDatosPersonales = document.getElementById("btn-datos-personales");
const btnHorarios = document.getElementById("btn-horarios");
const btnDatosVehiculares = document.getElementById("btn-datos-vehiculares");
// INFO GENERAL
document.addEventListener("DOMContentLoaded", () => {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.id === usuarioActivo.id_usuario);

    if (!usuario) {
        console.warn("No se encontró al usuario activo en la base de usuarios");
        return;
    }

    const dp = usuario.datosPersonales;

    document.getElementById("sidebarNombre").innerText = dp.nombres.split(" ")[0] || "";
    document.getElementById("tituloNombre").innerText = dp.nombres.split(" ")[0] || "";

    document.getElementById("carrera").textContent =
        dp.carrera || "No especificado";

    document.getElementById("universidad").textContent =
        dp.universidad || "No especificada";

});


btnDatosPersonales.addEventListener("click", function() {
    window.location.href = "configuracionConductorDatosPersonales.html";
});

btnHorarios.addEventListener("click", function() {
    window.location.href = "configuracionConductorHorarioManual.html";
});

btnDatosVehiculares.addEventListener("click", function() {
    window.location.href = "configuracionConductorDatosVehiculares.html";
});