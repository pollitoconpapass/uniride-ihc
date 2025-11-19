function getQueryParam(param) {
    const urlParams = new URLSearchParams(globalThis.location.search);
    return urlParams.get(param);
}

const referenceInputEdit = document.getElementById('newReferencePlaceEdit');
const addButtonEdit = document.getElementById('addReferenceBtnEdit');
const listContainerEdit = document.getElementById('referencePlacesListEdit');
const hiddenInputEdit = document.getElementById('referencePlacesEdit');

let referencePlacesArrayEdit = [];

function addReferencePlaceEdit() {
    const place = referenceInputEdit.value.trim();
    if (place) {
        if (!referencePlacesArrayEdit.includes(place)) {
            referencePlacesArrayEdit.push(place);
            hiddenInputEdit.value = JSON.stringify(referencePlacesArrayEdit);

            document.getElementById("referencePlacesListEdit").classList.add("has-items");  

            const listItem = document.createElement('div');
            listItem.className = 'reference-place-item';
            listItem.innerHTML = `
                <span class="reference-place-text">${place}</span>
                <button type="button" class="remove-btn" onclick="removeReferencePlaceEdit(this, '${place}')">x</button>
            `;
            listContainerEdit.appendChild(listItem);

            referenceInputEdit.value = '';
            referenceInputEdit.focus();
        } else {
            alert('Este lugar de referencia ya ha sido agregado.');
        }
    }
}

function removeReferencePlaceEdit(button, placeToRemove) {
    referencePlacesArrayEdit = referencePlacesArrayEdit.filter(place => place !== placeToRemove);
    hiddenInputEdit.value = JSON.stringify(referencePlacesArrayEdit);
    button.parentElement.remove();

    if (referencePlacesArrayEdit.length === 0) {
        document.getElementById("referencePlacesListEdit").classList.remove("has-items");
    }
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
    document.getElementById('description').value = route.description;


    referencePlacesArrayEdit = Array.isArray(route.referencePlaces) ? [...route.referencePlaces] : [];
    hiddenInputEdit.value = JSON.stringify(referencePlacesArrayEdit);
    listContainerEdit.innerHTML = ''; 

    if (referencePlacesArrayEdit.length > 0) {
        document.getElementById("referencePlacesListEdit").classList.add("has-items");
    }

    referencePlacesArrayEdit.forEach(place => {
        const listItem = document.createElement('div');
        listItem.className = 'reference-place-item';
        listItem.innerHTML = `
            <span class="reference-place-text">${place}</span>
            <button type="button" class="remove-btn" onclick="removeReferencePlaceEdit(this, '${place}')">x</button>
        `;
        listContainerEdit.appendChild(listItem);
    });

    document.getElementById('editRouteForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const updatedName = document.getElementById('routeName').value.trim();
        const updatedDirection = document.getElementById('direction').value.trim();

        let updatedReferencePlacesArray = [];
        try {
            const referencePlacesString = hiddenInputEdit.value;
            if (referencePlacesString) {
                updatedReferencePlacesArray = JSON.parse(referencePlacesString);
            }
        } catch (e) {
            console.error("Error al parsear referencePlaces en edición:", e);
            alert('Hubo un error al procesar los lugares de referencia.');
            return;
        }
        const updatedDescription = document.getElementById('description').value.trim();

        if (!updatedName || !updatedDirection || updatedReferencePlacesArray.length === 0 || !updatedDescription) {
            alert('Por favor, completa todos los campos. Debes tener al menos un lugar de referencia.');
            return;
        }

        routes[routeIndex] = {
            ...route, 
            name: updatedName,
            direction: updatedDirection,
            referencePlaces: updatedReferencePlacesArray,
            description: updatedDescription
        };

        localStorage.setItem('userRoutes', JSON.stringify(routes));
        globalThis.location.href = '../pages/rutas.html';
    });
}

addButtonEdit.addEventListener('click', addReferencePlaceEdit);
referenceInputEdit.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addReferencePlaceEdit();
    }
});

document.addEventListener('DOMContentLoaded', loadRouteDetailsForEdit);