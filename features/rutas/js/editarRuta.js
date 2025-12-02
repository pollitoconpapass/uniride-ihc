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

// VALIDACIONES
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

function getQueryParam(param) {
    const urlParams = new URLSearchParams(globalThis.location.search);
    return urlParams.get(param);
}

// MANEJO DE DATOS
const referenceInputEdit = document.getElementById('newReferencePlaceEdit');
const addButtonEdit = document.getElementById('addReferenceBtnEdit');
const listContainerEdit = document.getElementById('referencePlacesListEdit');
const hiddenInputEdit = document.getElementById('referencePlacesEdit');

let referencePlacesArrayEdit = [];

function addReferencePlaceEdit() {
    const place = sanitizeInput(referenceInputEdit.value.trim());
    
    if (!place) {
        alert('Por favor, ingresa un lugar de referencia.');
        return;
    }
    
    const validation = isValidReferencePlace(place);
    if (!validation.valid) {
        alert(validation.message);
        return;
    }
    
    if (referencePlacesArrayEdit.includes(place)) {
        alert('Este lugar de referencia ya ha sido agregado.');
        return;
    }
    
    if (referencePlacesArrayEdit.length >= 10) {
        alert('Has alcanzado el límite máximo de 10 lugares de referencia.');
        return;
    }
    
    referencePlacesArrayEdit.push(place);
    hiddenInputEdit.value = JSON.stringify(referencePlacesArrayEdit);

    document.getElementById("referencePlacesListEdit").classList.add("has-items");  

    const listItem = document.createElement('div');
    listItem.className = 'reference-place-item';
    listItem.innerHTML = `
        <span class="reference-place-text">${place}</span>
        <button type="button" class="remove-btn" onclick="removeReferencePlaceEdit(this, '${place.replaceAll(/'/g, "\\'")}')">x</button>
    `;
    listContainerEdit.appendChild(listItem);

    referenceInputEdit.value = '';
    referenceInputEdit.focus();
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
            <button type="button" class="remove-btn" onclick="removeReferencePlaceEdit(this, '${place.replace(/'/g, "\\'")}')">x</button>
        `;
        listContainerEdit.appendChild(listItem);
    });

    // ===== MANEJO DEL FORMULARIO DE EDICIÓN CON VALIDACIONES =====
    
    document.getElementById('editRouteForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const updatedName = sanitizeInput(document.getElementById('routeName').value.trim());
        const updatedDirection = sanitizeInput(document.getElementById('direction').value.trim());
        const updatedDescription = sanitizeInput(document.getElementById('description').value.trim());

        // Validar nombre de ruta
        const nameValidation = isValidRouteName(updatedName);
        if (!nameValidation.valid) {
            alert(nameValidation.message);
            document.getElementById('routeName').focus();
            return;
        }

        // Validar dirección
        const addressValidation = isValidAddress(updatedDirection);
        if (!addressValidation.valid) {
            alert(addressValidation.message);
            document.getElementById('direction').focus();
            return;
        }

        // Validar lugares de referencia
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

        if (updatedReferencePlacesArray.length === 0) {
            alert('Debes tener al menos un lugar de referencia.');
            document.getElementById('newReferencePlaceEdit').focus();
            return;
        }

        // Validar descripción
        const descValidation = isValidDescription(updatedDescription);
        if (!descValidation.valid) {
            alert(descValidation.message);
            document.getElementById('description').focus();
            return;
        }

        // Verificar duplicados de nombre (excluyendo la ruta actual)
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
        const isDuplicate = routes.some((r, idx) => 
            idx !== routeIndex &&
            r.idConductor === usuarioActivo.id_usuario && 
            r.name.toLowerCase() === updatedName.toLowerCase()
        );
        
        if (isDuplicate) {
            alert('Ya tienes otra ruta con este nombre. Por favor, elige un nombre diferente.');
            document.getElementById('routeName').focus();
            return;
        }

        routes[routeIndex] = {
            ...route, 
            name: updatedName,
            direction: updatedDirection,
            referencePlaces: updatedReferencePlacesArray,
            description: updatedDescription,
            updatedAt: new Date().toISOString()
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