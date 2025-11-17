// Gráfico de frecuencia de viajes (Chart.js)
const ctx = document.getElementById("tripChart").getContext("2d");
new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    datasets: [{
      label: "Frecuencia de Viajes",
      data: [1, 3, 2, 4, 2, 5, 3, 4, 2, 3, 5, 6],
      borderColor: "#4F46E5",
      fill: false,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});

const tripsKey = "uniride_trips";
const tripsTableBody = document.getElementById("tripsTableBody");
const addTripBtn = document.getElementById("addTripBtn");


// Adjuntar las estadisticas de VIAJES
