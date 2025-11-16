const btnManual = document.getElementById("btn-manual-carga-masiva");
const btnMasiva = document.getElementById("btn-masiva-carga-masiva");

btnManual.addEventListener("click", function () {
    btnManual.classList.add("btn-seleccionar-rol-seleccionado");
    btnMasiva.classList.remove("btn-seleccionar-rol-seleccionado");
    console.log("Botón Manual presionado");
});

btnMasiva.addEventListener("click", function () {
    btnMasiva.classList.add("btn-seleccionar-rol-seleccionado");
    btnManual.classList.remove("btn-seleccionar-rol-seleccionado");
    console.log("Botón Masiva presionado");
});