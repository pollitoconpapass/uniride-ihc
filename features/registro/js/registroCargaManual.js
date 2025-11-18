const btnManual = document.getElementById("btn-manual-carga-manual");
const btnMasiva = document.getElementById("btn-masiva-carga-manual");
const mostrarFormulario = document.getElementById("modal-curso");
const btnAddCurso = document.getElementById("btnAddCurso");
const btnCancelarFormulario = document.getElementById("btnCancelFormulario");
const btnGuardarFormulario = document.getElementById("btnGuardarFormulario");
const listaCursos = document.getElementById("listaCursos");
const btnContinuar = document.getElementById("btnContinuar");
const btnVolver = document.querySelector(".contenedor-icon");

const cursos = [];
let onGuardar = null;

// ---------------------------
// CARGAR CURSOS DEL USUARIO
// ---------------------------
window.addEventListener("DOMContentLoaded", function () {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

  if (!usuarioIncompleto) return;

  if (Array.isArray(usuarioIncompleto.cursos)) {
    cursos.length = 0;
    usuarioIncompleto.cursos.forEach(c => {
      cursos.push({
        id: c.id || crypto.randomUUID(),
        nombre: c.nombre,
        inicio: c.inicio,
        fin: c.fin,
        dias: c.dias || []
      });
    });
    renderAll();
  }
});

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
      if (b.textContent === dia) {
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
  const inicio = [];
  if (horaInicioSplit[0] >= 12) {
    inicio.push(horaInicio, 'PM');
  } else {
    inicio.push(horaInicio, 'AM');
  }

  let horaFin = document.querySelector('input[name="input-horario-fin"]').value;
  let horaFinSplit = horaFin.split(':');
  const fin = [];
  if (horaFinSplit[0] >= 12) {
    fin.push(horaFin, 'PM');
  } else {
    fin.push(horaFin, 'AM');
  }

  const diasBtns = document.querySelectorAll('.group-frecuencia button');
  const dias = [...diasBtns]
    .filter(b => b.classList.contains("btn-dia-seleccionado"))
    .map(b => b.textContent);

  return { nombre, inicio, fin, dias };
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
      <button type="button" class="btn-editar-card-curso">Editar</button>
      <button type="button" class="btn-eliminar-card-curso">Eliminar</button>
    </div>
  `;

  const btnEliminar = card.querySelector('.btn-eliminar-card-curso');
  btnEliminar.addEventListener('click', function() {
    const idx = cursos.findIndex(c => c.id === curso.id);
    if (idx !== -1) {
      cursos.splice(idx, 1);
    }
    renderAll(); 
    console.log("Eliminar curso");
  });

  const btnEditar = card.querySelector('.btn-editar-card-curso');
  btnEditar.addEventListener('click', function() {
    const idx = cursos.findIndex(c => c.id === curso.id);
    if (idx !== -1) {
      resetFormValue();
      let cursoActual = cursos[idx];
      putFormValue(cursoActual);
      mostrarFormulario.removeAttribute("hidden");
    }
    onGuardar = () => {
      const { nombre, inicio, fin, dias } = getFormValue();
      const cursoEditado = cursos[idx];
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
  if (typeof onGuardar === "function") {
    onGuardar();
  }
});

btnCancelarFormulario.addEventListener("click", function () {
  mostrarFormulario.setAttribute('hidden', '');
  console.log("Formulario cerrado");
});

btnAddCurso.addEventListener("click", function () {
  resetFormValue();
  mostrarFormulario.removeAttribute("hidden");
  onGuardar = () => {
    const { nombre, inicio, fin, dias } = getFormValue();
    const nuevo = {
      id: crypto.randomUUID(),
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
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

  if (!usuarioIncompleto) {
    alert("No se encontró un usuario en proceso de registro.");
    window.location.href = "registroCargaMasiva.html";
    return;
  }

  // 1) Guardar cursos en el usuario
  usuarioIncompleto.cursos = [...cursos];
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  window.location.href = "registroCargaMasiva.html";
});

function prepararDia(btn, nombreDia) {
  btn.addEventListener('click', () => {
    const activado = btn.classList.toggle("btn-dia-seleccionado");

    if (activado) {
      btn.style.backgroundColor = '#A0A1C8';
      console.log(`${nombreDia} activado`);
    } else {
      btn.style.backgroundColor = '';
      console.log(`${nombreDia} desactivado`);
    }
  });
}

prepararDia(document.getElementById('lunes'), 'Lunes');
prepararDia(document.getElementById('martes'), 'Martes');
prepararDia(document.getElementById('miercoles'), 'Miércoles');
prepararDia(document.getElementById('jueves'), 'Jueves');
prepararDia(document.getElementById('viernes'), 'Viernes');
prepararDia(document.getElementById('sabado'), 'Sábado');
prepararDia(document.getElementById('domingo'), 'Domingo');

// ---------------------------
// BOTÓN CONTINUAR → SEGÚN ROL
// ---------------------------
btnContinuar.addEventListener("click", function () {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

  if (!usuarioIncompleto) {
    alert("No se encontró un usuario en proceso de registro.");
    return;
  }

  // 1) Guardar cursos en el usuario
  usuarioIncompleto.cursos = [...cursos];

  const rol = usuarioIncompleto.rol;

  if (!rol) {
    alert("Aún no has seleccionado un rol. Vuelve a la pantalla anterior.");
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    window.location.href = "registroSeleccionarRol.html";
    return;
  }

  if (rol === "pasajero") {
    // 2A) Pasajero → completar registro
    usuarioIncompleto.registroCompleto = true;

    // eliminar datosVehiculares si existe
    if ("datosVehiculares" in usuarioIncompleto) {
      delete usuarioIncompleto.datosVehiculares;
    }

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Registro completado con éxito. Inicia sesión.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";

  } else if (rol === "conductor") {
    // 2B) Conductor → falta datos vehiculares, sigue incompleto
    usuarioIncompleto.registroCompleto = false;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    window.location.href = "registroDatosVehiculares.html";
  } else {
    // Rol raro / inesperado
    alert("Rol no válido. Vuelve a seleccionar tu rol.");
    window.location.href = "registroSeleccionarRol.html";
  }
});

// ---------------------------
// BOTÓN VOLVER (retroceder)
// ---------------------------
btnVolver.addEventListener("click", function () {
  window.location.href = "registroSeleccionarRol.html";
});
