document.addEventListener("DOMContentLoaded", () => {
    console.log("JS de información del viaje cargado");

    // Cargar sidebar (nombre del conductor)
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

    // ✅ Cargar el viaje directamente desde localStorage (objeto completo)
    const viaje = JSON.parse(localStorage.getItem("viajeGuardado"));
    if (!viaje) {
        alert("No se pudo cargar la información del viaje.");
        window.location.href = "viajes_conductor.html";
        return;
    }

    // === Mostrar información general ===
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

    // === Modal de contacto: CERRAR ===
    const modalInfo = document.getElementById("modalInfoPasajero");
    if (modalInfo) {
        const btnCerrarInfo = document.getElementById("btnCerrarInfo");
        const cerrarX = document.querySelector("#modalInfoPasajero .close-button");

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

    // === Cancelar viaje ===
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

        let viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
        const index = viajes.findIndex(v => v.id === viaje.id);
        if (index !== -1) {
            viajes.splice(index, 1);
            localStorage.setItem("viajesGuardados", JSON.stringify(viajes));
        }
        localStorage.setItem("actualizarTablaViajes", "true");
        window.location.href = "viajes_conductor.html";
    });

    // === Comenzar viaje ===
    btnComenzar?.addEventListener("click", () => {
        viaje.estado = "En curso";

        // Guardar en localStorage
        let viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
        const index = viajes.findIndex(v => v.id === viaje.id);
        if (index !== -1) {
            viajes[index] = viaje;
            localStorage.setItem("viajesGuardados", JSON.stringify(viajes));
        }

        // Actualizar estadoViaje de pasajeros
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        reservas.forEach(r => {
            if (
                String(r.idConductor) === String(viaje.idConductor) &&
                r.fecha === viaje.fecha &&
                r.hora === viaje.hora &&
                r.ruta === viaje.ruta &&
                r.estado === "Aceptado"
            ) {
                r.estadoViaje = "Recogido";
            }
        });
        localStorage.setItem("reservas", JSON.stringify(reservas));

        actualizarBotones();
        cargarPasajerosConfirmados();
        alert("El viaje ha comenzado. Puede modificar el estado de cada pasajero.");
    });

    // === Finalizar viaje ===
    btnFinalizar?.addEventListener("click", () => {
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        const pasajerosAceptados = reservas.filter(r =>
            String(r.idConductor) === String(viaje.idConductor) &&
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

        // Eliminar de viajes guardados
        let viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
        const index = viajes.findIndex(v => v.id === viaje.id);
        if (index !== -1) {
            viajes.splice(index, 1);
            localStorage.setItem("viajesGuardados", JSON.stringify(viajes));
        }

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

    // === Cargar pasajeros confirmados ===
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

        // Listeners para botón "Información"
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