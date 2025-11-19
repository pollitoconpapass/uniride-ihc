document.addEventListener("DOMContentLoaded", () => {
    console.log("JS de información del viaje cargado");

    let viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const index = parseInt(localStorage.getItem("viajeIndex"));
    let viaje = viajes[index];

    // Cargar información general
    if (viaje) {
        document.querySelector("#infoGeneral p:nth-of-type(1)").innerHTML =
            `<strong>Fecha:</strong> ${viaje.fecha}`;

        document.querySelector("#infoGeneral p:nth-of-type(2)").innerHTML =
            `<strong>Hora de inicio:</strong> ${viaje.hora}`;

        const puntosRecogida = Array.isArray(viaje.puntosRecogida)
            ? viaje.puntosRecogida.join(", ")
            : viaje.puntosRecogida || "No especificado";

        document.querySelector("#infoGeneral p:nth-of-type(3)").innerHTML =
            `<strong>Puntos de recogida:</strong> ${puntosRecogida}`;

        document.querySelector("#infoGeneral p:nth-of-type(4)").innerHTML =
            `<strong>Ruta:</strong> ${viaje.ruta}`;
    }

    // === Modal de contacto: CERRAR ===
    const modalInfo = document.getElementById("modalInfoPasajero");
    if (modalInfo) {
        const btnCerrarInfo = document.getElementById("btnCerrarInfo");
        const cerrarX = document.querySelector("#modalInfoPasajero .close");

        if (btnCerrarInfo) {
            btnCerrarInfo.addEventListener("click", () => {
                modalInfo.style.display = "none";
            });
        }
        if (cerrarX) {
            cerrarX.addEventListener("click", () => {
                modalInfo.style.display = "none";
            });
        }

        // Opcional: cerrar al hacer clic fuera del contenido
        window.addEventListener("click", (e) => {
            if (e.target === modalInfo) {
                modalInfo.style.display = "none";
            }
        });
    }

    const btnCancelar = document.getElementById("cancelarViaje");
    const btnComenzar = document.getElementById("comenzarViaje");
    const btnFinalizar = document.getElementById("finalizarViaje");

    function actualizarBotones() {
        if (viaje.estado === "Pendiente") {
            btnCancelar.style.display = "inline-block";
            btnComenzar.style.display = "inline-block";
            btnFinalizar.style.display = "none";
        } else if (viaje.estado === "En curso") {
            btnCancelar.style.display = "none";
            btnComenzar.style.display = "none";
            btnFinalizar.style.display = "inline-block";
        } else {
            btnCancelar.style.display = "none";
            btnComenzar.style.display = "none";
            btnFinalizar.style.display = "none";
        }
    }

    actualizarBotones();

    const modalCancelarViaje = document.getElementById("modalCancelarViaje");
    const btnCerrarCancelarViaje = document.getElementById("btnCerrarCancelarViaje");
    const formCancelarViaje = document.getElementById("formCancelarViaje");

    btnCancelar?.addEventListener("click", () => {
        modalCancelarViaje.style.display = "flex";
    });

    btnCerrarCancelarViaje?.addEventListener("click", () => {
        modalCancelarViaje.style.display = "none";
    });

    formCancelarViaje?.addEventListener("submit", (e) => {
        e.preventDefault();
        const motivo = document.getElementById("motivoCancelacion").value.trim();
        if (motivo === "") return alert("Ingrese un motivo");

        viajes.splice(index, 1);
        localStorage.setItem("viajesGuardados", JSON.stringify(viajes));
        localStorage.setItem("actualizarTablaViajes", "true");
        window.location.href = "viajes_conductor.html";
    });

    btnComenzar?.addEventListener("click", () => {
        viaje.estado = "En curso";
        viajes[index] = viaje;
        localStorage.setItem("viajesGuardados", JSON.stringify(viajes));
        localStorage.setItem("actualizarTablaViajes", "true");

        // Inicializar estadoViaje de pasajeros si es necesario
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        reservas.forEach(r => {
            if (
                r.idConductor === viaje.idConductor &&
                r.fecha === viaje.fecha &&
                r.hora === viaje.hora &&
                r.ruta === viaje.ruta &&
                r.estado === "Aceptado" &&
                !r.estadoViaje
            ) {
                r.estadoViaje = "Recogido";
            }
        });
        localStorage.setItem("reservas", JSON.stringify(reservas));

        actualizarBotones();
        cargarPasajerosConfirmados();
        alert("El viaje ha comenzado. Ahora puedes marcar el estado de cada pasajero.");
    });

    btnFinalizar?.addEventListener("click", () => {
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        const pasajerosAceptados = reservas.filter(r =>
            r.idConductor === viaje.idConductor &&
            r.fecha === viaje.fecha &&
            r.hora === viaje.hora &&
            r.ruta === viaje.ruta &&
            r.estado === "Aceptado"
        );

        if (pasajerosAceptados.length > 0) {
            const todosListos = pasajerosAceptados.every(p =>
                p.estadoViaje === "Recogido" || p.estadoViaje === "No llegó"
            );

            if (!todosListos) {
                alert("No puedes finalizar el viaje hasta marcar el estado de todos los pasajeros.");
                return;
            }
        }

        // Mover a viajes pasados
        let pasados = JSON.parse(localStorage.getItem("viajesPasados")) || [];
        pasados.push(viaje);
        localStorage.setItem("viajesPasados", JSON.stringify(pasados));

        viajes.splice(index, 1);
        localStorage.setItem("viajesGuardados", JSON.stringify(viajes));
        localStorage.setItem("actualizarTablaViajes", "true");

        // Mostrar modal de agradecimiento
        const modalBienvenida = document.getElementById("modalBienvenida");
        if (modalBienvenida) {
            modalBienvenida.style.display = "flex";
            document.getElementById("btnCalificar")?.addEventListener("click", () => {
                window.location.href = "viajes_conductor.html";
            });
        } else {
            window.location.href = "viajes_conductor.html";
        }
    });

    // ==========================
    //    CARGAR PASAJEROS
    // ==========================
    function cargarPasajerosConfirmados() {
        const tbody = document.getElementById("pasajeros-confirmados");
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

        const pasajerosDeEsteViaje = reservas.filter(r =>
            r.idConductor === viaje.idConductor &&
            r.fecha === viaje.fecha &&
            r.hora === viaje.hora &&
            r.ruta === viaje.ruta &&
            r.estado === "Aceptado"
        );

        if (pasajerosDeEsteViaje.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-table-message">
                        No tienes pasajeros confirmados por el momento.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";
        pasajerosDeEsteViaje.forEach(p => {
            let celdaEstado;

            if (viaje.estado === "Pendiente") {
                celdaEstado = "Por llegar";
            } else if (viaje.estado === "En curso") {
                const estadoActual = p.estadoViaje || "Recogido";
                celdaEstado = `
                    <select class="estado-viaje-select" data-reserva-id="${p.idReserva}">
                        <option value="Recogido" ${estadoActual === "Recogido" ? "selected" : ""}>Recogido</option>
                        <option value="No llegó" ${estadoActual === "No llegó" ? "selected" : ""}>No llegó</option>
                    </select>
                `;
            } else {
                celdaEstado = p.estadoViaje || "—";
            }

            tbody.innerHTML += `
                <tr>
                    <td>${p.nombrePasajero}</td>
                    <td>${p.puntoRecogida}</td>
                    <td>${p.metodo}</td>
                    <td>${celdaEstado}</td>
                    <td>
                        <button class="table-btn btn-info-pasajero" data-id-pasajero="${p.idPasajero}">
                            Información
                        </button>
                    </td>
                </tr>
            `;
        });

        // Listeners para estado (solo en curso)
        if (viaje.estado === "En curso") {
            document.querySelectorAll(".estado-viaje-select").forEach(select => {
                select.addEventListener("change", function () {
                    const reservaId = this.dataset.reservaId;
                    const nuevoEstado = this.value;

                    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
                    const reserva = reservas.find(r => r.idReserva == reservaId);
                    if (reserva) {
                        reserva.estadoViaje = nuevoEstado;
                        localStorage.setItem("reservas", JSON.stringify(reservas));
                    }
                });
            });
        }

        // === Listeners para botón "Información" ===
        document.querySelectorAll(".btn-info-pasajero").forEach(btn => {
            btn.addEventListener("click", () => {
                const idPasajero = btn.dataset.idPasajero;
                const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
                const pasajero = usuarios.find(u => u.id === idPasajero);

                const modal = document.getElementById("modalInfoPasajero");
                const mensaje = document.getElementById("mensajeContacto");

                if (modal && mensaje) {
                    if (pasajero) {
                        const nombre = `${pasajero.datosPersonales.nombres} ${pasajero.datosPersonales.apellidoPaterno}`;
                        const telefono = pasajero.datosPersonales.numeroCelular || "No disponible";
                        mensaje.textContent = `Si deseas comunicarte con ${nombre}, llama al número: ${telefono}`;
                    } else {
                        mensaje.textContent = "Información del pasajero no disponible.";
                    }
                    modal.style.display = "flex";
                }
            });
        });
    }

    cargarPasajerosConfirmados();
});