const btnDatosPersonales = document.getElementById("btn-datos-personales");
const btnHorarios = document.getElementById("btn-horarios");
const btnDatosVehiculares = document.getElementById("btn-datos-vehiculares");


btnDatosPersonales.addEventListener("click", function() {
    window.location.href = "configuracionConductorDatosPersonales.html";
});

btnHorarios.addEventListener("click", function() {
    window.location.href = "configuracionConductorHorarioManual.html";
});

btnDatosVehiculares.addEventListener("click", function() {
    window.location.href = "configuracionConductorDatosVehiculares.html";
});