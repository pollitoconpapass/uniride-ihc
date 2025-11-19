const btnManual = document.getElementById("btn-manual-carga-masiva");
const btnMasiva = document.getElementById("btn-masiva-carga-masiva");
const btnContinuar = document.getElementById("btnContinuar");
const btnVolver = document.querySelector(".contenedor-icon");

// ------------------------------------
// BOTÓN MANUAL → IR A CARGA MANUAL
// ------------------------------------
btnManual.addEventListener("click", function () {
    btnManual.classList.add("btn-seleccionar-rol-seleccionado");
    btnMasiva.classList.remove("btn-seleccionar-rol-seleccionado");

    console.log("Botón Manual presionado");

    // Redirigir a carga manual
    window.location.href = "registroCargaManual.html";
});

// ------------------------------------
// BOTÓN MASIVA (solo estilo)
// ------------------------------------
btnMasiva.addEventListener("click", function () {
    btnMasiva.classList.add("btn-seleccionar-rol-seleccionado");
    btnManual.classList.remove("btn-seleccionar-rol-seleccionado");

    console.log("Botón Masiva presionado");
});

// ------------------------------------
// BOTÓN CONTINUAR → SEGÚN ROL
// ------------------------------------
btnContinuar.addEventListener("click", function () {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    if (!usuarioIncompleto) {
        alert("No se encontró un usuario en proceso de registro.");
        return;
    }

    const rol = usuarioIncompleto.rol;

    if (!rol) {
        alert("Aún no has seleccionado un rol. Vuelve a la pantalla anterior.");
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        window.location.href = "registroSeleccionarRol.html";
        return;
    }

    if (rol === "pasajero") {
        // ✅ Pasajero: completar registro acá
        usuarioIncompleto.registroCompleto = true;

        // Eliminar datosVehiculares si existiera
        if ("datosVehiculares" in usuarioIncompleto) {
            delete usuarioIncompleto.datosVehiculares;
        }

        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        alert("Registro completado con éxito. Inicia sesión.");
        window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";

    } else if (rol === "conductor") {
        // 🚗 Conductor: sigue al registro de datos vehiculares
        usuarioIncompleto.registroCompleto = false;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        window.location.href = "registroDatosVehiculares.html";
    } else {
        alert("Rol no válido. Vuelve a seleccionar tu rol.");
        window.location.href = "registroSeleccionarRol.html";
    }
});

// ------------------------------------
// BOTÓN RETROCEDER → REGRESAR A ELEGIR ROL
// ------------------------------------
btnVolver.addEventListener("click", function () {
    window.location.href = "registroSeleccionarRol.html";
});
