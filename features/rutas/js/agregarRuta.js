document.getElementById('addRouteForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const routeName = document.getElementById('routeName').value.trim();
    const direction = document.getElementById('direction').value.trim();

    const referencePlacesString = document.getElementById('referencePlaces').value;
    let referencePlacesArray = [];
    try {
        if (referencePlacesString) {
            referencePlacesArray = JSON.parse(referencePlacesString);
        }
    } catch (e) {
        console.error("Error al parsear referencePlaces:", e);
        alert('Hubo un error al procesar los lugares de referencia.');
        return;
    }

    const description = document.getElementById('description').value.trim();

    if (!routeName || !direction || referencePlacesArray.length === 0 || !description) {
        alert('Por favor, completa todos los campos. Debes agregar al menos un lugar de referencia.');
        return;
    }

    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));

const newRoute = {
    idConductor: usuarioActivo.id_usuario,   
    name: routeName,
    direction: direction,
    referencePlaces: referencePlacesArray,
    description: description,
    createdAt: new Date().toISOString()
};


    let existingRoutes = JSON.parse(localStorage.getItem('userRoutes')) || [];
    existingRoutes.push(newRoute);

    localStorage.setItem('userRoutes', JSON.stringify(existingRoutes));
    globalThis.location.href = '../pages/rutas.html'; 
});


const referenceInput = document.getElementById('newReferencePlace');
const addButton = document.getElementById('addReferenceBtn');
const listContainer = document.getElementById('referencePlacesList');
const hiddenInput = document.getElementById('referencePlaces');


let referencePlacesArray = [];

function addReferencePlace() {
    const place = referenceInput.value.trim();
    if (place) {
        referencePlacesArray.push(place);
        hiddenInput.value = JSON.stringify(referencePlacesArray);
        document.getElementById("referencePlacesList").classList.add("has-items");

        const listItem = document.createElement('div');
        listItem.className = 'reference-place-item';
        listItem.innerHTML = `
            <span class="reference-place-text">${place}</span>
            <button type="button" class="remove-btn" onclick="removeReferencePlace(this, '${place}')">x</button>
        `;
        listContainer.appendChild(listItem);

        referenceInput.value = '';
        referenceInput.focus();
    }
}

function removeReferencePlace(button, placeToRemove) {
    referencePlacesArray = referencePlacesArray.filter(place => place !== placeToRemove);
    hiddenInput.value = JSON.stringify(referencePlacesArray);
    button.parentElement.remove();

    if (referencePlacesArray.length === 0) {
        document.getElementById("referencePlacesList").classList.remove("has-items");
    }
}


addButton.addEventListener('click', addReferencePlace);
referenceInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addReferencePlace();
    }
});