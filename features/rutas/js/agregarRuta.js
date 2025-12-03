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
    const universidad = dp.universidad;
    
    document.getElementById("sidebarNombre").innerText = dp.nombres.split(" ")[0] || "";
    document.getElementById("universidad").textContent = universidad || "No especificada";
})

function sanitizeInput(input) {
    return input.replaceAll(/[<>]/g, '');
}

function isOnlyNumbers(str) {
    return /^\d+$/.test(str.trim());
}

function isOnlySpecialChars(str) {
    return /^[^a-zA-Z0-9\s]+$/.test(str.trim());
}

function hasMinimumText(str, minWords = 2) {
    const words = str.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length >= minWords;
}

function isValidAddress(address) {
    const trimmed = address.trim();
    
    if (trimmed.length < 5) {
        return { valid: false, message: 'La dirección debe tener al menos 5 caracteres.' };
    }
    
    if (isOnlyNumbers(trimmed)) {
        return { valid: false, message: 'La dirección no puede contener solo números.' };
    }
    
    if (isOnlySpecialChars(trimmed)) {
        return { valid: false, message: 'La dirección no puede contener solo caracteres especiales.' };
    }
    
    const hasLetters = /[a-zA-Z]/.test(trimmed);
    if (!hasLetters) {
        return { valid: false, message: 'La dirección debe contener letras.' };
    }
    
    return { valid: true };
}

function isValidRouteName(name) {
    const trimmed = name.trim();
    
    if (trimmed.length < 3) {
        return { valid: false, message: 'El nombre de la ruta debe tener al menos 3 caracteres.' };
    }
    
    if (trimmed.length > 50) {
        return { valid: false, message: 'El nombre de la ruta no puede exceder 50 caracteres.' };
    }
    
    if (isOnlyNumbers(trimmed)) {
        return { valid: false, message: 'El nombre de la ruta no puede ser solo números.' };
    }
    
    if (isOnlySpecialChars(trimmed)) {
        return { valid: false, message: 'El nombre de la ruta no puede contener solo caracteres especiales.' };
    }
    
    return { valid: true };
}

function isValidDescription(description) {
    const trimmed = description.trim();
    
    if (trimmed.length < 10) {
        return { valid: false, message: 'La descripción debe tener al menos 10 caracteres.' };
    }
    
    if (trimmed.length > 500) {
        return { valid: false, message: 'La descripción no puede exceder 500 caracteres.' };
    }
    
    if (isOnlyNumbers(trimmed)) {
        return { valid: false, message: 'La descripción no puede ser solo números.' };
    }
    
    if (!hasMinimumText(trimmed, 3)) {
        return { valid: false, message: 'La descripción debe contener al menos 3 palabras.' };
    }
    
    return { valid: true };
}

function isValidReferencePlace(place) {
    const trimmed = place.trim();
    
    if (trimmed.length < 3) {
        return { valid: false, message: 'El lugar de referencia debe tener al menos 3 caracteres.' };
    }
    
    if (trimmed.length > 100) {
        return { valid: false, message: 'El lugar de referencia no puede exceder 100 caracteres.' };
    }
    
    if (isOnlyNumbers(trimmed)) {
        return { valid: false, message: 'El lugar de referencia no puede ser solo números.' };
    }
    
    return { valid: true };
}


const referenceInput = document.getElementById('newReferencePlace');
const addButton = document.getElementById('addReferenceBtn');
const listContainer = document.getElementById('referencePlacesList');
const hiddenInput = document.getElementById('referencePlaces');

let referencePlacesArray = [];

function addReferencePlace() {
    const place = sanitizeInput(referenceInput.value.trim());
    
    if (!place) {
        alert('Por favor, ingresa un lugar de referencia.');
        return;
    }
    
    const validation = isValidReferencePlace(place);
    if (!validation.valid) {
        alert(validation.message);
        return;
    }
    
    if (referencePlacesArray.includes(place)) {
        alert('Este lugar de referencia ya ha sido agregado.');
        return;
    }
    
    if (referencePlacesArray.length >= 10) {
        alert('Has alcanzado el límite máximo de 10 lugares de referencia.');
        return;
    }
    
    referencePlacesArray.push(place);
    hiddenInput.value = JSON.stringify(referencePlacesArray);
    document.getElementById("referencePlacesList").classList.add("has-items");

    const listItem = document.createElement('div');
    listItem.className = 'reference-place-item';
    listItem.innerHTML = `
        <span class="reference-place-text">${place}</span>
        <button type="button" class="remove-btn" onclick="removeReferencePlace(this, '${place.replaceAll(/'/g, "\\'")}')">x</button>
    `;
    listContainer.appendChild(listItem);

    referenceInput.value = '';
    referenceInput.focus();
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
        e.preventDefault();
        addReferencePlace();
    }
});


document.getElementById('addRouteForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const routeName = sanitizeInput(document.getElementById('routeName').value.trim());
    const direction = sanitizeInput(document.getElementById('direction').value.trim());
    const description = sanitizeInput(document.getElementById('description').value.trim());

    // Validar nombre de ruta
    const nameValidation = isValidRouteName(routeName);
    if (!nameValidation.valid) {
        alert(nameValidation.message);
        document.getElementById('routeName').focus();
        return;
    }

    // Validar dirección
    const addressValidation = isValidAddress(direction);
    if (!addressValidation.valid) {
        alert(addressValidation.message);
        document.getElementById('direction').focus();
        return;
    }

    // Validar lugares de referencia
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

    if (referencePlacesArray.length === 0) {
        alert('Debes agregar al menos un lugar de referencia.');
        document.getElementById('newReferencePlace').focus();
        return;
    }

    // Validar descripción
    const descValidation = isValidDescription(description);
    if (!descValidation.valid) {
        alert(descValidation.message);
        document.getElementById('description').focus();
        return;
    }

    // Verificar duplicados de ruta
    const existingRoutes = JSON.parse(localStorage.getItem('userRoutes')) || [];
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    
    const isDuplicate = existingRoutes.some(route => 
        route.idConductor === usuarioActivo.id_usuario && 
        route.name.toLowerCase() === routeName.toLowerCase()
    );
    
    if (isDuplicate) {
        alert('Ya tienes una ruta con este nombre. Por favor, elige un nombre diferente.');
        document.getElementById('routeName').focus();
        return;
    }

    const newRoute = {
        idConductor: usuarioActivo.id_usuario,   
        name: routeName,
        direction: direction,
        referencePlaces: referencePlacesArray,
        description: description,
        createdAt: new Date().toISOString()
    };

    existingRoutes.push(newRoute);
    localStorage.setItem('userRoutes', JSON.stringify(existingRoutes));
    
    globalThis.location.href = '../pages/rutas.html'; 
});