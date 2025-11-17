
const btnManual = document.getElementById("btn-manual-carga-manual");
const btnMasiva = document.getElementById("btn-masiva-carga-manual");
const mostrarFormulario = document.getElementById("modal-curso");
const btnAddCurso = document.getElementById("btnAddCurso");
const btnCancelarFormulario = document.getElementById("btnCancelFormulario");
const btnGuardarFormulario = document.getElementById("btnGuardarFormulario");
const listaCursos = document.getElementById("listaCursos");
const cursos = [];
let onGuardar = null;

function resetFormValue(){
  document.querySelector('input[name="input-nombre-curso"]').value = '';
  document.querySelector('input[name="input-horario-inicio"]').value = '';
  document.querySelector('input[name="input-horario-fin"]').value = '';
  const diasBtns = document.querySelectorAll('.group-frecuencia button');
  diasBtns.forEach(b => {
    b.classList.remove("btn-dia-seleccionado");
    b.style.backgroundColor = '';
  });
}

function putFormValue(curso) {
  document.querySelector('input[name="input-nombre-curso"]').value = curso.nombre;
  document.querySelector('input[name="input-horario-inicio"]').value = curso.inicio[0];
  document.querySelector('input[name="input-horario-fin"]').value = curso.fin[0];
  
  curso.dias.forEach(dia => {
    const diasBtns = document.querySelectorAll('.group-frecuencia button');
  diasBtns.forEach(b => {
    if(b.textContent === dia) {
      b.classList.add("btn-dia-seleccionado");
      b.style.backgroundColor = '#A0A1C8';
    }
  });
  });
}

function getFormValue(){
  const nombre = document.querySelector('input[name="input-nombre-curso"]').value.trim();
  let horaInicio = document.querySelector('input[name="input-horario-inicio"]').value;
  let horaInicioSplit = horaInicio.split(':');
  const inicio = []
  if(horaInicioSplit[0]>=12) {
    inicio.push(horaInicio, 'PM');
  }
  else{
    inicio.push(horaInicio, 'AM');
  }

  let horaFin = document.querySelector('input[name="input-horario-fin"]').value;
  let horaFinSplit = horaFin.split(':');
  const fin = [];
  if(horaFinSplit[0]>=12) {
    fin.push(horaFin, 'PM');
  }
  else{
    fin.push(horaFin, 'AM');
  }

  const diasBtns = document.querySelectorAll('.group-frecuencia button');
  const dias = [...diasBtns]
    .filter(b => b.classList.contains("btn-dia-seleccionado"))
    .map(b => b.textContent);
  ;
  return {nombre,inicio,fin,dias};
}

function renderCard(curso){
  const card = document.createElement('article');
  card.className = 'card-curso';
  const diasTexto = curso.dias.length ? curso.dias.join(' • ') : 'Sin frecuencia';
  card.dataset.id = curso.id;
  card.innerHTML = `
    <h3>Curso: ${curso.nombre}</h3>
    <p>Horario: ${curso.inicio[0] || '--:--'} ${curso.inicio[1]} – ${curso.fin[0] || '--:--'} ${curso.fin[1]}</p>
    <p>Frecuencia: ${diasTexto}</p>
    <div class="grupo-botones-card-curso">
    <button class="btn-editar-card-curso">Editar</button>
    <button class="btn-eliminar-card-curso">Eliminar</button>
    </div>
  `;

  const btnEliminar = card.querySelector('.btn-eliminar-card-curso');
  btnEliminar.addEventListener('click', function() {
  const idx = cursos.findIndex(c => c.id === curso.id);
  if(idx !== -1){
    cursos.splice(idx, 1);
  } 
  renderAll(); 
  console.log("Eliminar curso");
  });

  const btnEditar = card.querySelector('.btn-editar-card-curso');
  btnEditar.addEventListener('click', function() {
    const idx = cursos.findIndex(c => c.id === curso.id);
      if(idx !== -1){
        resetFormValue();
        let cursoActual = cursos[idx];
        putFormValue(cursoActual);
        mostrarFormulario.removeAttribute("hidden");
      } 
      renderAll(); 
      onGuardar = () => {
        const {nombre,inicio,fin,dias} = getFormValue();
        cursoEditado = cursos[idx];
        cursoEditado.nombre = nombre;
        cursoEditado.inicio = inicio;
        cursoEditado.fin = fin;
        cursoEditado.dias = dias;
        renderAll();
        mostrarFormulario.setAttribute('hidden', '');
        resetFormValue();
        console.log("Curso Editado y Actualizado");
      };
    console.log("Editar curso");
  });

  return card;
}

function renderAll(){
  listaCursos.innerHTML = "";
  cursos.forEach(c => listaCursos.appendChild(renderCard(c)));
}


btnGuardarFormulario.addEventListener("click", function () {
  onGuardar();
});

btnCancelarFormulario.addEventListener("click", function () {
    mostrarFormulario.setAttribute('hidden', '');
    console.log("Formulario cerrado");
});

btnAddCurso.addEventListener("click", function () {
    resetFormValue();
    mostrarFormulario.removeAttribute("hidden");
    onGuardar = () => {
      const {nombre,inicio,fin,dias} = getFormValue();
      const nuevo = {
        id:String(Date.now()),
        nombre,
        inicio,
        fin,
        dias
      };
      cursos.push(nuevo);
      renderAll();
      mostrarFormulario.setAttribute('hidden', '');
      resetFormValue();
      console.log("Curso Nuevo creado");
    };
    console.log("Activar Formulario");
});

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
