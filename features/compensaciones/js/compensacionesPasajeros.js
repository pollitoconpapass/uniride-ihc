// Initialize localStorage data if it doesn't exist
function initializeLocalStorage() {
    // Check and initialize viajesGuardados
    if (!localStorage.getItem("viajesGuardados")) {
        localStorage.setItem("viajesGuardados", JSON.stringify([]));
    }
    
    // Check and initialize viajesPasados
    if (!localStorage.getItem("viajesPasados")) {
        localStorage.setItem("viajesPasados", JSON.stringify([]));
    }
    
    // Check and initialize userRoutes
    if (!localStorage.getItem("userRoutes")) {
        localStorage.setItem("userRoutes", JSON.stringify([]));
    }
    
    // Check and initialize actualizarTablaViajes
    if (!localStorage.getItem("actualizarTablaViajes")) {
        localStorage.setItem("actualizarTablaViajes", "false");
    }
}

// Sample data for passenger travel compensations and discounts only
// Using the specific data mentioned, excluding meal coupon
const benefitsData = [
    { 
        date: '08/09/2025', 
        driver: 'Nector Campos', 
        benefitType: 'Retraso del conductor', 
        amount: 3.50
    },
    { 
        date: '10/10/2025', 
        driver: 'Sello Yin', 
        benefitType: 'Bono por 10 viajes', 
        amount: 6.00
    },
    { 
        date: '30/10/2025', 
        driver: 'Nadir Fernandez', 
        benefitType: 'Promoción especial', 
        amount: 8.00
    },
    { 
        date: '15/10/2025', 
        driver: 'Nacional Maribrez', 
        benefitType: 'Retraso del conductor', 
        amount: 3.50
    },
    { 
        date: '22/10/2025', 
        driver: 'Jumi Nordic', 
        benefitType: 'Bono por 15 viajes', 
        amount: 7.50
    },
    { 
        date: '05/10/2025', 
        driver: 'Adriana Masa', 
        benefitType: 'Promoción especial', 
        amount: 6.00
    },
    { 
        date: '12/10/2025', 
        driver: 'Carlos Ruiz', 
        benefitType: 'Retraso del conductor', 
        amount: 4.00
    },
    { 
        date: '18/10/2025', 
        driver: 'Maria Lopez', 
        benefitType: 'Bono por 5 viajes', 
        amount: 4.50
    },
    { 
        date: '25/10/2025', 
        driver: 'Juan Perez', 
        benefitType: 'Promoción especial', 
        amount: 8.00
    },
    { 
        date: '28/10/2025', 
        driver: 'Ana Garcia', 
        benefitType: 'Bono por 20 viajes', 
        amount: 10.00
    }
];

// DOM elements
const tableBody = document.getElementById('table-body');
const totalSavedElement = document.getElementById('total-saved');
const sortAscBtn = document.getElementById('sort-asc');
const sortDescBtn = document.getElementById('sort-desc');
const monthFilter = document.getElementById('month-filter');

// Current state
let currentData = [...benefitsData];
let currentSort = null;

// Initialize the table when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize localStorage data
    initializeLocalStorage();
    
    // Check if we need to update the table from trip management
    if (localStorage.getItem("actualizarTablaViajes") === "true") {
        // You could add logic here to refresh data if needed
        localStorage.removeItem("actualizarTablaViajes");
    }
    
    populateMonthFilter();
    initializeTable();
    
    // Add event listeners
    sortAscBtn.addEventListener('click', () => applySort('asc'));
    sortDescBtn.addEventListener('click', () => applySort('desc'));
    monthFilter.addEventListener('change', filterByMonth);
    
    // Add visual feedback for sorting buttons
    addSortingVisualFeedback();
    
    // Load and display trip statistics if available
    loadTripStatistics();


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

// Load and display statistics from trip data
function loadTripStatistics() {
    try {
        const viajesGuardados = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
        const viajesPasados = JSON.parse(localStorage.getItem("viajesPasados")) || [];
        
        // You can use this data to enhance your benefits display
        console.log(`Planned trips: ${viajesGuardados.length}`);
        console.log(`Completed trips: ${viajesPasados.length}`);
        
        // Example: You could add benefits based on trip completion
        // updateBenefitsWithTripData(viajesPasados);
        
    } catch (error) {
        console.error("Error loading trip statistics:", error);
    }
}

// Example function to update benefits based on completed trips
function updateBenefitsWithTripData(completedTrips) {
    // This is an example of how you could integrate trip data with benefits
    if (completedTrips.length > 0) {
        console.log("Integrating completed trips with benefits data...");
        // Add logic here to create benefits based on completed trips
    }
}

// Function to save a new benefit to localStorage (if needed)
function saveBenefitToLocalStorage(benefit) {
    try {
        // You could store benefits in localStorage if needed
        const storedBenefits = JSON.parse(localStorage.getItem("passengerBenefits")) || [];
        storedBenefits.push(benefit);
        localStorage.setItem("passengerBenefits", JSON.stringify(storedBenefits));
    } catch (error) {
        console.error("Error saving benefit to localStorage:", error);
    }
}

// Function to get benefits from localStorage (if stored there)
function getBenefitsFromLocalStorage() {
    try {
        const storedBenefits = JSON.parse(localStorage.getItem("passengerBenefits"));
        if (storedBenefits && storedBenefits.length > 0) {
            return storedBenefits;
        }
    } catch (error) {
        console.error("Error getting benefits from localStorage:", error);
    }
    return benefitsData; // Fallback to sample data
}

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
    // Check if we have benefits stored in localStorage
    const storedBenefits = getBenefitsFromLocalStorage();
    if (storedBenefits !== benefitsData) {
        currentData = [...storedBenefits];
    }
    
    renderTable(currentData);
    updateStatistics(currentData);
}

// Render table with data
function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" style="text-align: center; padding: 20px;">No se encontraron compensaciones</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    data.forEach(benefit => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${benefit.date}</td>
            <td class="driver-name">${benefit.driver}</td>
            <td class="benefit-type">${benefit.benefitType}</td>
            <td class="amount">S/. ${benefit.amount.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Update statistics display
function updateStatistics(data) {
    const total = data.reduce((sum, benefit) => sum + benefit.amount, 0);
    totalSavedElement.textContent = `S/. ${total.toFixed(2)}`;
    
    // You could also save this total to localStorage if needed
    localStorage.setItem("totalBenefitsSaved", total.toFixed(2));
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
        currentData = [...benefitsData];
    } else {
        currentData = benefitsData.filter(benefit => {
            // Extract month from date (format: DD/MM/YYYY)
            const month = benefit.date.split('/')[1];
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
    updateStatistics(currentData);
}

// Function to navigate to trip management (if needed)
function navigateToTripManagement() {
    // You can use this to navigate between pages while maintaining state
    localStorage.setItem("comingFromBenefits", "true");
    window.location.href = "viajes_conductor.html";
}

// Function to handle page refresh from trip management
function handleTripManagementRefresh() {
    if (localStorage.getItem("actualizarTablaViajes") === "true") {
        // Refresh any trip-related data if needed
        loadTripStatistics();
        localStorage.removeItem("actualizarTablaViajes");
    }
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