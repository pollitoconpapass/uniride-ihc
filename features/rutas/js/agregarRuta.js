document.getElementById('addRouteForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const routeName = document.getElementById('routeName').value.trim();
    const direction = document.getElementById('direction').value.trim();
    const referencePlaces = document.getElementById('referencePlaces').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!routeName || !direction || !referencePlaces || !description) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const newRoute = {
        name: routeName,
        direction: direction,
        referencePlaces: referencePlaces,
        description: description,
        createdAt: new Date().toISOString()
    };

    let existingRoutes = JSON.parse(localStorage.getItem('userRoutes')) || [];

    existingRoutes.push(newRoute);

    localStorage.setItem('userRoutes', JSON.stringify(existingRoutes));
    globalThis.location.href = '../pages/rutas.html';
});