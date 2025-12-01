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

    const tbody = document.getElementById("pasajeros-confirmados");


    const todosLosViajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const viajes = todosLosViajes.filter(viaje => 
        viaje.universidadConductor === universidadPasajero &&
        viaje.estado === "Pendiente"
    );

    if (viajes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table-message">
                    No hay viajes disponibles de tu universidad.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    viajes.forEach((viaje, index) => {
        const row = document.createElement("tr");

        const puntosTexto = Array.isArray(viaje.puntosRecogida)
            ? viaje.puntosRecogida.join(", ")
            : viaje.puntosRecogida || "—";

        row.innerHTML = `
            <td>${viaje.conductor}</td>
            <td>${puntosTexto}</td>
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
        });
    });

    document.querySelectorAll(".details-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            alert(`Detalles del viaje:\nConductor: ${viajes[index].conductor}\nRuta: ${viajes[index].ruta}`);
        });
    });

    // Mostrar/ocultar campo de monto
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

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Guardar reserva
    guardarReservaBtn.addEventListener("click", () => {
        if (!seleccion) return;

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
            viajeIndex: seleccion.index, 
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