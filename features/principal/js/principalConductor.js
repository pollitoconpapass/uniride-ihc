let currentUser = null;

// INFO GENERAL
document.addEventListener("DOMContentLoaded", () => {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.id === usuarioActivo.id_usuario);
    currentUser = usuario;

    if (!usuario) {
        console.warn("No se encontró al usuario activo en la base de usuarios");
        return;
    }

    const dp = usuario.datosPersonales;
    const dv = usuario.datosVehiculares;

    document.getElementById("nombre").textContent =
        `${dp.nombres || ""} ${dp.apellidoPaterno || ""} ${dp.apellidoMaterno || ""}`.trim();

    document.getElementById("sidebarNombre").innerText = dp.nombres.split(" ")[0] || "";
    document.getElementById("tituloNombre").innerText = dp.nombres.split(" ")[0] || "";

    document.getElementById("carrera").textContent =
        dp.carrera || "No especificado";

    document.getElementById("universidad").textContent =
        dp.universidad || "No especificada";

    // Datos de vehiculos
    if (dv) {
        document.getElementById("vehiculo").textContent =
            `${dv.marca || ""} ${dv.modelo || ""} - ${dv.color || ""}`.trim();

        document.getElementById("placa").textContent =
            dv.placa || "No registrada";
    } else {
        document.getElementById("vehiculo").textContent = "No registrado";
        document.getElementById("placa").textContent = "No registrada";
    }
});



// VIAJES
const tripsKey = "uniride_trips";
const tripsTableBody = document.getElementById("tripsTableBody")
const storageViajes = 'viajesGuardados'

function getDayOfWeek(dateString){
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const date = new Date(dateString)
  return days[date.getDay()]
}

function createGraphics(){
  const allTrips = JSON.parse(localStorage.getItem(storageViajes)) || [];
  const trips = allTrips.filter(t => t.idConductor === currentUser.id);
  
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
  const allTrips = JSON.parse(localStorage.getItem(storageViajes)) || [];
  const trips = allTrips.filter(t => t.idConductor === currentUser.id);
  
  tripsTableBody.innerHTML = ""
  
  if (trips.length === 0) {
    const emptyRow = document.createElement("tr")
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
        <img src="../../../assets/imgs/vacio.png" alt="Empty Image" style="width: 100px; margin-bottom: 20px;">
        <p style="font-size: 16px; margin: 0;">Aún no tienes viajes planeados.</p>
        <p style="font-size: 14px; margin-top: 10px;">Ve a la sección de <a href="../../viajes/pages/conductor/viajes_conductor.html" style="color: #4F46E5; text-decoration: underline;">viajes</a> para agendar uno.</p>
      </td>`
    tripsTableBody.appendChild(emptyRow)
  } else {
    for (let i = 0; i < trips.length; i++) { 
      const trip = trips[i];
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${trip.fecha} ${trip.hora}</td>
        <td>${trip.ruta}</td>
        <td>${trip.pasajeros || 0}</td>
        <td><img src="../../../assets/icons/ver_mas_icon.svg" class="ver-mas-icon" data-index="${i}" style="cursor: pointer;"></td>`
      tripsTableBody.appendChild(row)
    }

    document.querySelectorAll('.ver-mas-icon').forEach(icon => {
      icon.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        verDetalle(index);
      });
    });
  }
  
  document.getElementById("totalViajes").textContent = trips.length
}

function verDetalle(index) {
    const viajes = JSON.parse(localStorage.getItem("viajesGuardados")) || [];
    const viajeSeleccionado = viajes[index];

    localStorage.setItem("viajeGuardado", JSON.stringify(viajeSeleccionado));
    localStorage.setItem("viajeIndex", index);

    window.location.href = "../../viajes/pages/conductor/informacion_viaje_conductor.html";
}

globalThis.addEventListener('DOMContentLoaded', function() {
  loadTrips()
  createGraphics()
})
