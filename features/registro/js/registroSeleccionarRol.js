const btnCardConductor = document.getElementById("cardConductor");
const btnCardPasajero = document.getElementById("cardPasajero");
const btnAceptar = document.querySelector(".btn_aceptar");
const btnVolver = document.querySelector(".contenedor-icon");

let rolSeleccionado = null;

// -----------------------------
// Al cargar: leer rol desde localStorage y reflejarlo en la UI
// -----------------------------
window.addEventListener("DOMContentLoaded", function () {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    if (!usuarioIncompleto) return;

    const rolGuardado = usuarioIncompleto.rol;

    if (rolGuardado === "conductor") {
        // Simular selección de conductor
        btnCardConductor.classList.add("btn-masiva-seleccionado");
        btnCardConductor.style.backgroundColor = "#4A5568";
        btnCardPasajero.classList.remove("btn-masiva-seleccionado");
        btnCardPasajero.style.backgroundColor = "";

        rolSeleccionado = "conductor";
    } else if (rolGuardado === "pasajero") {
        // Simular selección de pasajero
        btnCardPasajero.classList.add("btn-masiva-seleccionado");
        btnCardPasajero.style.backgroundColor = "#4A5568";
        btnCardConductor.classList.remove("btn-masiva-seleccionado");
        btnCardConductor.style.backgroundColor = "";

        rolSeleccionado = "pasajero";
    }
});

// -----------------------------
// Seleccionar rol visualmente (clics)
// -----------------------------
btnCardConductor.addEventListener("click", function () {
    // Activar Conductor
    btnCardConductor.classList.add("btn-masiva-seleccionado");
    btnCardConductor.style.backgroundColor = "#4A5568";
    // Desactivar Pasajero
    btnCardPasajero.classList.remove("btn-masiva-seleccionado");
    btnCardPasajero.style.backgroundColor = "";

    rolSeleccionado = "conductor";
    console.log("Botón Conductor presionado");
});

btnCardPasajero.addEventListener("click", function () {
    // Activar Pasajero
    btnCardPasajero.classList.add("btn-masiva-seleccionado");
    btnCardPasajero.style.backgroundColor = "#4A5568";
    // Desactivar Conductor
    btnCardConductor.classList.remove("btn-masiva-seleccionado");
    btnCardConductor.style.backgroundColor = "";

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

    // Inicializar datosVehiculares solo para conductor si quieres
    if (rolSeleccionado === "conductor" && usuarioIncompleto.datosVehiculares == null) {
        usuarioIncompleto.datosVehiculares = {
            modelo: "",
            marca: "",
            color: "",
            placa: ""
        };
    }

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Ir a carga de horarios manual (o lo que tengas ahora)
    window.location.href = "registroCargaManual.html";
});

// -----------------------------
// Botón retroceder → volver a registroSecundario
// -----------------------------
btnVolver.addEventListener("click", function () {
    window.location.href = "registroSecundario.html";
});
