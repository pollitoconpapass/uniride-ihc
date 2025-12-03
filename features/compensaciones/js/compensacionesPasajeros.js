// DOM elements
const tableBody = document.getElementById('table-body');
const sortAscBtn = document.getElementById('sort-asc');
const sortDescBtn = document.getElementById('sort-desc');
const monthFilter = document.getElementById('month-filter');

// Current state - EMPIEZA VACÍO
let currentData = [];
let currentSort = null;

// Función para obtener pagos reales desde reservas
function obtenerPagosRealesDesdeReservas() {
    console.log("=== OBTENIENDO PAGOS REALES ===");
    
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        return [];
    }
    
    // USAMOS EL userId
    const userId = usuarioActivo.id_usuario;
    console.log("UserId para obtener pagos:", userId);
    
    // BUSCAMOS EN 'reservas' LOS DATOS
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    console.log("Total de reservas en sistema:", reservas.length);
    
    if (reservas.length === 0) {
        console.warn("No hay reservas en el sistema");
        return [];
    }
    
    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    
    // FILTRAR RESERVAS DEL USUARIO ACTIVO USANDO userId
    const reservasUsuario = reservas.filter(reserva => {
        return reserva.idPasajero == userId; // Usar == para comparación flexible
    });
    
    console.log("Reservas encontradas para el usuario:", reservasUsuario.length);
    
    if (reservasUsuario.length === 0) {
        console.warn(`No hay reservas para el usuario con id ${userId}`);
        return [];
    }
    
    // Mapear a formato de pago
    const pagosUsuario = reservasUsuario.map(reserva => {
        const viaje = viajes[reserva.viajeIndex];
        
        if (!viaje) {
            console.log(`No se encontró viaje para índice ${reserva.viajeIndex}`);
            return null;
        }
        
        // Convertir método abreviado a nombre completo
        const metodoMap = {
            'yape': 'Billetera Digital',
            'plin': 'Billetera Digital',
            'tarjeta': 'Tarjeta de Crédito',
            'efectivo': 'Efectivo',
            'credito': 'Tarjeta de Crédito',
            'debito': 'Tarjeta de Débito',
            'cash': 'Efectivo',
            'credit': 'Tarjeta de Crédito',
            'debit': 'Tarjeta de Débito',
            'wallet': 'Billetera Digital'
        };
        
        const metodoOriginal = (reserva.metodo || reserva.metodo_pago || '').toLowerCase();
        const paymentType = metodoMap[metodoOriginal] || metodoOriginal || 'Método no especificado';
        
        // Asegurar formato de fecha consistente
        let fechaReserva;
        if (reserva.fecha) {
            if (reserva.fecha.includes('-')) {
                // Convertir YYYY-MM-DD a DD/MM/YYYY
                const [year, month, day] = reserva.fecha.split('-');
                fechaReserva = `${day}/${month}/${year}`;
            } else {
                fechaReserva = reserva.fecha;
            }
        } else if (viaje.fecha) {
            fechaReserva = viaje.fecha;
        } else {
            fechaReserva = 'Fecha no disponible';
        }
        
        // Limpiar el nombre del conductor
        let nombreConductor = viaje.conductor || 'Conductor no disponible';
        if (nombreConductor.includes('undefined') || nombreConductor.includes('null')) {
            nombreConductor = 'Conductor no disponible';
        }
        
        return {
            date: fechaReserva,
            driver: nombreConductor,
            paymentType: paymentType,
            amount: parseFloat(reserva.monto) || 0
        };
    });
    
    const pagosValidos = pagosUsuario.filter(p => p !== null);
    console.log("Pagos válidos procesados:", pagosValidos.length);
    
    return pagosValidos;
}

// Initialize the table when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("=== INICIANDO REGISTRO DE PAGOS ===");
    
    // Cargar datos del usuario para la barra lateral
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (usuarioActivo) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuario = usuarios.find(u => u.id == usuarioActivo.id_usuario);
        
        if (usuario && usuario.datosPersonales) {
            const dp = usuario.datosPersonales;
            const primerNombre = dp.nombres ? dp.nombres.split(" ")[0] : "";
            document.getElementById('sidebarNombre').textContent = primerNombre;
        }
    }
    
    // Obtener datos REALES del usuario
    currentData = obtenerPagosRealesDesdeReservas();
    console.log("Datos REALES obtenidos:", currentData.length);
    
    // Inicializar componentes
    populateMonthFilter();
    initializeTable();
    
    // Add event listeners
    sortAscBtn.addEventListener('click', () => applySort('asc'));
    sortDescBtn.addEventListener('click', () => applySort('desc'));
    monthFilter.addEventListener('change', filterByMonth);
    
    // Add visual feedback for sorting buttons
    addSortingVisualFeedback();
    
    console.log("=== INICIALIZACIÓN COMPLETA ===");
});

// Populate month filter with all months of the year
function populateMonthFilter() {
    const months = [
        { value: 'all', name: 'Todos los meses' },
        { value: '01', name: 'Enero 2025' },
        { value: '02', name: 'Febrero 2025' },
        { value: '03', name: 'Marzo 2025' },
        { value: '04', name: 'Abril 2025' },
        { value: '05', name: 'Mayo 2025' },
        { value: '06', name: 'Junio 2025' },
        { value: '07', name: 'Julio 2025' },
        { value: '08', name: 'Agosto 2025' },
        { value: '09', name: 'Septiembre 2025' },
        { value: '10', name: 'Octubre 2025' },
        { value: '11', name: 'Noviembre 2025' },
        { value: '12', name: 'Diciembre 2025' }
    ];
    
    monthFilter.innerHTML = '';
    
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.name;
        monthFilter.appendChild(option);
    });
    
    // Set current month as default selection
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthString = currentMonth.toString().padStart(2, '0');
    monthFilter.value = currentMonthString;
}

// Add visual feedback to show sorting functionality
function addSortingVisualFeedback() {
    const buttons = [sortAscBtn, sortDescBtn];
    
    buttons.forEach(button => {
        // Solo agregar animación si hay datos
        if (currentData.length > 0) {
            button.classList.add('pulse');
        }
        
        // Add hover effects
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active') && currentData.length > 0) {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
}

// Initialize the table
function initializeTable() {
    renderTable(currentData);
}

// Render table with data
function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="empty-message">
                <div style="text-align: center; padding: 40px;">
                    <p style="font-size: 18px; margin-bottom: 15px; color: #7f8c8d;">
                        No tienes pagos registrados
                    </p>
                    <p style="font-size: 14px; color: #95a5a6;">
                        Realiza tu primer viaje para ver los pagos aquí
                    </p>
                </div>
            </td>`;
        tableBody.appendChild(emptyRow);
        
        // Deshabilitar botones de ordenamiento si no hay datos
        sortAscBtn.disabled = true;
        sortDescBtn.disabled = true;
        sortAscBtn.style.opacity = '0.5';
        sortDescBtn.style.opacity = '0.5';
        sortAscBtn.classList.remove('pulse');
        sortDescBtn.classList.remove('pulse');
        
        return;
    }
    
    // Habilitar botones de ordenamiento si hay datos
    sortAscBtn.disabled = false;
    sortDescBtn.disabled = false;
    sortAscBtn.style.opacity = '1';
    sortDescBtn.style.opacity = '1';
    
    data.forEach(payment => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${payment.date}</td>
            <td class="driver-name">${payment.driver}</td>
            <td class="payment-type">${payment.paymentType}</td>
            <td class="amount">S/. ${payment.amount.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Apply sorting based on selected filter
function applySort(sortType) {
    if (currentData.length === 0) return;
    
    // Remove active class from all buttons
    [sortAscBtn, sortDescBtn].forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('pulse');
        btn.style.transform = 'translateY(0)';
    });
    
    // Apply the selected sort
    switch(sortType) {
        case 'asc':
            currentData.sort((a, b) => a.amount - b.amount);
            sortAscBtn.classList.add('active');
            sortAscBtn.style.transform = 'translateY(-1px)';
            currentSort = 'asc';
            break;
        case 'desc':
            currentData.sort((a, b) => b.amount - a.amount);
            sortDescBtn.classList.add('active');
            sortDescBtn.style.transform = 'translateY(-1px)';
            currentSort = 'desc';
            break;
    }
    
    renderTable(currentData);
    
    // Add confirmation animation
    const activeButton = document.querySelector('.filter-btn.active');
    activeButton.classList.add('success-pulse');
    setTimeout(() => {
        activeButton.classList.remove('success-pulse');
    }, 500);
}

// Filter data by month
function filterByMonth() {
    const selectedMonth = monthFilter.value;
    
    // Obtener datos reales cada vez que se filtra
    const datosReales = obtenerPagosRealesDesdeReservas();
    
    if (selectedMonth === 'all') {
        currentData = [...datosReales];
    } else {
        currentData = datosReales.filter(pago => {
            // Extraer mes de la fecha (formatos: DD/MM/YYYY o YYYY-MM-DD)
            const dateStr = pago.date;
            let month = '';
            
            if (dateStr.includes('/')) {
                // Formato DD/MM/YYYY
                const parts = dateStr.split('/');
                if (parts.length >= 2) {
                    month = parts[1];
                }
            } else if (dateStr.includes('-')) {
                // Formato YYYY-MM-DD
                const parts = dateStr.split('-');
                if (parts.length >= 2) {
                    month = parts[1];
                }
            }
            
            return month === selectedMonth;
        });
    }
    
    // Reaplicar orden si existe
    if (currentSort === 'asc') {
        currentData.sort((a, b) => a.amount - b.amount);
    } else if (currentSort === 'desc') {
        currentData.sort((a, b) => b.amount - a.amount);
    }
    
    renderTable(currentData);
}