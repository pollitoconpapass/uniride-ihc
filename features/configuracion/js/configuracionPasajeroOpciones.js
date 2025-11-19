const btnDatosPersonales = document.getElementById("btn-datos-personales");
const btnHorarios = document.getElementById("btn-horarios");


btnDatosPersonales.addEventListener("click", function() {
    window.location.href = "configuracionPasajeroDatosPersonales.html";
});

btnHorarios.addEventListener("click", function() {
    window.location.href = "configuracionPasajeroHorarioManual.html";
});