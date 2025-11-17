function getQueryParam(param) {
    const urlParams = new URLSearchParams(globalThis.location.search);
    return urlParams.get(param);
}

function loadRouteDetailsForEdit() {
    const routeIndex = Number.parseInt(getQueryParam('index'), 10);

    if (Number.isNaN(routeIndex)) {
        alert('Índice de ruta no válido.');
        globalThis.location.href = '../pages/rutas.html';
        return;
    }

    const routes = JSON.parse(localStorage.getItem('userRoutes')) || [];

    if (routeIndex >= routes.length || routeIndex < 0) {
        alert('Ruta no encontrada.');
        globalThis.location.href = '../pages/rutas.html';
        return;
    }

    const route = routes[routeIndex];

    document.getElementById('routeNameDisplay').textContent = route.name;
    document.getElementById('routeName').value = route.name; 
    document.getElementById('direction').value = route.direction;
    document.getElementById('referencePlaces').value = route.referencePlaces;
    document.getElementById('description').value = route.description;

    document.getElementById('editRouteForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const updatedName = document.getElementById('routeName').value.trim();
        const updatedDirection = document.getElementById('direction').value.trim();
        const updatedReferencePlaces = document.getElementById('referencePlaces').value.trim();
        const updatedDescription = document.getElementById('description').value.trim();

        if (!updatedName || !updatedDirection || !updatedReferencePlaces || !updatedDescription) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        routes[routeIndex] = {
            ...route,
            name: updatedName,
            direction: updatedDirection,
            referencePlaces: updatedReferencePlaces,
            description: updatedDescription
        };

        localStorage.setItem('userRoutes', JSON.stringify(routes));
        globalThis.location.href = '../pages/rutas.html';
    });
}

document.addEventListener('DOMContentLoaded', loadRouteDetailsForEdit);