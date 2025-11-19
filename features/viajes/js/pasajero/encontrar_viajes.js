document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("pasajeros-confirmados");

    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];

    // Renderizar filas
    if (viajes.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6">No hay viajes publicados por el conductor</td></tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    console.log("Viajes guardados:", viajes);


    viajes.forEach((viaje, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${viaje.conductor}</td>
            <td>${viaje.puntosRecogida}</td>
            <td>${viaje.fecha}</td>
            <td>${viaje.hora}</td>

            <td>
                <button class="reserve-btn" data-index="${index}">
                    Reservar
                </button>
            </td>

            <td>
                <button class="details-btn" data-index="${index}">
                    Ver detalles
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

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

                    

                        document.querySelectorAll(".reserve-btn").forEach(btn => {

                            btn.addEventListener("click", () => {

                                const index = btn.dataset.index;

                                const viaje = viajes[index];

                                seleccion = { viaje, index }; // Guardar el viaje y su índice

                    

                                console.log("🔥 CLICK EN RESERVAR");

                                console.log("➡️ Selección:", seleccion);

                    

                                // --- Rellenar modal ---

                                modalConductor.textContent = viaje.conductor;

                                modalFecha.textContent = viaje.fecha;

                                modalHora.textContent = viaje.hora;

                                modalRuta.textContent = viaje.ruta;

                    

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

                            });

                        });

                    

                        document.querySelectorAll(".details-btn").forEach(btn => {

                            btn.addEventListener("click", () => {

                                const index = btn.dataset.index;

                                window.location.href = `informacion_viaje.html?viajeIndex=${index}`;

                            });

                        });

                    

                    

                    

                        // Mostrar u ocultar campo monto

                        modalMetodo.addEventListener("change", (e) => {

                            if (e.target.value === "efectivo" || e.target.value === "yape") {

                                campoMonto.style.display = "block";

                            } else {

                                campoMonto.style.display = "none";

                                modalMonto.value = "";

                            }

                        });

                    

                        // Cancelar modal

                        cancelarReservaBtn.addEventListener("click", () => {

                            modal.style.display = "none";

                        });

                    

                        // Cerrar modal clickeando fondo

                        window.addEventListener("click", (e) => {

                            if (e.target === modal) {

                                modal.style.display = "none";

                            }

                        });

                    

                        guardarReservaBtn.addEventListener("click", () => {

                            if (!seleccion) return; // No hay nada seleccionado

                    

                            const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));

                            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

                    

                            // Buscar datos del pasajero

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

                                viajeIndex: seleccion.index, // Usar el índice del viaje

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

                        });





});
