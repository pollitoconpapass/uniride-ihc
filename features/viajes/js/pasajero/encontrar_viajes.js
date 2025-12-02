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

    const universidadPasajero = dp.universidad;

    const container = document.getElementById("viajes-container"); // Nuevo contenedor de grid

    const todosLosViajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const misReservas = JSON.parse(localStorage.getItem("reservas")) || [];

    // Identificar índices de viajes que el usuario YA reservó y que están activos (pendiente/aceptado)
    const viajesReservadosIndices = misReservas
        .filter(r => r.idPasajero === usuarioActivo.id_usuario && r.estado !== "cancelado")
        .map(r => r.viajeIndex);

    // Mapeamos para conservar el índice original antes de filtrar
    const viajes = todosLosViajes
        .map((viaje, originalIndex) => {
            if (!viaje) return null;
            return { ...viaje, originalIndex };
        })
        .filter(viaje => {
            if (!viaje) return false;

            const uniConductor = (viaje.universidadConductor || "").trim().toLowerCase();
            const uniPasajero = (universidadPasajero || "").trim().toLowerCase();

            // Filtramos por universidad, estado Pendiente y que el usuario no lo haya reservado aún
            return uniConductor === uniPasajero &&
                   viaje.estado === "Pendiente" &&
                   !viajesReservadosIndices.includes(String(viaje.originalIndex));
        });

    // console.log(`[Debug] Buscando viajes para: '${universidadPasajero}'. Encontrados: ${viajes.length}`);


    function generarTarjetaHTML(viaje) {
        const puntosTexto = Array.isArray(viaje.puntosRecogida)
            ? viaje.puntosRecogida.join(", ")
            : viaje.puntosRecogida || "—";

        // Universidad destino (si no tiene, mostramos la del conductor que es la misma del filtro)
        const destinoFinal = viaje.universidadConductor || "Universidad";

        return `
            <div class="trip-card-item">
                <div class="card-header">
                    <div class="driver-info">
                        <h4>${viaje.conductor}</h4>
                        <span class="uni-dest">Hacia: ${destinoFinal}</span>
                    </div>
                    <!-- Podríamos poner precio si existiera -->
                </div>
                
                <div class="card-body">
                    <div class="info-group">
                        <span class="info-label">Salida</span>
                        <div class="info-row">
                            📅 ${viaje.fecha} - ⏰ ${viaje.hora}
                        </div>
                    </div>
                    
                    <div class="info-group">
                        <span class="info-label">Puntos de Recogida</span>
                        <div class="info-row">
                            📍 ${puntosTexto}
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <button class="reserve-btn" data-index="${viaje.originalIndex}">
                        Reservar
                    </button>
                    <button class="details-btn" data-index="${viaje.originalIndex}">
                        Ver detalles
                    </button>
                </div>
            </div>
        `;
    }

    if (viajes.length === 0) {
        container.innerHTML = `
            <div class="empty-state-message">
                <p>No hay viajes disponibles de tu universidad en este momento.</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Intenta buscar más tarde o crea uno nuevo si eres conductor.</p>
            </div>
        `;
    } else {
        container.innerHTML = "";
        viajes.forEach((viaje) => {
            container.innerHTML += generarTarjetaHTML(viaje);
        });
    }

    // ---------- MODAL LOGIC ----------
    const modal = document.getElementById("reservarModal");
    const modalConductor = document.getElementById("modalConductor");
    const modalFecha = document.getElementById("modalFecha");
    const modalHora = document.getElementById("modalHora");
    const modalRuta = document.getElementById("modalRuta");
    const modalPuntoRecogida = document.getElementById("modalPuntoRecogida");
    const modalMetodo = document.getElementById("modalMetodo");
    const campoMonto = document.getElementById("campoMonto");
    const modalMonto = document.getElementById("modalMonto");

    const guardarReservaBtn = document.getElementById("guardarReservaBtn");
    const cancelarReservaBtn = document.getElementById("cancelarReservaBtn");

    let seleccion = null;

    // Delegación de eventos para botones dinámicos
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('reserve-btn')) {
            const index = e.target.dataset.index; // Es el originalIndex
            const viaje = todosLosViajes[index];
            seleccion = { viaje, index };

            // Rellenar modal
            modalConductor.textContent = viaje.conductor;
            modalFecha.textContent = viaje.fecha;
            modalHora.textContent = viaje.hora;
            modalRuta.textContent = viaje.ruta;

            // Puntos de recogida
            modalPuntoRecogida.innerHTML = "";
            if (Array.isArray(viaje.puntosRecogida)) {
                viaje.puntosRecogida.forEach(p => {
                    const opt = document.createElement("option");
                    opt.value = p;
                    opt.textContent = p;
                    modalPuntoRecogida.appendChild(opt);
                });
            }

            modal.style.display = "flex";
        }

        if (e.target.classList.contains('details-btn')) {
             const index = e.target.dataset.index;
             // Redirigir a la página de detalles pasando el índice original
             window.location.href = `informacion_viaje.html?viajeIndex=${index}`;
        }
    });

    // Mostrar/ocultar campo de monto
    modalMetodo.addEventListener("change", (e) => {
        const metodosConMonto = ["efectivo", "yape", "gasolina", "almuerzo"];
        if (metodosConMonto.includes(e.target.value)) {
            campoMonto.style.display = "block";
            if (e.target.value === "gasolina" || e.target.value === "almuerzo") {
                modalMonto.placeholder = "Ingrese el valor aproximado (S/)";
            } else {
                modalMonto.placeholder = "Ingrese el monto (S/)";
            }
        } else {
            campoMonto.style.display = "none";
            modalMonto.value = "";
        }
    });

    // Cancelar modal
    cancelarReservaBtn.addEventListener("click", () => {
        modal.style.display = "none";
        seleccion = null;
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            seleccion = null;
        }
    });

    // Guardar reserva
    guardarReservaBtn.addEventListener("click", () => {
        if (!seleccion) return;

        // Validación básica de monto si es requerido
        if (campoMonto.style.display === "block" && !modalMonto.value) {
            alert("Por favor ingrese el monto.");
            return;
        }

        // Desactivar botón para evitar doble envío
        guardarReservaBtn.disabled = true;
        guardarReservaBtn.textContent = "Procesando...";

        const pasajero = usuarios.find(u => u.id === usuarioActivo.id_usuario);
        const nombrePasajero = pasajero 
            ? `${pasajero.datosPersonales.nombres} ${pasajero.datosPersonales.apellidoPaterno}`
            : "Pasajero desconocido";

        const reservasExistentes = JSON.parse(localStorage.getItem("reservas")) || [];
        const nuevoIdReserva = reservasExistentes.length > 0 
            ? Math.max(...reservasExistentes.map(r => r.idReserva || 0)) + 1 
            : 1;

        const nuevaReserva = {
            idReserva: nuevoIdReserva,
            viajeIndex: seleccion.index, // Índice original
            idConductor: seleccion.viaje.idConductor,
            idPasajero: usuarioActivo.id_usuario,
            nombrePasajero: nombrePasajero,
            ruta: seleccion.viaje.ruta,
            fecha: seleccion.viaje.fecha,
            hora: seleccion.viaje.hora,
            puntoRecogida: modalPuntoRecogida.value,
            metodo: modalMetodo.value,
            monto: modalMonto.value || null,
            estado: "pendiente",
            fechaReserva: new Date().toISOString()
        };

        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        reservas.push(nuevaReserva);
        localStorage.setItem("reservas", JSON.stringify(reservas));

        modal.style.display = "none";
        alert("Reserva realizada exitosamente.");
        
        location.reload(); 
    });
});