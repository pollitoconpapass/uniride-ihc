document.addEventListener("DOMContentLoaded", function() {
    console.log("🔄 Iniciando carga de compensaciones...");
    
    // Obtener usuario activo para el sidebar
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (usuarioActivo) {
        console.log("✅ Usuario activo encontrado:", usuarioActivo);
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuario = usuarios.find(u => u.id === usuarioActivo.id_usuario);
        if (usuario && usuario.datosPersonales) {
            document.getElementById("sidebarNombre").textContent = 
                usuario.datosPersonales.nombres ? usuario.datosPersonales.nombres.split(" ")[0] : "";
        }
    } else {
        console.warn("⚠️ No hay usuario activo en localStorage");
    }
    
    // Cargar compensaciones basadas en viajes reales
    loadRealCompensations();
    
    // Configurar eventos de ordenamiento
    setupSorting();
    
    // Configurar filtro por mes
    setupMonthFilter();
});

// Variable global para almacenar todas las compensaciones
let allCompensations = [];

function loadRealCompensations() {
    console.log("🔄 Cargando compensaciones desde viajes del conductor...");
    
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("❌ No hay usuario activo");
        showEmptyState();
        return;
    }
    
    const idConductor = usuarioActivo.id_usuario;
    console.log("👤 ID Conductor:", idConductor);
    
    // Buscar todos los datos necesarios
    const viajesPasados = JSON.parse(localStorage.getItem("viajesPasados")) || [];
    const viajesGuardados = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    
    console.log("📊 Datos encontrados:");
    console.log("- Viajes pasados:", viajesPasados.length);
    console.log("- Viajes guardados:", viajesGuardados.length);
    console.log("- Usuarios:", usuarios.length);
    
    // Depuración: Mostrar estructura de un viaje
    if (viajesPasados.length > 0) {
        console.log("📝 Estructura de primer viaje:", JSON.stringify(viajesPasados[0]));
    }
    
    // Filtrar viajes pasados del conductor actual
    const viajesConductor = viajesPasados.filter(viaje => {
        const match = viaje.id_conductor === idConductor;
        if (match) {
            console.log("🎯 Viaje encontrado para el conductor:", viaje);
        }
        return match;
    });
    
    console.log("🚗 Viajes del conductor encontrados:", viajesConductor.length);
    
    if (viajesConductor.length === 0) {
        console.log("📭 No hay viajes pasados para este conductor");
        showEmptyState();
        return;
    }

    // Transformar los datos de viajes a compensaciones
    allCompensations = viajesConductor.map(viaje => {
        console.log("🔄 Procesando viaje:", viaje);
        
        // Buscar información completa del viaje
        const viajeCompleto = viajesGuardados.find(v => v.id === viaje.id_viaje) || {};
        console.log("📋 Información completa del viaje:", viajeCompleto);
        
        // Obtener información del pasajero
        const pasajeroInfo = getPasajeroInfo(viaje, usuarios);
        
        // Determinar tipo de compensación
        const tipoCompensacion = determinarCompensacion(viajeCompleto.ruta);
        
        // Calcular monto
        const monto = calcularMontoCompensacion(viaje.pasajeros ? viaje.pasajeros.length : 1);
        
        // Formatear fecha
        const fechaFormateada = formatDateForCompensations(viaje.fecha || viaje.fecha_salida);
        
        // Obtener hora
        const hora = viaje.hora || viajeCompleto.hora || "--:--";
        
        return {
            date: fechaFormateada,
            time: hora,
            passenger: pasajeroInfo.nombre,
            compensation: tipoCompensacion,
            amount: monto,
            originalDate: viaje.fecha || viaje.fecha_salida,
            pasajeroId: pasajeroInfo.id
        };
    });
    
    console.log("💰 Compensaciones generadas:", allCompensations);
    
    // Ordenar por fecha (más reciente primero)
    allCompensations.sort((a, b) => {
        const dateA = parseFecha(a.originalDate);
        const dateB = parseFecha(b.originalDate);
        return dateB - dateA; // Descendente (más reciente primero)
    });
    
    // Renderizar tabla
    renderTable(allCompensations);
    updateTotal(allCompensations);
}

function getPasajeroInfo(viaje, usuarios) {
    let nombre = "Pasajero no identificado";
    let id = null;
    
    if (viaje.pasajeros && Array.isArray(viaje.pasajeros) && viaje.pasajeros.length > 0) {
        const pasajeroId = viaje.pasajeros[0]; // Tomar el primer pasajero
        const pasajero = usuarios.find(u => u.id === pasajeroId);
        
        if (pasajero && pasajero.datosPersonales) {
            const dp = pasajero.datosPersonales;
            nombre = `${dp.nombres || ''} ${dp.apellidoPaterno || ''}`.trim() || nombre;
            id = pasajero.id;
        }
    } else if (viaje.pasajero_nombre) {
        nombre = viaje.pasajero_nombre;
    } else if (viaje.pasajero_id) {
        const pasajero = usuarios.find(u => u.id === viaje.pasajero_id);
        if (pasajero && pasajero.datosPersonales) {
            const dp = pasajero.datosPersonales;
            nombre = `${dp.nombres || ''} ${dp.apellidoPaterno || ''}`.trim() || nombre;
            id = pasajero.id;
        }
    }
    
    return { nombre, id };
}

function determinarCompensacion(ruta) {
    if (!ruta) return 'Pago en soles';
    
    const rutaLower = ruta.toLowerCase();
    
    if (rutaLower.includes('tropias')) {
        return 'Copia con Tropias';
    } else if (rutaLower.includes('gestión') || rutaLower.includes('gestion')) {
        return 'Misto de Gestión';
    } else if (rutaLower.includes('universitario') || rutaLower.includes('universidad')) {
        return 'Pago universitario';
    } else if (rutaLower.includes('express')) {
        return 'Pago con tarjeta';
    } else if (rutaLower.includes('que') || rutaLower.includes('queda')) {
        return 'Pago en efectivo';
    } else {
        return 'Pago en soles';
    }
}

function calcularMontoCompensacion(numPasajeros) {
    const tarifaBase = 8.00; // S/. 8.00 por pasajero
    return tarifaBase * (numPasajeros || 1);
}

function parseFecha(fechaString) {
    if (!fechaString) return new Date(0);
    
    // Formato YYYY-MM-DD
    if (typeof fechaString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
        return new Date(fechaString);
    }
    
    // Formato DD/MM/YYYY
    if (typeof fechaString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(fechaString)) {
        const [day, month, year] = fechaString.split('/');
        return new Date(year, month - 1, day);
    }
    
    // Intentar parsear como fecha
    const date = new Date(fechaString);
    return isNaN(date.getTime()) ? new Date(0) : date;
}

function formatDateForCompensations(fechaOriginal) {
    if (!fechaOriginal) return '--/--/----';
    
    const date = parseFecha(fechaOriginal);
    
    if (date.getTime() === 0) return fechaOriginal; // Si no se pudo parsear
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function renderTable(data) {
    const tbody = document.getElementById('table-body');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) {
        console.error("❌ No se encontró el elemento table-body");
        return;
    }
    
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        showEmptyState();
        return;
    }
    
    // Ocultar estado vacío si existe
    if (emptyState) {
        emptyState.style.display = "none";
    }
    
    // Crear filas de la tabla
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Determinar la clase CSS basada en el tipo de compensación
        let badgeClass = 'compensation-badge ';
        if (item.compensation.includes('Tropias')) {
            badgeClass += 'compensation-tropias';
        } else if (item.compensation.includes('Gestión')) {
            badgeClass += 'compensation-misto';
        } else if (item.compensation.includes('universitario')) {
            badgeClass += 'compensation-universitario';
        } else if (item.compensation.includes('tarjeta')) {
            badgeClass += 'compensation-tarjeta';
        } else {
            badgeClass += 'compensation-cash';
        }
        
        // Crear HTML de la fila
        row.innerHTML = `
            <td>${item.date}</td>
            <td class="passenger-name">
                <i class="fas fa-user" style="margin-right: 8px; color: #666;"></i>
                ${item.passenger}
            </td>
            <td class="compensation-type">
                <span class="${badgeClass}">
                    <i class="fas ${getIconForCompensation(item.compensation)}" style="margin-right: 5px;"></i>
                    ${item.compensation}
                </span>
            </td>
            <td class="amount">
                <i class="fas fa-money-bill-wave" style="margin-right: 8px; color: #27ae60;"></i>
                S/. ${item.amount.toFixed(2)}
            </td>
        `;
        
        // Añadir efecto hover
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = '#f8f9fa';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
        
        tbody.appendChild(row);
    });
    
    console.log("✅ Tabla renderizada con", data.length, "filas");
}

function getIconForCompensation(compensation) {
    if (compensation.includes('Tropias')) return 'fa-copy';
    if (compensation.includes('Gestión')) return 'fa-briefcase';
    if (compensation.includes('universitario')) return 'fa-graduation-cap';
    if (compensation.includes('tarjeta')) return 'fa-credit-card';
    return 'fa-money-bill';
}

function showEmptyState() {
    const tbody = document.getElementById('table-body');
    
    if (tbody) {
        tbody.innerHTML = '';
        
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
                <div style="margin-bottom: 20px;">
                    <i class="fas fa-wallet" style="font-size: 60px; color: #bdc3c7;"></i>
                </div>
                <p style="font-size: 16px; margin: 0 0 10px 0; font-weight: 500;">
                    Aún no tienes compensaciones registradas.
                </p>
                <p style="font-size: 14px; margin: 0; color: #888;">
                    Tus compensaciones aparecerán aquí después de completar viajes.
                </p>
                <button id="refreshBtn" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
            </td>`;
        
        // Añadir evento al botón de actualizar
        emptyRow.querySelector('#refreshBtn')?.addEventListener('click', () => {
            console.log("🔄 Actualizando datos...");
            loadRealCompensations();
        });
        
        tbody.appendChild(emptyRow);
    }
    
    document.getElementById('total-amount').textContent = 'S/. 0.00';
}

function updateTotal(data) {
    const totalAmountElement = document.getElementById('total-amount');
    if (!totalAmountElement) {
        console.warn("⚠️ No se encontró el elemento total-amount");
        return;
    }
    
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    totalAmountElement.textContent = `S/. ${total.toFixed(2)}`;
    console.log("💰 Total calculado: S/.", total.toFixed(2));
}

function setupSorting() {
    const sortAscBtn = document.getElementById('sortAsc');
    const sortDescBtn = document.getElementById('sortDesc');
    
    if (!sortAscBtn || !sortDescBtn) {
        console.warn("⚠️ Botones de ordenamiento no encontrados");
        return;
    }
    
    console.log("✅ Botones de ordenamiento encontrados");
    
    // Orden ascendente por defecto (menor a mayor monto)
    sortCompensations('asc');
    sortAscBtn.classList.add('active');
    
    sortAscBtn.addEventListener('click', function() {
        console.log("🔼 Ordenando ascendente");
        sortAscBtn.classList.add('active');
        sortDescBtn.classList.remove('active');
        sortCompensations('asc');
    });
    
    sortDescBtn.addEventListener('click', function() {
        console.log("🔽 Ordenando descendente");
        sortDescBtn.classList.add('active');
        sortAscBtn.classList.remove('active');
        sortCompensations('desc');
    });
}

function sortCompensations(order) {
    if (allCompensations.length === 0) {
        console.warn("⚠️ No hay compensaciones para ordenar");
        return;
    }
    
    // Crear una copia para ordenar
    const sortedData = [...allCompensations];
    
    sortedData.sort((a, b) => {
        if (order === 'asc') {
            return a.amount - b.amount; // Ascendente
        } else {
            return b.amount - a.amount; // Descendente
        }
    });
    
    console.log(`📊 Ordenando compensaciones: ${order} (${sortedData.length} items)`);
    renderTable(sortedData);
}

function setupMonthFilter() {
    const monthFilter = document.getElementById('month-filter');
    if (!monthFilter) {
        console.warn("⚠️ No se encontró el filtro de meses");
        return;
    }
    
    console.log("✅ Filtro de meses encontrado");
    
    // Poblar el filtro de meses
    const months = [
        { value: 'all', name: 'Todos los meses' },
        { value: '01', name: 'Enero' },
        { value: '02', name: 'Febrero' },
        { value: '03', name: 'Marzo' },
        { value: '04', name: 'Abril' },
        { value: '05', name: 'Mayo' },
        { value: '06', name: 'Junio' },
        { value: '07', name: 'Julio' },
        { value: '08', name: 'Agosto' },
        { value: '09', name: 'Septiembre' },
        { value: '10', name: 'Octubre' },
        { value: '11', name: 'Noviembre' },
        { value: '12', name: 'Diciembre' }
    ];
    
    monthFilter.innerHTML = '';
    
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.name;
        monthFilter.appendChild(option);
    });
    
    // Establecer mes actual como seleccionado por defecto
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthString = currentMonth.toString().padStart(2, '0');
    monthFilter.value = 'all'; // Por defecto mostrar todos
    
    console.log(`📅 Filtro configurado. Mes actual: ${currentMonthString}`);
    
    // Agregar event listener para filtrar
    monthFilter.addEventListener('change', filterByMonth);
}

function filterByMonth() {
    const monthFilter = document.getElementById('month-filter');
    if (!monthFilter) return;
    
    const selectedMonth = monthFilter.value;
    console.log(`🎯 Filtrado por mes: ${selectedMonth}`);
    
    if (selectedMonth === 'all') {
        // Mostrar todos los datos
        renderTable(allCompensations);
        updateTotal(allCompensations);
        console.log("📊 Mostrando todos los meses");
        return;
    }
    
    // Filtrar por mes
    const filteredData = allCompensations.filter(item => {
        const date = parseFecha(item.originalDate);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return month === selectedMonth;
    });
    
    console.log(`📊 Resultados del filtro: ${filteredData.length} compensaciones`);
    
    if (filteredData.length === 0) {
        // Mostrar mensaje de "no hay datos para este mes"
        const tbody = document.getElementById('table-body');
        if (tbody) {
            tbody.innerHTML = '';
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-calendar-times" style="font-size: 50px; color: #bdc3c7; margin-bottom: 20px;"></i>
                    <p>No hay compensaciones para este mes.</p>
                    <button onclick="document.getElementById('month-filter').value='all'; filterByMonth();" 
                            style="margin-top: 15px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-eye"></i> Ver todos los meses
                    </button>
                </td>`;
            tbody.appendChild(emptyRow);
        }
        
        document.getElementById('total-amount').textContent = 'S/. 0.00';
    } else {
        renderTable(filteredData);
        updateTotal(filteredData);
    }
}

// Función para recargar manualmente los datos
function reloadCompensations() {
    console.log("🔄 Recargando compensaciones...");
    loadRealCompensations();
}

// Función para mostrar información de depuración
function debugInfo() {
    console.group("🔍 Información de depuración");
    console.log("Usuario activo:", JSON.parse(localStorage.getItem("usuario-activo")));
    console.log("Viajes pasados:", JSON.parse(localStorage.getItem("viajesPasados")));
    console.log("Viajes guardados:", JSON.parse(localStorage.getItem("viajesGuardados")));
    console.log("Usuarios:", JSON.parse(localStorage.getItem("usuarios"))?.length || 0, "usuarios");
    console.log("Compensaciones en memoria:", allCompensations.length);
    console.groupEnd();
}

// Añadir botón de depuración (opcional - quitar en producción)
document.addEventListener('DOMContentLoaded', () => {
    // Añadir botón de depuración si estamos en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const debugBtn = document.createElement('button');
        debugBtn.innerHTML = '<i class="fas fa-bug"></i>';
        debugBtn.style.position = 'fixed';
        debugBtn.style.bottom = '20px';
        debugBtn.style.right = '20px';
        debugBtn.style.zIndex = '1000';
        debugBtn.style.background = '#e74c3c';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '50%';
        debugBtn.style.width = '40px';
        debugBtn.style.height = '40px';
        debugBtn.style.cursor = 'pointer';
        debugBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        debugBtn.title = 'Depurar datos';
        debugBtn.addEventListener('click', debugInfo);
        document.body.appendChild(debugBtn);
    }
});
