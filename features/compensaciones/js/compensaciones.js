// DOM elements
const tableBody = document.getElementById('table-body');
// Asegúrate de que este elemento exista en tu HTML de conductor
const totalAmountElement = document.getElementById('total-amount'); 
const sortAscBtn = document.getElementById('sortAsc');
const sortDescBtn = document.getElementById('sortDesc');
const monthFilter = document.getElementById('month-filter');

// Current state
let currentData = [];
let currentSort = null;
let allCompensations = []; // Guardar todos los datos sin filtrar por mes

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("=== INICIANDO REGISTRO DE COMPENSACIONES DE CONDUCTOR ===");
    
    // Cargar datos del usuario para el sidebar
    loadSidebarUserInfo();
    
    // Cargar y renderizar compensaciones
    loadRealCompensations();
    
    // Configurar eventos
    setupSorting();
    setupMonthFilter();
    filterByMonth(); 

    console.log("=== INICIALIZACIÓN COMPLETA ===");
});

function loadSidebarUserInfo() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (usuarioActivo) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuario = usuarios.find(u => u.id === usuarioActivo.id_usuario);
        if (usuario && usuario.datosPersonales) {
            const primerNombre = usuario.datosPersonales.nombres ? usuario.datosPersonales.nombres.split(" ")[0] : "";
            // Asume que el ID 'sidebarNombre' está en el HTML del conductor
            const sidebarElement = document.getElementById("sidebarNombre");
            if (sidebarElement) {
                sidebarElement.textContent = primerNombre;
            }
        }
    }
}

// Cargar compensaciones basadas en viajes reales
function loadRealCompensations() {
    console.log("=== OBTENIENDO COMPENSACIONES REALES DESDE RESERVAS ===");
    
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        showEmptyState();
        return;
    }
    
    const idConductor = usuarioActivo.id_usuario;
    console.log("ID Conductor para obtener compensaciones:", idConductor);
    
    // BUSCAR DIRECTAMENTE EN 'reservas' como hace el código del pasajero
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    console.log("Total de reservas en sistema:", reservas.length);
    
    if (reservas.length === 0) {
        console.warn("No hay reservas en el sistema");
        allCompensations = [];
        currentData = [];
        showEmptyState();
        return;
    }
    
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    
    // FILTRAR RESERVAS DEL CONDUCTOR ACTIVO (usando idConductor como en la estructura)
    const reservasConductor = reservas.filter(reserva => {
        return reserva.idConductor == idConductor; // Usar == para comparación flexible
    });
    
    console.log("Reservas encontradas para el conductor:", reservasConductor.length);
    
    if (reservasConductor.length === 0) {
        console.warn(`No hay reservas para el conductor con id ${idConductor}`);
        allCompensations = [];
        currentData = [];
        showEmptyState();
        return;
    }
    
    // Mapear a formato de compensación
    const compensaciones = reservasConductor.map(reserva => {
        // Obtener nombre del pasajero
        const pasajeroUsuario = usuarios.find(u => u.id_usuario === reserva.idPasajero);
        const nombrePasajero = reserva.nombrePasajero 
            ? reserva.nombrePasajero.split(" ")[0] 
            : (pasajeroUsuario?.datosPersonales?.nombres?.split(" ")[0] || "Pasajero");
        
        // Convertir método de pago a tipo de compensación
        const tipoPago = determinarTipoPago(reserva.metodo);
        
        // Asegurar formato de fecha consistente
        let fechaViaje;
        if (reserva.fecha) {
            if (reserva.fecha.includes('-')) {
                // Convertir YYYY-MM-DD a DD/MM/YYYY si es necesario
                const [year, month, day] = reserva.fecha.split('-');
                fechaViaje = `${day}/${month}/${year}`;
            } else {
                fechaViaje = reserva.fecha;
            }
        } else {
            fechaViaje = 'Fecha no disponible';
        }
        
        return {
            fecha_viaje: fechaViaje,
            ruta: reserva.ruta || "Ruta no especificada",
            pasajero: nombrePasajero,
            compensacion: tipoPago,
            monto: parseFloat(reserva.monto) || 0,
            dateForSort: new Date(reserva.fechaReserva || reserva.fecha).getTime()
        };
    });
    
    // Ordenar por fecha (más reciente primero)
    compensaciones.sort((a, b) => b.dateForSort - a.dateForSort);
    
    allCompensations = compensaciones;
    currentData = [...allCompensations];
    
    console.log("Compensaciones válidas procesadas:", allCompensations.length);
    
    renderTable(currentData);
    updateTotal(currentData);
    // Aplicar filtro de mes si existe
    if (typeof filterByMonth === 'function') {
        filterByMonth();
    }
}

// Mantener la función de mapeo de tipos de pago
function determinarTipoPago(metodoOriginal) {
    const metodoMap = {
        'yape': 'Billetera Digital (Yape/Plin)',
        'plin': 'Billetera Digital (Yape/Plin)',
        'tarjeta': 'Tarjeta de Crédito/Débito',
        'efectivo': 'Efectivo',
        'credito': 'Tarjeta de Crédito/Débito',
        'debito': 'Tarjeta de Crédito/Débito',
        'cash': 'Efectivo',
        'credit': 'Tarjeta de Crédito/Débito',
        'debit': 'Tarjeta de Crédito/Débito',
        'wallet': 'Billetera Digital (Yape/Plin)'
    };
    
    const key = (metodoOriginal || '').toLowerCase();
    const tipoPago = metodoMap[key] || metodoOriginal || 'Método no especificado';
    
    return tipoPago.charAt(0).toUpperCase() + tipoPago.slice(1);
}

// Funciones de Vista
function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        showEmptyState('table');
        return;
    }
    
    // Eliminar mensaje de vacío si existe uno
    const existingEmptyMessage = document.querySelector('.table-section .empty-message');
    if (existingEmptyMessage) existingEmptyMessage.remove();
    const table = document.getElementById('payments-table'); // Asume 'payments-table' en tu HTML
    if (table) table.style.display = 'table';
    
    data.forEach(payment => {
        const row = document.createElement('tr');
        
        let badgeClass = '';
        // Se puede mejorar usando un mapa de clases de CSS
        if (payment.compensacion.includes('Tropias')) {
            badgeClass = 'compensation-tropias';
        } else if (payment.compensacion.includes('Gestión')) {
            badgeClass = 'compensation-misto';
        } else {
            badgeClass = 'compensation-cash';
        }
        
        row.innerHTML = `
            <td>${formatDate(payment.fecha_viaje)}</td>
            <td class="passenger-name">${payment.pasajero || "N/A"}</td>
            <td class="compensation-type">
                <span class="compensation-badge ${badgeClass}">${payment.compensacion}</span>
            </td>
            <td class="amount">S/. ${parseFloat(payment.monto).toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function showEmptyState(mode = 'full') {
    tableBody.innerHTML = '';
    const tableSection = document.querySelector('.table-section');
    const table = document.getElementById('payments-table');
    
    // Si el estado vacío ya existe, salir para evitar duplicados
    if (document.querySelector('.table-section .empty-message')) return;

    if (mode === 'full') {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-message';
        // Asegúrate de que la ruta de la imagen sea correcta
        emptyDiv.innerHTML = `
            <img src="../../../assets/imgs/vacio.png" alt="Sin compensaciones">
            <p>Aún no tienes compensaciones registradas.</p>
            <p class="subtext">Tus compensaciones aparecerán aquí después de completar viajes.</p>
        `;
        
        if (table && tableSection) {
            table.style.display = 'none';
            tableSection.appendChild(emptyDiv);
        }
    } else if (mode === 'table') {
        // Para cuando no hay resultados en el filtro de mes
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="empty-message-row">No hay compensaciones para el filtro actual.</td>';
        tableBody.appendChild(emptyRow);
    }
    
    updateTotal([]);
}

function updateTotal(data) {
    const total = data.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
    if (totalAmountElement) {
        totalAmountElement.textContent = `S/. ${total.toFixed(2)}`;
    }
}

function setupSorting() {
    if (!sortAscBtn || !sortDescBtn) return;
    
    // Inicializar activo por defecto (Ascendente)
    if (currentSort === null) {
        sortAscBtn.classList.add('active');
        currentSort = 'asc';
    }

    sortAscBtn.addEventListener('click', function() {
        sortAscBtn.classList.add('active');
        sortDescBtn.classList.remove('active');
        sortCompensations('asc');
    });
    
    sortDescBtn.addEventListener('click', function() {
        sortDescBtn.classList.add('active');
        sortAscBtn.classList.remove('active');
        sortCompensations('desc');
    });
}

function sortCompensations(order) {
    if (currentData.length === 0) return;
    
    // Se ordena la data actual (ya filtrada por mes si aplica)
    currentData.sort((a, b) => (order === 'asc' ? a.monto - b.monto : b.monto - a.monto));
    currentSort = order;
    
    renderTable(currentData);
    updateTotal(currentData);
}

function setupMonthFilter() {
    if (!monthFilter) return;
    
    // Poblar el filtro de meses
    const months = [
        { value: 'all', name: 'Todos los meses' },
        { value: '01', name: 'Enero' }, { value: '02', name: 'Febrero' }, 
        { value: '03', name: 'Marzo' }, { value: '04', name: 'Abril' },
        { value: '05', name: 'Mayo' }, { value: '06', name: 'Junio' },
        { value: '07', name: 'Julio' }, { value: '08', name: 'Agosto' },
        { value: '09', name: 'Septiembre' }, { value: '10', name: 'Octubre' }, 
        { value: '11', name: 'Noviembre' }, { value: '12', name: 'Diciembre' }
    ];
    
    monthFilter.innerHTML = '';
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.name;
        monthFilter.appendChild(option);
    });
    
    // Set default filter to 'all'
    monthFilter.value = 'all'; 
    
    monthFilter.addEventListener('change', filterByMonth);
}

function filterByMonth() {
    const selectedMonth = monthFilter.value;
    
    // 1. Empezar con la lista completa de compensaciones
    let filteredData = [...allCompensations];

    if (selectedMonth !== 'all') {
        filteredData = allCompensations.filter(payment => {
            const fechaFormateada = formatDate(payment.fecha_viaje);
            // Extraer el mes del formato DD/MM/YYYY
            const partes = fechaFormateada.split('/');
            // Partes[1] es el mes
            return partes.length === 3 && partes[1] === selectedMonth;
        });
    }
    
    // 2. Reaplicar el ordenamiento si ya existe un criterio
    if (currentSort) {
        filteredData.sort((a, b) => (currentSort === 'asc' ? a.monto - b.monto : b.monto - a.monto));
    }

    // 3. Actualizar la data actual y renderizar
    currentData = filteredData;
    renderTable(currentData);
    updateTotal(currentData);
}

// UTILS
function formatDate(dateString) {
    if (!dateString) return "N/A";
    
    let date;
    // Intenta parsear como Date
    date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        // Si el parseo falla, intenta con formatos manuales comunes (DD/MM/YYYY o YYYY-MM-DD)
        if (typeof dateString === 'string') {
            if (dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) date = new Date(parts[2], parts[1] - 1, parts[0]);
            } else if (dateString.includes('-')) {
                date = new Date(dateString);
            }
        }
    }
    
    if (isNaN(date.getTime())) return dateString; // Retornar original si aún no es válido
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Cleanup function - se mantiene si es necesario para tu flujo de desarrollo
function limpiarDatosEjemplo() {
    if (localStorage.getItem("compensacionesData")) {
        localStorage.removeItem("compensacionesData");
        console.log("Datos de ejemplo eliminados");
    }
}

// Ejecutar la limpieza al inicio
limpiarDatosEjemplo();