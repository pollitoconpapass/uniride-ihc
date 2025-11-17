let modal = document.getElementById("addTripModal");
let openBtn = document.getElementById("addTripBtn");
let cancelBtn = document.getElementById("cancelAddTrip");
let agregarBtn = document.getElementById("agregarForm"); 
console.log("entraste al js de viajes");

//datos del formulario 
let fechaInicio = document.getElementById("fechaInicio"); 
let horaInicio = document.getElementById("horaInicio"); 
let rutaTomar = document.getElementById("rutaTomar"); 
let cantidadPasajeros = document.getElementById("cantidadPasajeros"); 

// abrir modal
openBtn.addEventListener("click", () => {
    console.log("estoy haciendo click en agregar");
  modal.style.display = "flex";
});

// cerrar modal
cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});


//se agrego un viaje 
agregarBtn.addEventListener("click", (e) => {
  e.preventDefault(); 

  const viaje = {
    fecha: fechaInicio.value,
    hora: horaInicio.value,
    ruta: rutaTomar.value,
    pasajeros: cantidadPasajeros.value
  };

  // Guardar en LocalStorage
  localStorage.setItem("viajeGuardado", JSON.stringify(viaje));

  window.location.href = "informacion_viaje_conductor.html";
});

// cerrar al hacer click fuera del modal
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

