document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorSolicitudes");

    const viaje = JSON.parse(localStorage.getItem("viajeSeleccionadoParaSolicitudes"));
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo")); // conductor

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

    // === MODALES ===
    const modalAceptar = document.getElementById("modalAceptarSolicitud");
    const modalCancelar = document.getElementById("modalCancelarViaje");

    const cerrarAceptarBtn = document.getElementById("btnCerrarAceptar");
    const cerrarCancelarBtn = document.getElementById("btnCerrarCancelarViaje");
    const formCancelar = document.getElementById("formCancelarViaje");

    if (!viaje) {
        contenedor.innerHTML = "<p>No se encontró información del viaje.</p>";
        return;
    }

    const reservasFiltradas = reservas.filter(r =>
    r.idConductor === usuarioActivo.id_usuario &&
    r.ruta === viaje.ruta &&
    r.fecha === viaje.fecha &&
    r.hora === viaje.hora &&
    r.estado === "pendiente"
);


    if (reservasFiltradas.length === 0) {
        contenedor.innerHTML = `
            <p class="empty-table-message">No hay solicitudes para este viaje.</p>
        `;
        return;
    }

    // Crear cards
    reservasFiltradas.forEach((reserva, index) => {
        const card = document.createElement("div");
        card.className = "solicitud-card";

        card.innerHTML = `
            <h3>${reserva.nombrePasajero}</h3>

            <p><strong>Punto:</strong> ${reserva.puntoRecogida}</p>
            <p><strong>Método:</strong> ${reserva.metodo}</p>
            <p><strong>Monto:</strong> ${reserva.monto || "—"}</p>
            <p><strong>Estado:</strong> ${reserva.estado}</p>

            <div class="solicitud-acciones">
                <button class="btn-aceptar" data-index="${index}">Aceptar</button>
                <button class="btn-rechazar" data-index="${index}">Rechazar</button>
            </div>
        `;

        contenedor.appendChild(card);
    });

// === EVENTOS: ACEPTAR ===
document.querySelectorAll(".btn-aceptar").forEach(btn => {
    btn.addEventListener("click", () => {
        const idx = btn.dataset.index;
        const reservaAceptada = reservasFiltradas[idx];

        // Encontrar la reserva original en el array completo
        const idxOriginal = reservas.findIndex(r =>
            r.idConductor === reservaAceptada.idConductor &&
            r.idPasajero === reservaAceptada.idPasajero &&
            r.fecha === reservaAceptada.fecha &&
            r.hora === reservaAceptada.hora
        );

        if (idxOriginal !== -1) {
            reservas[idxOriginal].estado = "Aceptado";
            reservas[idxOriginal].estadoViaje = "Por llegar";
            localStorage.setItem("reservas", JSON.stringify(reservas));
        }

        actualizarPasajerosDelViaje(viaje);
        btn.closest(".solicitud-card").remove();
        modalAceptar.style.display = "flex";
    });
});



cerrarAceptarBtn.addEventListener("click", () => {
    modalAceptar.style.display = "none";
});





    // === EVENTOS: RECHAZAR ===
document.querySelectorAll(".btn-rechazar").forEach(btn => {
    btn.addEventListener("click", () => {
        const idx = btn.dataset.index;

        reservasFiltradas[idx].estado = "Rechazado";
        actualizarReservas(reservas, reservasFiltradas[idx]);

        // Ocultar la card del DOM inmediatamente
        btn.closest(".solicitud-card").remove();

        // Mostrar modal rechazar
        modalCancelar.style.display = "flex";
    });
});



    cerrarCancelarBtn.addEventListener("click", () => {
        modalCancelar.style.display = "none";
        location.reload();
    });

    formCancelar.addEventListener("submit", (e) => {
        e.preventDefault();
        modalCancelar.style.display = "none";
        location.reload();
    });

});



function actualizarPasajerosDelViaje(viajeSeleccionado) {
    let viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];

    viajes = viajes.map(v => {
        if (
            v.idConductor === viajeSeleccionado.idConductor &&
            v.fecha === viajeSeleccionado.fecha &&
            v.hora === viajeSeleccionado.hora &&
            v.ruta === viajeSeleccionado.ruta
        ) {
            v.pasajerosActuales = (v.pasajerosActuales || 0) + 1;
        }
        return v;
    });

    localStorage.setItem("viajesGuardados", JSON.stringify(viajes));
}



