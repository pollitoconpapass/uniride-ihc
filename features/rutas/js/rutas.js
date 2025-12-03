// Google Analytics
document.addEventListener('DOMContentLoaded', function() {
    const buttonClasses = [
        { class: '.add-route-btn', label: 'add_route' }
    ];

    buttonClasses.forEach(function(btn) {
        document.querySelectorAll(btn.class).forEach(function(button) {
            button.addEventListener('click', function() {
                gtag('event', 'button_click', {
                    'event_category': 'engagement',
                    'event_label': btn.label
                });
            });
        });
    });
});

// Variables globales
let currentUser = null;
let currentSort = 'asc'; // 'asc' -> A-Z, 'desc' -> Z-A
let allRoutes = [];

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

    currentUser = usuario

    const dp = usuario.datosPersonales;
    document.getElementById("sidebarNombre").innerText = dp.nombres.split(" ")[0] || "";

})

function loadRoutes() {
    const routes = JSON.parse(localStorage.getItem('userRoutes')) || [];

    if (!currentUser) {
        console.warn("Usuario no iniciado aún");
        return;
    }

    allRoutes = routes.filter(r => r.idConductor === currentUser.id); // -> filtro para que solo vea las rutas que le corresponden
    filterAndDisplayRoutes();
}

function toggleSort() {
    currentSort = currentSort === 'asc' ? 'desc' : 'asc';
    document.getElementById('sortLabel').innerText = currentSort === 'asc' ? 'A-Z' : 'Z-A';
    filterAndDisplayRoutes();
}

function filterAndDisplayRoutes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const routesContainer = document.getElementById('routesContainer');

    // Filtro
    let filteredRoutes = allRoutes.filter(route => 
        route.name.toLowerCase().includes(searchTerm)
    );

    // Ordenar alfabeticamente
    filteredRoutes.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (currentSort === 'asc') {
            return nameA.localeCompare(nameB);
        } else {
            return nameB.localeCompare(nameA);
        }
    });

    // Mostrar rutas
    if (allRoutes.length === 0) {
        routesContainer.classList.add("centered");
        routesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🗺️❌</div>
                <h2 class="empty-state-title">¡No tienes rutas aún!</h2>
                <p class="empty-state-text">Empieza a gestionar tus viajes agregando tu primera ruta.</p>
                <button class="add-route-btn" onclick="window.location.href='../pages/agregarRuta.html'">Agregar Primera Ruta</button>
            </div>
        `;
    } else if (filteredRoutes.length === 0) {
        routesContainer.classList.add("centered");
        routesContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍❌</div>
                <h3>No se encontraron rutas</h3>
                <p>Intenta con otro término de búsqueda</p>
            </div>
        `;
    } else {
        routesContainer.classList.remove("centered");
        let routesHTML = '';
        for (const route of filteredRoutes) {
            const originalIndex = allRoutes.indexOf(route);
            const imageIndex = (originalIndex % 3) + 1; 
            const routeName = route.name;
            
            routesHTML += `
                <div class="route-card" onclick="viewRouteDetails(${originalIndex})">
                    <div class="route-card-title">${routeName}</div>
                    <img src="../../../assets/imgs/ruta-${imageIndex}-trazado.png" alt="Mapa de la Ruta" class="route-card-map">
                </div>
            `;
        }
        routesContainer.innerHTML = routesHTML;
    }
}

function viewRouteDetails(routeIndex) {
    globalThis.location.href = `../pages/consultarRuta.html?index=${routeIndex}`;
}

document.addEventListener('DOMContentLoaded', loadRoutes);