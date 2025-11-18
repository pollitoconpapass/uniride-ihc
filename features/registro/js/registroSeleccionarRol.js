const btnCardConductor = document.getElementById("cardConductor");
const btnCardPasajero = document.getElementById("cardPasajero");
const btnAceptar = document.querySelector(".btn_aceptar");
const btnVolver = document.querySelector(".contenedor-icon");

let rolSeleccionado = null;

// -----------------------------
// Seleccionar rol visualmente
// -----------------------------
btnCardConductor.addEventListener("click", function () {
    // Activar Conductor
    btnCardConductor.classList.add("btn-masiva-seleccionado");
    // Desactivar Pasajero
    btnCardPasajero.classList.remove("btn-masiva-seleccionado");

    rolSeleccionado = "conductor";
    console.log("Botón Conductor presionado");
});

btnCardPasajero.addEventListener("click", function () {
    // Activar Pasajero
    btnCardPasajero.classList.add("btn-masiva-seleccionado");
    // Desactivar Conductor
    btnCardConductor.classList.remove("btn-masiva-seleccionado");

    rolSeleccionado = "pasajero";
    console.log("Botón Pasajero presionado");
});

// -----------------------------
// Guardar rol al presionar Aceptar
// -----------------------------
btnAceptar.addEventListener("click", function () {
    if (!rolSeleccionado) {
        alert("Por favor selecciona un rol antes de continuar.");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    if (!usuarioIncompleto) {
        alert("No se encontró un usuario en proceso de registro.");
        return;
    }

    // Guardar el rol
    usuarioIncompleto.rol = rolSeleccionado;

    // Si quieres, aquí podrías inicializar datosVehiculares solo para conductor:
    if (rolSeleccionado === "conductor" && usuarioIncompleto.datosVehiculares === null) {
        usuarioIncompleto.datosVehiculares = {
            modelo: "",
            marca: "",
            color: "",
            placa: ""
        };
    }

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // TODO: cambia esta ruta por la siguiente pantalla real
    // Por ahora la dejo como "registroHorarios.html" de ejemplo
    window.location.href = "registroCargaManual.html";
});

// -----------------------------
// Botón retroceder → volver a registroSecundario
// -----------------------------
btnVolver.addEventListener("click", function () {
    window.location.href = "registroSecundario.html";
});
