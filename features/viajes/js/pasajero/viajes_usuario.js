document.addEventListener("DOMContentLoaded", () => {
    // Botón para encontrar nuevos viajes
    const addTripBtn = document.getElementById('addTripBtn');
    if (addTripBtn) {
        addTripBtn.addEventListener('click', function() {
            window.location.href = 'encontrar_viajes.html';
        });
    }

    // Lógica para mostrar los viajes
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    const todasLasReservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const todosLosViajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    
    if (!usuarioActivo) {
        console.error("No hay un usuario activo.");
        return;
    }

    // --- VIAJES AGENDADOS (pendientes, aceptados o aprobados) ---
    const misReservasAgendadas = todasLasReservas.filter(reserva => 
        reserva.idPasajero === usuarioActivo.id_usuario && (reserva.estado === "Aceptado" || reserva.estado === "pendiente" || reserva.estado === "aprobado")
    );

    const tbodyAgendados = document.querySelector(".viajes_agendados_confirmados");
    if (!tbodyAgendados) {
        console.error("No se encontró el tbody para viajes agendados.");
        return;
    }

    if (misReservasAgendadas.length === 0) {
        tbodyAgendados.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table-message">
                    No tienes viajes agendados por el momento.
                </td>
            </tr>
        `;
    } else {
        tbodyAgendados.innerHTML = ""; // Limpiar
        misReservasAgendadas.forEach((reserva, i) => {
            const viajeCorrespondiente = todosLosViajes[reserva.viajeIndex];
            if (!viajeCorrespondiente) {
                console.warn("Viaje correspondiente no encontrado para el índice:", reserva.viajeIndex);
                return;
            }

            const row = document.createElement("tr");
            row.setAttribute('data-row-index', reserva.viajeIndex);
            row.innerHTML = `
                <td>${viajeCorrespondiente.conductor}</td>
                <td>${reserva.hora}</td>
                <td>${reserva.fecha}</td>
                <td>${reserva.puntoRecogida}</td>
                <td><span class="badge badge-blue">${reserva.estado}</span></td>
                <td>
                    <button class="details-btn" data-viaje-index="${reserva.viajeIndex}">
                        Ver detalles
                    </button>
                </td>
            `;
            tbodyAgendados.appendChild(row);
        });
    }

    // --- VIAJES PASADOS (cancelados) ---
    const misReservasPasadas = todasLasReservas.filter(reserva => 
        reserva.idPasajero === usuarioActivo.id_usuario && reserva.estado === "cancelado"
    );

    const tbodyPasados = document.querySelector(".viajes_pasados");
    if (!tbodyPasados) {
        console.error("No se encontró el tbody para viajes pasados.");
        return;
    }

    if (misReservasPasadas.length === 0) {
        tbodyPasados.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table-message">
                    No tienes viajes pasados por el momento.
                </td>
            </tr>
        `;
    } else {
        tbodyPasados.innerHTML = ""; // Limpiar
        misReservasPasadas.forEach((reserva, i) => {
            const viajeCorrespondiente = todosLosViajes[reserva.viajeIndex];
            if (!viajeCorrespondiente) {
                console.warn("Viaje correspondiente no encontrado para el índice:", reserva.viajeIndex);
                return;
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${viajeCorrespondiente.conductor}</td>
                <td>${reserva.hora}</td>
                <td>${reserva.fecha}</td>
                <td>${reserva.metodo}</td>
                <td><span class="badge badge-orange">${reserva.estado}</span></td>
                <td>-</td>
            `;
            tbodyPasados.appendChild(row);
        });
    }

    // --- LÓGICA PARA MOSTRAR DETALLES EN LA PÁGINA ---
    tbodyAgendados.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('details-btn')) {
            const viajeIndex = e.target.getAttribute('data-viaje-index');
            const clickedRow = e.target.closest('tr');

            // Cerrar cualquier otro detalle abierto
            const openDetail = document.querySelector('.trip-details-row');
            if (openDetail && openDetail.previousElementSibling !== clickedRow) {
                openDetail.remove();
            }

            const nextRow = clickedRow.nextElementSibling;
            if (nextRow && nextRow.classList.contains('trip-details-row')) {
                nextRow.remove();
                return;
            }
            
            if (viajeIndex !== null) {
                const viaje = todosLosViajes[viajeIndex];
                const reserva = misReservasAgendadas.find(r => r.viajeIndex == viajeIndex);

                if (!viaje || !reserva) {
                    alert("Error al cargar los detalles.");
                    return;
                }

                const detailsRow = document.createElement('tr');
                detailsRow.className = 'trip-details-row';
                detailsRow.innerHTML = `
                    <td colspan="6">
                        <div class="trip-details-card">
                            <h4>Detalles del Viaje a ${viaje.ruta}</h4>
                            <p><strong>Conductor:</strong> ${viaje.conductor}</p>
                            <p><strong>Fecha y Hora:</strong> ${reserva.fecha} a las ${reserva.hora}</p>
                            <p><strong>Punto de Recogida:</strong> ${reserva.puntoRecogida}</p>
                            <p><strong>Método de Compensación:</strong> ${reserva.metodo}</p>
                            ${reserva.monto ? `<p><strong>Monto:</strong> S/ ${reserva.monto}</p>` : ''}
                            <p><strong>Estado:</strong> ${reserva.estado}</p>
                            <button class="close-details-btn">Cerrar</button>
                        </div>
                    </td>
                `;

                clickedRow.parentNode.insertBefore(detailsRow, clickedRow.nextSibling);

                detailsRow.querySelector('.close-details-btn').addEventListener('click', () => {
                    detailsRow.remove();
                });
            }
        }
    });
});
