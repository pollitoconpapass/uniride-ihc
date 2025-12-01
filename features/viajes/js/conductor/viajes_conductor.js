let modal = document.getElementById("addTripModal");
let openBtn = document.getElementById("addTripBtn");
let cancelBtn = document.getElementById("cancelAddTrip");
let guardarBtn = document.getElementById("guardarForm");

console.log("entraste al js de viajes");

document.addEventListener("DOMContentLoaded", () => {

    loadRoutesIntoSelect();
    loadPlannedTrips();
    loadPastTrips();

    if (localStorage.getItem("actualizarTablaViajes") === "true") {
        loadPlannedTrips();
        loadPastTrips();
        localStorage.removeItem("actualizarTablaViajes");
    }

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
});

let fechaInicio = document.getElementById("fechaInicio");
let horaInicio = document.getElementById("horaInicio");
let rutaTomar = document.getElementById("rutaTomar");
let cantidadPasajeros = document.getElementById("cantidadPasajeros");

// abrir modal
openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

// cerrar modal
cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// guardar viaje
guardarBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const formError = document.getElementById("formError");
    formError.style.display = "none";

    const fecha = fechaInicio.value;
    const hora = horaInicio.value;

    if (!fecha || !hora) {
        formError.textContent = "Por favor, complete la fecha y la hora.";
        formError.style.display = "block";
        return;
    }

    // Fecha actual
    const now = new Date();
    const selectedDate = new Date(fecha + "T" + hora);

    // Mínimo permitido
    const minAllowed = new Date(now.getTime() + 5 * 60000); 

    if (selectedDate < minAllowed) {
        const formattedMin = minAllowed.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        formError.textContent = `La fecha y hora deben ser al menos 5 minutos después del momento actual. Mínimo permitido: ${formattedMin}`;
        formError.style.display = "block";
        return;
    }

    const pasajeros = parseInt(cantidadPasajeros.value, 10);
    if (isNaN(pasajeros) || pasajeros < 1 || pasajeros > 4) {
        formError.textContent = "La cantidad de pasajeros debe estar entre 1 y 4.";
        formError.style.display = "block";
        return;
    }

    const routes = JSON.parse(localStorage.getItem("userRoutes")) || [];
    const selectedRoute = routes.find(route => route.name === rutaTomar.value);

    if (!selectedRoute) {
        formError.textContent = "Por favor, seleccione una ruta válida.";
        formError.style.display = "block";
        return;
    }

    // Resto de tu lógica de guardado...
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const conductor = usuarios.find(u => u.id === usuarioActivo.id_usuario);

    const nombreConductor = conductor 
        ? `${conductor.datosPersonales.nombres} ${conductor.datosPersonales.apellidoPaterno}`
        : "Conductor desconocido";

    const viajesExistentes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const nuevoId = viajesExistentes.length > 0 
        ? Math.max(...viajesExistentes.map(v => v.id || 0)) + 1 
        : 1;

    const viaje = {
        id: nuevoId, 
        idConductor: usuarioActivo.id_usuario,
        universidadConductor: conductor.datosPersonales.universidad,
        fecha: fecha,
        hora: hora,
        ruta: rutaTomar.value,
        puntosRecogida: selectedRoute.referencePlaces || [],
        pasajeros: pasajeros,
        pasajerosActuales: 0,
        estado: "Pendiente",
        conductor: nombreConductor
    };

    let viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    viajes.push(viaje);
    localStorage.setItem("viajesGuardados", JSON.stringify(viajes));

    // Recargar
    window.location.href = "viajes_conductor.html";
});


function loadRoutesIntoSelect() {
    const select = document.getElementById("rutaTomar");
    const routes = JSON.parse(localStorage.getItem("userRoutes")) || [];

    select.innerHTML = `
        <option value="" disabled selected>Seleccione la ruta a tomar</option>
    `;

    routes.forEach(route => {
        let option = document.createElement("option");
        option.value = route.name;
        option.textContent = route.name;
        select.appendChild(option);
    });
}


function loadPlannedTrips() {
    const tbody = document.getElementById("viajes_planeados_total");
    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));

    const misViajes = viajes.filter(viaje => viaje.idConductor === usuarioActivo.id_usuario);

    if (misViajes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table-message">
                    No tienes viajes planeados por el momento.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";
    misViajes.forEach(viaje => {
        tbody.innerHTML += `
            <tr>
                <td>${viaje.fecha}</td>
                <td>${viaje.hora}</td>
                <td>${viaje.ruta}</td>
                <td>${viaje.pasajerosActuales || 0} / ${viaje.pasajeros}</td>
                <td><button class="table-btn" onclick="verSolicitudPorId(${viaje.id})">Ver</button></td>
                <td>${viaje.estado}</td>
                <td><button class="table-btn" onclick="verDetallePorId(${viaje.id})">Detalles</button></td>
            </tr>
        `;
    });
}


function loadPastTrips() {
    const tbody = document.getElementById("viajes_pasados_total");
    const viajesPasados = JSON.parse(localStorage.getItem("viajesPasados")) || [];
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));

    const misViajesPasados = viajesPasados.filter(v => v.idConductor === usuarioActivo.id_usuario);

    if (misViajesPasados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-table-message">
                    No tienes viajes pasados aún.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = "";
    misViajesPasados.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${v.fecha}</td>
                <td>${v.hora}</td>
                <td>${v.ruta}</td>
                <td>${v.pasajeros}</td>
            </tr>`;
    });
}


function verDetallePorId(viajeId) {
    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const viajeSeleccionado = viajes.find(v => v.id === viajeId);
    localStorage.setItem("viajeGuardado", JSON.stringify(viajeSeleccionado));
    window.location.href = "informacion_viaje_conductor.html";
}

function verSolicitudPorId(viajeId) {
    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const viajeSeleccionado = viajes.find(v => v.id === viajeId);
    if (viajeSeleccionado) {
        localStorage.setItem("viajeSeleccionadoParaSolicitudes", JSON.stringify(viajeSeleccionado));
        window.location.href = "solicitudes_pasajeros.html";
    }
}

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});
