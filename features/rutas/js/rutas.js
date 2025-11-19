function loadRoutes() {
    const routesContainer = document.getElementById('routesContainer');
    const routes = JSON.parse(localStorage.getItem('userRoutes')) || [];

    if (routes.length === 0) {
        routesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🗺️❌</div>
                <h2 class="empty-state-title">¡No tienes rutas aún!</h2>
                <p class="empty-state-text">Empieza a gestionar tus viajes agregando tu primera ruta.</p>
                <button class="add-route-btn" onclick="window.location.href='../pages/agregarRuta.html'">Agregar Primera Ruta</button>
            </div>
        `;
    } else {
        let routesHTML = '';
        let i = 1;
        for (const [index, route] of routes.entries()) {
            const routeName = `${route.name}`;
            routesHTML += `
                <div class="route-card" onclick="viewRouteDetails(${index})">
                    <div class="route-card-title">${routeName}</div>
                    <img src="../../../assets/imgs/ruta-${i}-trazado.png" alt="Mapa de la Ruta" class="route-card-map">
                </div>
            `;
            i+=1;
        }
        routesContainer.innerHTML = routesHTML;
    }
}

function viewRouteDetails(routeIndex) {
    globalThis.location.href = `../pages/consultarRuta.html?index=${routeIndex}`;
}

document.addEventListener('DOMContentLoaded', loadRoutes);