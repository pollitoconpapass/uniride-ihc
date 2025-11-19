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

})


function getQueryParam(param) {
    const urlParams = new URLSearchParams(globalThis.location.search);
    return urlParams.get(param);
}

function loadRouteDetails() {
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
    document.getElementById('direction').value = route.direction;
    document.getElementById('referencePlaces').value = route.referencePlaces;
    document.getElementById('description').value = route.description;

    // Editar
    document.getElementById('editButton').addEventListener('click', function() {
        globalThis.location.href = `../pages/editarRuta.html?index=${routeIndex}`;
    });

    // Borrar
    document.getElementById('deleteButton').addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'flex';
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        routes.splice(routeIndex, 1);
        localStorage.setItem('userRoutes', JSON.stringify(routes));
        globalThis.window.location.href = '../pages/rutas.html';
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', loadRouteDetails);