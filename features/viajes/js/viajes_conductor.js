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

    const viaje = {
        fecha: fechaInicio.value,
        hora: horaInicio.value,
        ruta: rutaTomar.value,
        pasajeros: cantidadPasajeros.value,
        estado: "Pendiente"
    };

    let viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    viajes.push(viaje);

    localStorage.setItem("viajesGuardados", JSON.stringify(viajes));

    // recargar lista
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

    if (viajes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table-message">
                    No tienes viajes planeados por el momento.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    viajes.forEach((viaje, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${viaje.fecha}</td>
                <td>${viaje.hora}</td>
                <td>${viaje.ruta}</td>
                <td>0 / ${viaje.pasajeros}</td>
                <td><button onclick="verSolicitud(${index})">Ver</button></td>
                <td>${viaje.estado}</td>
                <td><button onclick="verDetalle(${index})">Detalles</button></td>
            </tr>
        `;
    });
}

function verDetalle(index) {
    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const viajeSeleccionado = viajes[index];

    localStorage.setItem("viajeGuardado", JSON.stringify(viajeSeleccionado));
    localStorage.setItem("viajeIndex", index);

    window.location.href = "informacion_viaje_conductor.html";
}


function loadPastTrips() {
    const tbody = document.getElementById("viajes_pasados_total");
    const viajesPasados = JSON.parse(localStorage.getItem("viajesPasados")) || [];

    if (!tbody) return; // por si tu html no tiene esa tabla

    if (viajesPasados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-table-message">
                    No tienes viajes pasados aún.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = "";

    viajesPasados.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${v.fecha}</td>
                <td>${v.hora}</td>
                <td>${v.ruta}</td>
                <td>${v.pasajeros}</td>
            </tr>`;
    });
}


function verSolicitud(index) {
    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const viajeSeleccionado = viajes[index];

    localStorage.setItem("viajeSeleccionadoParaSolicitudes", JSON.stringify(viajeSeleccionado));

    window.location.href = "solicitudes_pasajeros.html";
}

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});
