// Sample data for the payments table with costs under 30 soles and proper compensation types
// Multiple entries per month to demonstrate the functionality
const paymentsData = [
    { date: '08/01/2025', passenger: 'Nector Campos', compensation: 'Comida', amount: 18.50 },
    { date: '15/01/2025', passenger: 'Ana Garcia', compensation: 'Combustible', amount: 22.30 },
    { date: '22/01/2025', passenger: 'Luis Perez', compensation: 'Pago con Tarjeta', amount: 19.80 },
    { date: '10/02/2025', passenger: 'Sello Yin', compensation: 'Combustible', amount: 25.00 },
    { date: '18/02/2025', passenger: 'Maria Lopez', compensation: 'Comida', amount: 16.75 },
    { date: '25/02/2025', passenger: 'Carlos Ruiz', compensation: 'Pago con Tarjeta', amount: 21.40 },
    { date: '05/03/2025', passenger: 'Juan Martinez', compensation: 'Combustible', amount: 27.20 },
    { date: '12/03/2025', passenger: 'Elena Torres', compensation: 'Comida', amount: 14.90 },
    { date: '30/03/2025', passenger: 'Nadir Fernandez', compensation: 'Pago con Tarjeta', amount: 22.80 },
    { date: '15/04/2025', passenger: 'Nacional Maribrez', compensation: 'Comida', amount: 15.75 },
    { date: '22/04/2025', passenger: 'Roberto Silva', compensation: 'Combustible', amount: 26.50 },
    { date: '22/05/2025', passenger: 'Jumi Nordic', compensation: 'Combustible', amount: 28.50 },
    { date: '29/05/2025', passenger: 'Sofia Mendoza', compensation: 'Pago con Tarjeta', amount: 20.60 },
    { date: '05/06/2025', passenger: 'Adriana Masa', compensation: 'Pago con Tarjeta', amount: 19.90 },
    { date: '12/06/2025', passenger: 'Diego Ramos', compensation: 'Comida', amount: 17.25 },
    { date: '18/07/2025', passenger: 'Carlos Ruiz', compensation: 'Comida', amount: 12.25 },
    { date: '25/07/2025', passenger: 'Patricia Cruz', compensation: 'Combustible', amount: 24.80 },
    { date: '25/08/2025', passenger: 'Maria Lopez', compensation: 'Combustible', amount: 26.80 },
    { date: '02/08/2025', passenger: 'Fernando Diaz', compensation: 'Pago con Tarjeta', amount: 23.10 },
    { date: '12/09/2025', passenger: 'Juan Perez', compensation: 'Pago con Tarjeta', amount: 21.30 },
    { date: '19/09/2025', passenger: 'Laura Gomez', compensation: 'Comida', amount: 13.45 },
    { date: '19/10/2025', passenger: 'Ana Garcia', compensation: 'Comida', amount: 14.75 },
    { date: '26/10/2025', passenger: 'Ricardo Castro', compensation: 'Combustible', amount: 25.90 },
    { date: '07/11/2025', passenger: 'Luis Martinez', compensation: 'Combustible', amount: 27.40 },
    { date: '14/11/2025', passenger: 'Carmen Rios', compensation: 'Pago con Tarjeta', amount: 18.70 },
    { date: '14/12/2025', passenger: 'Carmen Lopez', compensation: 'Pago con Tarjeta', amount: 23.60 },
    { date: '21/12/2025', passenger: 'Jorge Herrera', compensation: 'Comida', amount: 16.20 }
];

// DOM elements
const tableBody = document.getElementById('table-body');
const totalAmountElement = document.getElementById('total-amount');
const sortAscBtn = document.getElementById('sort-asc');
const sortDescBtn = document.getElementById('sort-desc');
const monthFilter = document.getElementById('month-filter');

// Current state
let currentData = [...paymentsData];
let currentSort = null;

// Initialize the table when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    populateMonthFilter();
    initializeTable();
    
    // Add event listeners
    sortAscBtn.addEventListener('click', () => applySort('asc'));
    sortDescBtn.addEventListener('click', () => applySort('desc'));
    monthFilter.addEventListener('change', filterByMonth);
    
    // Add visual feedback for sorting buttons
    addSortingVisualFeedback();


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
    
    // Clear existing options
    monthFilter.innerHTML = '';
    
    // Add all months to the filter
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
        // Add pulse animation on page load
        button.style.animation = 'pulse 2s infinite';
        
        // Add hover effects
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
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
    updateTotalAmount(currentData);
}

// Render table with data
function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" style="text-align: center; padding: 20px;">No se encontraron registros</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    data.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.date}</td>
            <td>${payment.passenger}</td>
            <td>${payment.compensation}</td>
            <td class="amount">S/. ${payment.amount.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Update total amount display
function updateTotalAmount(data) {
    const total = data.reduce((sum, payment) => sum + payment.amount, 0);
    totalAmountElement.textContent = `S/. ${total.toFixed(2)}`;
}

// Apply sorting based on selected filter
function applySort(sortType) {
    // Remove active class from all buttons
    [sortAscBtn, sortDescBtn].forEach(btn => {
        btn.classList.remove('active');
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
    activeButton.style.animation = 'success-pulse 0.5s ease';
    setTimeout(() => {
        activeButton.style.animation = '';
    }, 500);
}

// Filter data by month
function filterByMonth() {
    const selectedMonth = monthFilter.value;
    
    if (selectedMonth === 'all') {
        currentData = [...paymentsData];
    } else {
        currentData = paymentsData.filter(payment => {
            // Extract month from date (format: DD/MM/YYYY)
            const month = payment.date.split('/')[1];
            return month === selectedMonth;
        });
    }
    
    // Reapply current sort if exists
    if (currentSort === 'asc') {
        currentData.sort((a, b) => a.amount - b.amount);
    } else if (currentSort === 'desc') {
        currentData.sort((a, b) => b.amount - a.amount);
    }
    
    renderTable(currentData);
    updateTotalAmount(currentData);
}

// Add CSS animations for sorting buttons
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
        100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
    }
    
    @keyframes success-pulse {
        0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.6); }
        70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
        100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
    }
`;
document.head.appendChild(style);