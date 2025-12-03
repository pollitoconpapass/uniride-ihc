document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorSolicitudes");
    const viaje = JSON.parse(localStorage.getItem("viajeSeleccionadoParaSolicitudes"));
    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));

    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.id === usuarioActivo.id_usuario);
    if (usuario) {
        const dp = usuario.datosPersonales;
        document.getElementById("sidebarNombre").innerText = dp.nombres.split(" ")[0] || "";
    }

    // Modales
    const modalAceptar = document.getElementById("modalAceptarSolicitud");
    const modalCancelar = document.getElementById("modalCancelarViaje");
    const cerrarAceptarBtn = document.getElementById("btnCerrarAceptar");
    const cerrarCancelarBtn = document.getElementById("btnCerrarCancelarViaje");
    const formCancelar = document.getElementById("formCancelarViaje");

    if (!viaje) {
        contenedor.innerHTML = "<p>No se encontró información del viaje.</p>";
        return;
    }

    // Filtrar solicitudes PENDIENTES para este viaje
    const reservasFiltradas = reservas.filter(r =>
        r.idConductor === viaje.idConductor &&
        r.fecha === viaje.fecha &&
        r.hora === viaje.hora &&
        r.ruta === viaje.ruta &&
        r.estado === "pendiente"
    );

    const cupoLleno = viaje.pasajerosActuales >= viaje.pasajeros;

    if (cupoLleno) {
       document.getElementById("mensaje-global").innerHTML = `
         <div class="mensaje-cupo">
           <h3>✅ Cupo completo</h3>
          <p>Has alcanzado el máximo de <strong>${viaje.pasajeros} pasajeros</strong>.</p>
         <p>No puedes aceptar más solicitudes para este viaje.</p>
         </div>
        `;
return;
    }

    if (reservasFiltradas.length === 0) {
        contenedor.innerHTML = `
            <p class="empty-table-message">No hay solicitudes para este viaje.</p>
        `;
        return;
    }

    // Crear cards
    reservasFiltradas.forEach(reserva => {
        const card = document.createElement("div");
        card.className = "solicitud-card";
        card.innerHTML = `
            <h3>${reserva.nombrePasajero}</h3>
            <p><strong>Punto:</strong> ${reserva.puntoRecogida}</p>
            <p><strong>Método:</strong> ${reserva.metodo}</p>
            <p><strong>Monto:</strong> ${reserva.monto || "—"}</p>
            <p><strong>Estado:</strong> ${reserva.estado}</p>
            <div class="solicitud-acciones">
                <button class="btn-aceptar" data-id-reserva="${reserva.idReserva}">Aceptar</button>
                <button class="btn-rechazar" data-id-reserva="${reserva.idReserva}">Rechazar</button>
            </div>
        `;
        contenedor.appendChild(card);
    });

    // === ACEPTAR ===
    document.querySelectorAll(".btn-aceptar").forEach(btn => {
        btn.addEventListener("click", () => {
            // Verificar cupo en tiempo real
            const viajeActual = JSON.parse(localStorage.getItem("viajeSeleccionadoParaSolicitudes"));
            if (viajeActual.pasajerosActuales >= viajeActual.pasajeros) {
                alert("No se pueden aceptar más pasajeros. El cupo está lleno.");
                return;
            }

            const idReserva = btn.dataset.idReserva;
            const reserva = reservas.find(r => r.idReserva == idReserva);
            if (!reserva) return;

            // Aceptar
            reserva.estado = "Aceptado";
            reserva.estadoViaje = "Por llegar";
            localStorage.setItem("reservas", JSON.stringify(reservas));

            // Actualizar viaje en localStorage
            let viajesGuardados = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
            const viajeIndex = viajesGuardados.findIndex(v =>
                v.id === viaje.id
            );
            if (viajeIndex !== -1) {
                viajesGuardados[viajeIndex].pasajerosActuales += 1;
                localStorage.setItem("viajesGuardados", JSON.stringify(viajesGuardados));
                // Actualizar copia local para posteriores verificaciones
                viaje.pasajerosActuales = viajesGuardados[viajeIndex].pasajerosActuales;
            }

            // Eliminar card
            btn.closest(".solicitud-card").remove();

            // Mostrar modal
            modalAceptar.style.display = "flex";

            //desactivar otros botones
            if (viaje.pasajerosActuales >= viaje.pasajeros) {
                document.querySelectorAll(".btn-aceptar, .btn-rechazar").forEach(b => {
                    b.disabled = true;
                    b.style.opacity = "0.5";
                    b.style.cursor = "not-allowed";
                });
                setTimeout(() => {
                    alert("¡Cupo completo! Ya no puedes aceptar más pasajeros.");
                }, 300);
            }
        });
    });

    // === RECHAZAR ===
    document.querySelectorAll(".btn-rechazar").forEach(btn => {
        btn.addEventListener("click", () => {
            const idReserva = btn.dataset.idReserva;
            const reserva = reservas.find(r => r.idReserva == idReserva);
            if (reserva) {
                reserva.estado = "Rechazado";
                localStorage.setItem("reservas", JSON.stringify(reservas));
                btn.closest(".solicitud-card").remove();

                // Mostrar modal
                modalCancelar.style.display = "flex";
            }
        });
    });

    // === Cerrar modales ===
    cerrarAceptarBtn?.addEventListener("click", () => {
        modalAceptar.style.display = "none";
    });

    cerrarCancelarBtn?.addEventListener("click", () => {
        modalCancelar.style.display = "none";
    });

    formCancelar?.addEventListener("submit", (e) => {
        e.preventDefault();
        modalCancelar.style.display = "none";
    });
});