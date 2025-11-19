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
