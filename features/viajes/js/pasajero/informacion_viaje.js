document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const viajeIndex = params.get("viajeIndex");

    if (viajeIndex === null) {
        document.querySelector('.main-content').innerHTML = "<h1>Error: No se especificó un viaje.</h1>";
        return;
    }

    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const viaje = viajes[viajeIndex];

    if (!viaje) {
        document.querySelector('.main-content').innerHTML = "<h1>Error: Viaje no encontrado.</h1>";
        return;
    }

    // Poblar los elementos de la página con la información del viaje
    document.getElementById("trip-route-name").textContent = viaje.ruta || "Información del Viaje";
    document.getElementById("driver-name").textContent = viaje.conductor || "Conductor no especificado";
    document.getElementById("trip-time").textContent = viaje.hora || "No especificada";
    document.getElementById("trip-date").textContent = viaje.fecha || "No especificada";

    // Poblar los puntos de recogida
    const pickupCard = document.querySelector(".pickup-card");
    if (viaje.puntosRecogida && Array.isArray(viaje.puntosRecogida)) {
        const list = document.createElement("ul");
        list.className = "pickup-list";
        viaje.puntosRecogida.forEach(punto => {
            const item = document.createElement("li");
            item.textContent = punto;
            list.appendChild(item);
        });
        pickupCard.appendChild(list);
    } else {
        pickupCard.innerHTML += "<p>No hay puntos de recogida especificados.</p>";
    }

    // Lógica para los botones de acción (ej. reservar, conversar)
    const reserveBtn = document.querySelector(".cta-group .btn-primary");
    if (reserveBtn) {
        // La reserva se maneja en la página anterior, este botón podría llevar a una confirmación
        // o simplemente ser un placeholder. Por ahora, lo dejaremos como está.
        // Opcional: Ocultarlo si la lógica de reserva no aplica aquí.
        reserveBtn.style.display = 'none';
    }
    
    const chatBtn = document.querySelector(".cta-group .btn-secondary");
    if (chatBtn) {
        // Aquí se podría añadir la lógica para iniciar un chat
        chatBtn.addEventListener("click", (e) => {
            e.preventDefault();
            alert("Funcionalidad de chat no implementada.");
        });
    }
});
