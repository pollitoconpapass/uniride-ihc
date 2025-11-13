const btnCardConductor = document.getElementById("cardConductor");
const btnCardPasajero = document.getElementById("cardPasajero");

btnCardConductor.addEventListener("click", function () {
    // Activar Conductor
    btnCardConductor.classList.add("btn-seleccionar-rol-seleccionado");

    // Desactivar Pasajero
    btnCardPasajero.classList.remove("btn-seleccionar-rol-seleccionado");

    console.log("Botón Conductor presionado");
});

btnCardPasajero.addEventListener("click", function () {
    // Activar Pasajero
    btnCardPasajero.classList.add("btn-seleccionar-rol-seleccionado");

    // Desactivar Conductor
    btnCardConductor.classList.remove("btn-seleccionar-rol-seleccionado");

    console.log("Botón Pasajero presionado");
});
