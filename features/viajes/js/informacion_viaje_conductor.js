document.addEventListener("DOMContentLoaded", () => {
    console.log("JS de información del viaje cargado");

    let viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const index = parseInt(localStorage.getItem("viajeIndex"));
    let viaje = viajes[index];

    // Cargar información
    if (viaje) {
        document.querySelector(".section p:nth-child(2)").innerHTML = `<strong>Fecha:</strong> ${viaje.fecha}`;
        document.querySelector(".section p:nth-child(3)").innerHTML = `<strong>Hora de inicio:</strong> ${viaje.hora}`;
        document.querySelector(".section p:nth-child(4)").innerHTML = `<strong>Puntos de recogida:</strong> Por definir`;
        document.querySelector(".section p:nth-child(5)").innerHTML = `<strong>Ruta:</strong> ${viaje.ruta}`;
    }


    const btnCancelar = document.getElementById("cancelarViaje");
    const btnComenzar = document.getElementById("comenzarViaje");
    const btnFinalizar = document.getElementById("finalizarViaje");

    function actualizarBotones() {
        if (viaje.estado === "Pendiente") {
            btnCancelar.style.display = "inline-block";
            btnComenzar.style.display = "inline-block";
            btnFinalizar.style.display = "none";
        }
        else if (viaje.estado === "En curso") {
            btnCancelar.style.display = "none";
            btnComenzar.style.display = "none";
            btnFinalizar.style.display = "inline-block";
        }
        else {
            btnCancelar.style.display = "none";
            btnComenzar.style.display = "none";
            btnFinalizar.style.display = "none";
        }
    }

    actualizarBotones();

    const modalCancelarViaje = document.getElementById("modalCancelarViaje");
    const btnCerrarCancelarViaje = document.getElementById("btnCerrarCancelarViaje");
    const formCancelarViaje = document.getElementById("formCancelarViaje");

    btnCancelar.addEventListener("click", () => {
        modalCancelarViaje.style.display = "flex";
    });

    btnCerrarCancelarViaje.addEventListener("click", () => {
        modalCancelarViaje.style.display = "none";
    });

    formCancelarViaje.addEventListener("submit", (e) => {
        e.preventDefault();

        const motivo = document.getElementById("motivoCancelacion").value.trim();
        if (motivo === "") return alert("Ingrese un motivo");

        viajes.splice(index, 1);
        localStorage.setItem("viajesGuardados", JSON.stringify(viajes));

        localStorage.setItem("actualizarTablaViajes", "true");
        window.location.href = "viajes_conductor.html";
    });

    btnComenzar.addEventListener("click", () => {
        viaje.estado = "En curso";
        viajes[index] = viaje;

        localStorage.setItem("viajesGuardados", JSON.stringify(viajes));
        localStorage.setItem("actualizarTablaViajes", "true");

        actualizarBotones();
        alert("El viaje ha comenzado");
    });


    btnFinalizar.addEventListener("click", () => {

        let pasados = JSON.parse(localStorage.getItem("viajesPasados")) || [];
        pasados.push(viaje);
        localStorage.setItem("viajesPasados", JSON.stringify(pasados));
        
        viajes.splice(index, 1);
        localStorage.setItem("viajesGuardados", JSON.stringify(viajes));

        localStorage.setItem("actualizarTablaViajes", "true");

        window.location.href = "viajes_conductor.html";
    });

});
