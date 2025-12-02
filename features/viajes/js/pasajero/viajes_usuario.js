// Google Analytics
document.addEventListener('DOMContentLoaded', function() {
  const buttonIds = [
    'addTripBtn'
  ];

  buttonIds.forEach(function(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', function() {
        gtag('event', 'button_click', {
          'event_category': 'engagement',
          'event_label': buttonId
        });
      });
    }
  });
});

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
    const viajesPasadosGlobales = JSON.parse(localStorage.getItem("viajesPasados")) || []; 

    if (!usuarioActivo) {
        console.error("No hay un usuario activo.");
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

    // === FUNCIÓN DE AYUDA PARA ENCONTRAR VIAJE ===
    function sonDatosCoincidentes(viaje, reserva) {
        // Comparación laxa para asegurar coincidencia
        return String(viaje.idConductor) === String(reserva.idConductor) &&
               viaje.fecha === reserva.fecha &&
               viaje.hora === reserva.hora &&
               viaje.ruta === reserva.ruta;
    }

    function obtenerViajeDeReserva(reserva) {
        // 1. Intentar por índice en viajes guardados (el caso feliz)
        let viaje = todosLosViajes[reserva.viajeIndex];
        if (viaje && sonDatosCoincidentes(viaje, reserva)) {
            return { viaje, origen: 'activos' };
        }

        // 2. Buscar en viajes pasados (finalizados por conductor)
        viaje = viajesPasadosGlobales.find(v => sonDatosCoincidentes(v, reserva));
        if (viaje) {
            return { viaje, origen: 'pasados' };
        }

        // 3. Buscar linealmente en activos (por si se movió el índice)
        viaje = todosLosViajes.find(v => sonDatosCoincidentes(v, reserva));
        if (viaje) {
            return { viaje, origen: 'activos' };
        }

        return null;
    }


    // Función auxiliar para generar HTML de tarjeta
    function generarTarjetaHTML(reserva, viaje, esPasado = false) {
        let estadoParaClase = reserva.estado.toLowerCase().replace(' ', '-');
        if (estadoParaClase === 'aceptado') estadoParaClase = 'aprobado';
        
        // Si es pasado y no cancelado, mostramos "Finalizado" visualmente
        let estadoTexto = reserva.estado;
        if (esPasado && reserva.estado !== "cancelado") {
            estadoTexto = "Finalizado";
            estadoParaClase = "finalizado"; // Puedes agregar estilo para esta clase si quieres
        }

        return `
            <div class="trip-card-item">
                <div class="card-header">
                    <div class="driver-info">
                        <h4>${viaje.conductor}</h4>
                        <span>Conductor</span>
                    </div>
                    <span class="status-badge ${estadoParaClase}">${estadoTexto}</span>
                </div>
                
                <div class="card-body">
                    <div class="info-group">
                        <span class="info-label">Fecha y Hora</span>
                        <div class="info-row">
                            📅 ${reserva.fecha} - ⏰ ${reserva.hora}
                        </div>
                    </div>
                    
                    <div class="info-group">
                        <span class="info-label">Punto de Recogida</span>
                        <div class="info-row">
                            📍 ${reserva.puntoRecogida}
                        </div>
                    </div>

                    <div class="info-group">
                        <span class="info-label">Compensación</span>
                        <div class="info-row">
                            💰 ${reserva.metodo} ${reserva.monto ? `(S/ ${reserva.monto})` : ''}
                        </div>
                    </div>
                </div>

                <div class="card-footer" style="display: flex; gap: 10px;">
                    ${!esPasado ? `
                        <button class="details-btn" data-viaje-index="${reserva.viajeIndex}" style="flex: 1;">
                            Ver detalles
                        </button>
                        <button class="cancel-btn" data-reserva-id="${reserva.idReserva}" style="flex: 1;">
                            Cancelar
                        </button>
                    ` : `
                        <span style="font-size: 0.9rem; color: #aaa;">Viaje finalizado</span>
                    `}
                </div>
            </div>
        `;
    }

    // --- VIAJES AGENDADOS ---
    const misReservasAgendadas = todasLasReservas.filter(reserva => {
        if (reserva.idPasajero !== usuarioActivo.id_usuario) return false;
        
        // Solo mostramos aquí si NO está cancelado Y el viaje sigue activo
        const info = obtenerViajeDeReserva(reserva);
        
        // Si no encontramos el viaje, asumimos que se borró o algo raro pasó, no lo mostramos en agendados
        if (!info) return false;

        // Si el viaje ya está en 'pasados', esta reserva NO debería ir en agendados
        if (info.origen === 'pasados') return false;

        return (reserva.estado === "Aceptado" || reserva.estado === "pendiente" || reserva.estado === "aprobado" || reserva.estado === "Pendiente");
    });

    const containerAgendados = document.querySelector(".viajes_agendados_confirmados");
    
    if (misReservasAgendadas.length === 0) {
        containerAgendados.innerHTML = `
            <div class="empty-state-message">
                No tienes viajes agendados por el momento.
            </div>
        `;
    } else {
        containerAgendados.innerHTML = ""; 
        misReservasAgendadas.forEach((reserva) => {
            const info = obtenerViajeDeReserva(reserva);
            if (info && info.viaje) {
                containerAgendados.innerHTML += generarTarjetaHTML(reserva, info.viaje, false);
            }
        });
    }

    // --- VIAJES PASADOS ---
    const misReservasPasadas = todasLasReservas.filter(reserva => {
        if (reserva.idPasajero !== usuarioActivo.id_usuario) return false;

        if (reserva.estado === "cancelado") return true;

        const info = obtenerViajeDeReserva(reserva);
        // Si encontramos el viaje y está en el historial de pasados del conductor, es un viaje pasado para nosotros
        if (info && info.origen === 'pasados') {
            return true;
        }

        return false;
    });

    const containerPasados = document.querySelector(".viajes_pasados");

    if (misReservasPasadas.length === 0) {
        containerPasados.innerHTML = `
            <div class="empty-state-message">
                No tienes viajes pasados en tu historial.
            </div>
        `;
    } else {
        containerPasados.innerHTML = ""; 
        misReservasPasadas.forEach((reserva) => {
            const info = obtenerViajeDeReserva(reserva);
            // Si la reserva es "cancelada" pero el viaje ya no existe (se borró todo), igual intentamos mostrar algo si tuviéramos backup, 
            // pero aquí dependemos de encontrar el viaje.
            // Si es cancelada, a veces el viaje activo aún existe.
            
            if (info && info.viaje) {
                generarTarjetaHTML(reserva, info.viaje, true); // Llamada solo para testear
                containerPasados.innerHTML += generarTarjetaHTML(reserva, info.viaje, true);
            } else {
                // Caso borde: Reserva cancelada de un viaje que ya no existe en ningún lado. 
                // Podríamos renderizar una tarjeta genérica con los datos de la reserva.
                // Por ahora lo omitimos para no romper el diseño.
            }
        });
    }

    // --- INTERACCIÓN ---
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('details-btn')) {
            const viajeIndex = e.target.getAttribute('data-viaje-index');
            // Aquí hay un detalle: si el viaje se movió, el index original quizá ya no sirva para encontrarlo en 'encontrar_viajes'
            // pero 'informacion_viaje.html' usa el index para cargar desde 'viajesGuardados'.
            // Si el viaje está activo, funcionará.
            if (viajeIndex !== null) {
                window.location.href = `informacion_viaje.html?viajeIndex=${viajeIndex}`;
            }
        }

        if (e.target && e.target.classList.contains('cancel-btn')) {
            const reservaId = e.target.getAttribute('data-reserva-id');
            if (confirm("¿Estás seguro de que deseas cancelar esta solicitud?")) {
                const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
                const reservaIndex = reservas.findIndex(r => r.idReserva == reservaId);

                if (reservaIndex !== -1) {
                    reservas[reservaIndex].estado = "cancelado";
                    localStorage.setItem("reservas", JSON.stringify(reservas));
                    alert("Solicitud cancelada correctamente.");
                    location.reload();
                }
            }
        }
    });
});