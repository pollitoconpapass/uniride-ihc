let modal = document.getElementById("addTripModal");
let openBtn = document.getElementById("addTripBtn");
let cancelBtn = document.getElementById("cancelAddTrip");
let agregarBtn = document.getElementById("agregarForm"); 
console.log("entraste al js de viajes");

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
agregarBtn.addEventListener("click", () => {
  
});
// cerrar al hacer click fuera del modal
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

