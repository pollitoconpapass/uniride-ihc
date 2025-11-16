
const btnManual = document.getElementById("btn-manual-carga-manual");
const btnMasiva = document.getElementById("btn-masiva-carga-manual");

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

function prepararDia(btn, nombreDia) {
  btn.addEventListener('click', () => {
    const activado = btn.classList.toggle("btn-dia-seleccionado");

    if (activado) {
      btn.style.backgroundColor = '#A0A1C8';   // color al ACTIVAR
      console.log(`${nombreDia} activado`);
    } else {
      btn.style.backgroundColor = '';          
      console.log(`${nombreDia} desactivado`);
    }
  });
}

// Llamarlo para cada día
prepararDia(document.getElementById('lunes'), 'Lunes');
prepararDia(document.getElementById('martes'), 'Martes');
prepararDia(document.getElementById('miercoles'), 'Miércoles');
prepararDia(document.getElementById('jueves'), 'Jueves');
prepararDia(document.getElementById('viernes'), 'Viernes');
prepararDia(document.getElementById('sabado'), 'Sábado');
prepararDia(document.getElementById('domingo'), 'Domingo');
