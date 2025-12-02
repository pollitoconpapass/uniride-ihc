// INFO GENERAL
document.addEventListener("DOMContentLoaded", () => {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        return;
    }

    // OBTENEMOS EL userId DEL USUARIO ACTIVO
    const userId = usuarioActivo.id_usuario;
    console.log("userId del usuario activo:", userId);

    // BUSCAMOS EN 'reservas' SI HAY DATOS PARA ESTE USUARIO
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    console.log("Total de reservas en sistema:", reservas.length);
    
    if (reservas.length > 0) {
        // FILTRAMOS LAS RESERVAS DEL USUARIO ACTIVO
        const reservasUsuario = reservas.filter(reserva => 
            reserva.idPasajero === userId
        );
        
        console.log(`Reservas encontradas para userId ${userId}:`, reservasUsuario.length);
        
        if (reservasUsuario.length > 0) {
            console.log("Detalles de las reservas del usuario:");
            
            // MOSTRAMOS MÉTODO DE PAGO Y MONTO PARA CADA RESERVA
            reservasUsuario.forEach((reserva, index) => {
                console.log(`Reserva ${index + 1}:`);
                console.log(`  Método de pago: ${reserva.metodo || reserva.metodo_pago || 'No especificado'}`);
                console.log(`  Monto cancelado: S/. ${reserva.monto || 0}`);
                console.log(`  Fecha: ${reserva.fecha || 'No especificada'}`);
                console.log(`  Estado: ${reserva.estado || 'No especificado'}`);
                console.log("---");
            });
            
            // CALCULAR TOTAL PAGADO
            const totalPagado = reservasUsuario.reduce((total, reserva) => {
                return total + (parseFloat(reserva.monto) || 0);
            }, 0);
            
            console.log(`Total pagado por el usuario: S/. ${totalPagado.toFixed(2)}`);
            
            // MOSTRAR EN LA PÁGINA (si hay elementos HTML para ello)
            mostrarInformacionPagos(reservasUsuario, totalPagado);
            
        } else {
            console.log(`No hay reservas para el usuario con id ${userId}`);
        }
    } else {
        console.log("No hay reservas en el sistema");
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.id === usuarioActivo.id_usuario);

    if (!usuario) {
        console.warn("No se encontró al usuario activo en la base de usuarios");
        return;
    }

    const dp = usuario.datosPersonales;

    document.getElementById("nombre").textContent =
        `${dp.nombres || ""} ${dp.apellidoPaterno || ""} ${dp.apellidoMaterno || ""}`.trim();

    document.getElementById("sidebarNombre").innerText = dp.nombres.split(" ")[0] || "";
    document.getElementById("tituloNombre").innerText = dp.nombres.split(" ")[0] || "";

    document.getElementById("carrera").textContent =
        dp.carrera || "No especificado";

    document.getElementById("universidad").textContent =
        dp.universidad || "No especificada";

});

// FUNCIÓN PARA MOSTRAR INFORMACIÓN DE PAGOS EN LA PÁGINA
function mostrarInformacionPagos(reservasUsuario, totalPagado) {
    // Crear o actualizar elementos HTML para mostrar la información
    const container = document.getElementById('pagos-container') || crearContenedorPagos();
    
    // Limpiar contenido previo
    container.innerHTML = '';
    
    // Crear resumen de pagos
    const resumenHTML = `
        <div class="pagos-resumen">
            <h3>Resumen de Pagos</h3>
            <p>Total de viajes reservados: <strong>${reservasUsuario.length}</strong></p>
            <p>Total pagado: <strong>S/. ${totalPagado.toFixed(2)}</strong></p>
        </div>
    `;
    
    // Crear tabla de pagos detallados
    let tablaHTML = `
        <div class="pagos-detalle">
            <h4>Detalle de Pagos</h4>
            <table class="pagos-tabla">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Método de Pago</th>
                        <th>Monto (S/.)</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    reservasUsuario.forEach(reserva => {
        const metodoPago = reserva.metodo || reserva.metodo_pago || 'No especificado';
        const monto = parseFloat(reserva.monto) || 0;
        const fecha = reserva.fecha || 'No especificada';
        const estado = reserva.estado || 'No especificado';
        
        // Formatear método de pago para mostrar mejor
        let metodoFormateado = metodoPago;
        if (metodoPago.toLowerCase() === 'yape') metodoFormateado = 'Yape';
        if (metodoPago.toLowerCase() === 'plin') metodoFormateado = 'Plin';
        if (metodoPago.toLowerCase() === 'efectivo') metodoFormateado = 'Efectivo';
        if (metodoPago.toLowerCase() === 'tarjeta') metodoFormateado = 'Tarjeta';
        if (metodoPago.toLowerCase() === 'credito') metodoFormateado = 'Tarjeta Crédito';
        if (metodoPago.toLowerCase() === 'debito') metodoFormateado = 'Tarjeta Débito';
        
        tablaHTML += `
            <tr>
                <td>${fecha}</td>
                <td>${metodoFormateado}</td>
                <td>${monto.toFixed(2)}</td>
                <td><span class="estado-pago ${estado.toLowerCase()}">${estado}</span></td>
            </tr>
        `;
    });
    
    tablaHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = resumenHTML + tablaHTML;
    
    // Añadir estilos si no existen
    añadirEstilosPagos();
}

// FUNCIÓN PARA CREAR CONTENEDOR DE PAGOS SI NO EXISTE
function crearContenedorPagos() {
    const container = document.createElement('div');
    container.id = 'pagos-container';
    container.className = 'pagos-container';
    
    // Insertar después del elemento de viajes o en un lugar visible
    const viajesSection = document.querySelector('.viajes-section') || 
                          document.querySelector('main') || 
                          document.body;
    viajesSection.appendChild(container);
    
    return container;
}

// FUNCIÓN PARA AÑADIR ESTILOS A LA SECCIÓN DE PAGOS
function añadirEstilosPagos() {
    if (document.getElementById('estilos-pagos')) return;
    
    const estilos = document.createElement('style');
    estilos.id = 'estilos-pagos';
    estilos.textContent = `
        .pagos-container {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .pagos-resumen {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .pagos-resumen h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .pagos-resumen p {
            margin: 8px 0;
            color: #555;
        }
        
        .pagos-detalle h4 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .pagos-tabla {
            width: 100%;
            border-collapse: collapse;
        }
        
        .pagos-tabla th {
            background: #4F46E5;
            color: white;
            padding: 12px;
            text-align: left;
        }
        
        .pagos-tabla td {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .pagos-tabla tr:hover {
            background: #f5f5f5;
        }
        
        .estado-pago {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .estado-pago.pagado,
        .estado-pago.completado {
            background: #d4edda;
            color: #155724;
        }
        
        .estado-pago.pendiente {
            background: #fff3cd;
            color: #856404;
        }
        
        .estado-pago.cancelado {
            background: #f8d7da;
            color: #721c24;
        }
    `;
    
    document.head.appendChild(estilos);
}


// VIAJES
const tripsKey = "uniride_trips";
const tripsTableBody = document.getElementById("tripsTableBody")
const storageViajes = 'viajesGuardados'
const storageReservas = 'reservas'

if (!localStorage.getItem(storageViajes)) {
  localStorage.setItem(storageViajes, JSON.stringify([]))
}

function getDayOfWeek(dateString){
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const date = new Date(dateString)
  return days[date.getDay()]
}

function createGraphics(){
  const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
  // USAMOS EL userId AQUÍ
  const userId = usuarioActivo ? usuarioActivo.id_usuario : null;
  
  if (!userId) {
    console.warn("No se pudo obtener el userId para crear gráficos");
    return;
  }
  
  // BUSCAMOS EN 'reservas' LOS DATOS DEL USUARIO
  const allTrips = JSON.parse(localStorage.getItem(storageViajes)) || [];
  const allReservas = JSON.parse(localStorage.getItem(storageReservas)) || [];
  
  console.log(`Buscando reservas para userId ${userId} en createGraphics()`);
  console.log("Total de reservas en sistema:", allReservas.length);

  const misReservas = allReservas.filter(r => {
    console.log(`Comparando: reserva.idPasajero=${r.idPasajero} con userId=${userId}`);
    return r.idPasajero === userId;
  });
  
  console.log(`Reservas encontradas para el usuario: ${misReservas.length}`);
  
  // MOSTRAR MÉTODOS DE PAGO Y MONTOS PARA GRÁFICOS
  if (misReservas.length > 0) {
    console.log("=== MÉTODOS DE PAGO Y MONTOS DEL USUARIO ===");
    let totalPagado = 0;
    
    misReservas.forEach((reserva, index) => {
      const metodo = reserva.metodo || reserva.metodo_pago || 'No especificado';
      const monto = parseFloat(reserva.monto) || 0;
      totalPagado += monto;
      
      console.log(`Reserva ${index + 1}: ${metodo} - S/. ${monto.toFixed(2)}`);
    });
    
    console.log(`Total general: S/. ${totalPagado.toFixed(2)}`);
    console.log("========================");
  }
  
  const trips = misReservas.map(r => allTrips[r.viajeIndex]).filter(v => v);
  console.log(`Viajes encontrados: ${trips.length}`);
  
  // Count trips by day of week
  const dayCount = {
    'Lunes': 0,
    'Martes': 0,
    'Miércoles': 0,
    'Jueves': 0,
    'Viernes': 0,
    'Sábado': 0,
    'Domingo': 0
  };
  
  for (const trip of trips) {
    if (trip.fecha) {
      const day = getDayOfWeek(trip.fecha);
      dayCount[day]++;
    }
  }
  
  const ctx = document.getElementById('tripChart').getContext('2d');
  
  if (globalThis.tripChartInstance) {
    globalThis.tripChartInstance.destroy();
  }
  
  globalThis.tripChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Viajes por Día',
        data: [
          dayCount['Lunes'],
          dayCount['Martes'],
          dayCount['Miércoles'],
          dayCount['Jueves'],
          dayCount['Viernes'],
          dayCount['Sábado'],
          dayCount['Domingo']
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(79, 70, 229, 0.8)'
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(79, 70, 229, 1)'
        ],
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Viajes por Día de la Semana',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 12
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function loadTrips() {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
  if (!usuarioActivo) return;

  // USAMOS EL userId AQUÍ TAMBIÉN
  const userId = usuarioActivo.id_usuario;
  
  console.log(`Cargando viajes para userId: ${userId}`);

  const allTrips = JSON.parse(localStorage.getItem(storageViajes)) || [];
  const allReservas = JSON.parse(localStorage.getItem(storageReservas)) || [];
  
  console.log("Total de reservas en sistema:", allReservas.length);
  console.log("Total de viajes en sistema:", allTrips.length);

  const misReservas = allReservas.filter(r => {
    console.log(`Reserva: idPasajero=${r.idPasajero}, userId=${userId}`);
    return r.idPasajero === userId;
  });
  
  console.log(`Reservas del usuario: ${misReservas.length}`);

  const misViajesDetallados = misReservas.map(reserva => {
    const viaje = allTrips[reserva.viajeIndex];
    if (!viaje) {
      console.log(`No se encontró viaje para índice: ${reserva.viajeIndex}`);
      return null;
    }

    console.log(`Viaje encontrado: ${viaje.conductor} - ${viaje.fecha}`);
    
    // EXTRAER MÉTODO DE PAGO Y MONTO DE LA RESERVA
    const metodoPago = reserva.metodo || reserva.metodo_pago || 'No especificado';
    const monto = reserva.monto ? parseFloat(reserva.monto).toFixed(2) : '0.00';
    
    return {
      ...viaje,
      puntoRecogida: reserva.puntoRecogida,
      estado: reserva.estado,
      metodo: metodoPago,
      monto: monto,
      hora: reserva.hora,
      fecha: reserva.fecha
    };
  }).filter(v => v !== null);

  console.log("Viajes completos del pasajero:", misViajesDetallados);
  console.log("UserId del pasajero:", userId);

  tripsTableBody.innerHTML = "";

  if (misViajesDetallados.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
        <img src="../../../assets/imgs/vacio.png" alt="Empty Image" style="width: 100px; margin-bottom: 20px;">
        <p style="font-size: 16px; margin: 0;">Aún no tienes viajes planeados.</p>
        <p style="font-size: 14px; margin-top: 10px;">Ve a la sección de <a href="../../viajes/pages/pasajero/viajes_usuario.html" style="color: #4F46E5; text-decoration: underline;">viajes</a> para agendar uno.</p>
      </td>`;
    tripsTableBody.appendChild(emptyRow);
  } else {
    for (const trip of misViajesDetallados) {
      const row = document.createElement("tr");
      
      // Formatear método de pago para mostrar mejor
      let metodoFormateado = trip.metodo;
      if (trip.metodo.toLowerCase() === 'yape') metodoFormateado = 'Yape';
      if (trip.metodo.toLowerCase() === 'plin') metodoFormateado = 'Plin';
      if (trip.metodo.toLowerCase() === 'efectivo') metodoFormateado = 'Efectivo';
      if (trip.metodo.toLowerCase() === 'tarjeta') metodoFormateado = 'Tarjeta';
      if (trip.metodo.toLowerCase() === 'credito') metodoFormateado = 'Tarjeta Crédito';
      if (trip.metodo.toLowerCase() === 'debito') metodoFormateado = 'Tarjeta Débito';
      
      row.innerHTML = `
        <td>${trip.fecha}</td>
        <td>${trip.hora}</td>
        <td>${trip.conductor}</td>
        <td>${trip.puntoRecogida}</td>
        <td>${metodoFormateado}</td>
        <td>S/. ${trip.monto}</td>
        <td>${trip.estado}</td>
      `;
      tripsTableBody.appendChild(row);
    }
  }

  document.getElementById("totalViajes").textContent = misViajesDetallados.length;
  
  // Actualizar también el total pagado
  const totalPagado = misViajesDetallados.reduce((total, viaje) => {
    return total + parseFloat(viaje.monto || 0);
  }, 0);
  
  // Mostrar total pagado si hay un elemento para ello
  const totalPagadoElement = document.getElementById("totalPagado");
  if (totalPagadoElement) {
    totalPagadoElement.textContent = `S/. ${totalPagado.toFixed(2)}`;
  }
}

globalThis.addEventListener('DOMContentLoaded', function() {
  loadTrips()
  createGraphics()
})

// Initialize localStorage data if it doesn't exist
function initializeLocalStorage() {
    // Check and initialize viajesGuardados
    if (!localStorage.getItem("reservas")) {
        localStorage.setItem("reservas", JSON.stringify([]));
    }

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
function obtenerPagosRealesDesdeReservas() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        return [];
    }
    
    // USAMOS EL userId AQUÍ
    const userId = usuarioActivo.id_usuario;
    console.log("Obteniendo pagos para userId:", userId);
    
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
        console.log(`Comparando: ${reserva.idPasajero} === ${userId}`);
        return reserva.idPasajero === userId;
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
            'yape': 'Billetera Digital (Yape)',
            'plin': 'Billetera Digital (Plin)',
            'tarjeta': 'Tarjeta de Crédito',
            'efectivo': 'Efectivo',
            'credito': 'Tarjeta de Crédito',
            'debito': 'Tarjeta de Débito'
        };
        
        const metodoOriginal = reserva.metodo || reserva.metodo_pago || '';
        const paymentType = metodoMap[metodoOriginal?.toLowerCase()] || 
                           metodoOriginal || 
                           'Método no especificado';
        
        return {
            date: reserva.fecha || viaje?.fecha || 'Fecha no disponible',
            driver: viaje?.conductor || reserva.conductor_nombre || 'Conductor no disponible',
            paymentType: paymentType,
            amount: parseFloat(reserva.monto) || 0
        };
    });
    
    const pagosValidos = pagosUsuario.filter(p => p !== null);
    console.log("Pagos válidos procesados:", pagosValidos.length);
    
    // Mostrar resumen de pagos en consola
    if (pagosValidos.length > 0) {
        console.log("=== RESUMEN DE PAGOS DEL USUARIO ===");
        const totalPagado = pagosValidos.reduce((total, pago) => total + pago.amount, 0);
        console.log(`Total pagado: S/. ${totalPagado.toFixed(2)}`);
        console.log("========================");
    }
    
    return pagosValidos;
}

// DOM elements
const tableBody = document.getElementById('table-body');
const sortAscBtn = document.getElementById('sort-asc');
const sortDescBtn = document.getElementById('sort-desc');
const monthFilter = document.getElementById('month-filter');

// Current state
let currentData = [];
let currentSort = null;
let pagosReales = [];

// Initialize the table when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("=== INICIANDO REGISTRO DE PAGOS ===");
    // Initialize localStorage data
    initializeLocalStorage();
    
    // OBTENEMOS EL userId DEL USUARIO ACTIVO UNA VEZ MÁS PARA CONSISTENCIA
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    const userId = usuarioActivo ? usuarioActivo.id_usuario : null;
    console.log("UserId para página de pagos:", userId);
    
    // BUSCAMOS EN 'reservas' SI HAY DATOS PARA ESTE USUARIO
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    console.log("Total de reservas en sistema:", reservas.length);
    
    if (reservas.length > 0 && userId) {
        const reservasUsuario = reservas.filter(r => r.idPasajero === userId);
        console.log(`Reservas encontradas para userId ${userId}:`, reservasUsuario.length);
        
        // EXTRAER Y MOSTRAR MÉTODOS DE PAGO Y MONTOS
        if (reservasUsuario.length > 0) {
            console.log("=== MÉTODOS DE PAGO Y MONTOS ===");
            reservasUsuario.forEach((reserva, index) => {
                const metodo = reserva.metodo || reserva.metodo_pago || 'No especificado';
                const monto = reserva.monto || '0.00';
                const fecha = reserva.fecha || 'No especificada';
                console.log(`${index + 1}. ${fecha} - ${metodo}: S/. ${monto}`);
            });
            
            // Calcular total
            const total = reservasUsuario.reduce((sum, reserva) => {
                return sum + (parseFloat(reserva.monto) || 0);
            }, 0);
            console.log(`Total: S/. ${total.toFixed(2)}`);
            console.log("========================");
        }
    }
    
    // B. Luego obtener datos reales
    const pagosReales = obtenerPagosRealesDesdeReservas();
    console.log("Pagos reales obtenidos:", pagosReales.length);
    
    // C. Decidir: usar datos reales o de ejemplo
    if (pagosReales.length > 0) {
        currentData = [...pagosReales];  // Usar datos REALES
        console.log("Usando datos REALES de reservas");
    } else {
        currentData = [...paymentData];  // Usar datos de EJEMPLO
        console.log("Usando datos de EJEMPLO (no hay reservas)");
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

    // Cargar datos del usuario para la barra lateral
    if (usuarioActivo) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuario = usuarios.find(u => u.id === userId);

        if (usuario) {
            const dp = usuario.datosPersonales;
            document.getElementById("sidebarNombre").innerText = dp.nombres.split(" ")[0] || "";
        }
    }
});

// Resto del código (loadTripStatistics, updateBenefitsWithTripData, etc.)...
