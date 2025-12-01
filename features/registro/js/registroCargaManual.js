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

// Inputs del mini-formulario
const inputNombreCurso = document.querySelector('input[name="input-nombre-curso"]');
const inputHoraInicio = document.querySelector('input[name="input-horario-inicio"]');
const inputHoraFin = document.querySelector('input[name="input-horario-fin"]');

// -------------------------------------
// Helpers
// -------------------------------------
function estaVacio(valor) {
  return !valor || valor.trim() === "";
}

// Validar datos del mini-formulario ANTES de guardar
function validarFormularioCurso() {
  const nombre = (inputNombreCurso.value || "").trim();
  const horaInicio = inputHoraInicio.value;
  const horaFin = inputHoraFin.value;

  const diasBtns = document.querySelectorAll('.group-frecuencia button');
  const diasSeleccionados = [...diasBtns].filter(b =>
    b.classList.contains("btn-dia-seleccionado")
  );

  // Campos vacíos
  if (estaVacio(nombre) || estaVacio(horaInicio) || estaVacio(horaFin)) {
    alert("Por favor, completa el nombre del curso y ambos horarios (inicio y fin).");
    return false;
  }

  // Al menos un día seleccionado
  if (diasSeleccionados.length === 0) {
    alert("Selecciona al menos un día de la semana para la frecuencia del curso.");
    return false;
  }

  // Hora inicio < hora fin
  // Los inputs type="time" devuelven "HH:MM" en formato 24h, se puede comparar como string
  if (horaFin <= horaInicio) {
    alert("La hora de fin debe ser mayor que la hora de inicio.");
    return false;
  }

  return true;
}

// -------------------------------------
// CARGAR CURSOS DEL USUARIO
// -------------------------------------
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

  // Configurar restricción en hora fin según hora inicio
  if (inputHoraInicio && inputHoraFin) {
    inputHoraInicio.addEventListener("change", () => {
      // Cuando cambie la hora de inicio, la hora fin mínima será esa
      inputHoraFin.min = inputHoraInicio.value || "";
      // Si ya había una hora fin menor, la limpiamos
      if (inputHoraFin.value && inputHoraFin.value < inputHoraFin.min) {
        inputHoraFin.value = "";
      }
    });
  }
});

function resetFormValue(){
  inputNombreCurso.value = '';
  inputHoraInicio.value = '';
  inputHoraFin.value = '';
  inputHoraFin.min = ""; // reset min

  const diasBtns = document.querySelectorAll('.group-frecuencia button');
  diasBtns.forEach(b => {
    b.classList.remove("btn-dia-seleccionado");
    b.style.backgroundColor = '';
  });
}

function putFormValue(curso) {
  inputNombreCurso.value = curso.nombre;
  inputHoraInicio.value = curso.inicio[0] || "";
  inputHoraFin.value = curso.fin[0] || "";

  // Ajustar min de fin en base a inicio
  if (inputHoraInicio.value) {
    inputHoraFin.min = inputHoraInicio.value;
  }

  const diasBtns = document.querySelectorAll('.group-frecuencia button');
  diasBtns.forEach(b => {
    if (curso.dias.includes(b.textContent)) {
      b.classList.add("btn-dia-seleccionado");
      b.style.backgroundColor = '#A0A1C8';
    } else {
      b.classList.remove("btn-dia-seleccionado");
      b.style.backgroundColor = '';
    }
  });
}

function getFormValue(){
  const nombre = (inputNombreCurso.value || "").trim();

  let horaInicio = inputHoraInicio.value;
  let horaInicioSplit = horaInicio.split(':');
  const inicio = [];
  if (horaInicioSplit[0] >= 12) {
    inicio.push(horaInicio, 'PM');
  } else {
    inicio.push(horaInicio, 'AM');
  }

  let horaFin = inputHoraFin.value;
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
      // VALIDACIÓN ANTES DE EDITAR
      if (!validarFormularioCurso()) return;

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

// Guardar del mini-formulario
btnGuardarFormulario.addEventListener("click", function () {
  if (typeof onGuardar === "function") {
    onGuardar();
  }
});

// Cancelar del mini-formulario
btnCancelarFormulario.addEventListener("click", function () {
  mostrarFormulario.setAttribute('hidden', '');
  resetFormValue();
  console.log("Formulario cerrado");
});

// Abrir mini-formulario para AGREGAR
btnAddCurso.addEventListener("click", function () {
  resetFormValue();
  mostrarFormulario.removeAttribute("hidden");
  onGuardar = () => {
    // VALIDACIÓN ANTES DE CREAR
    if (!validarFormularioCurso()) return;

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

  // Guardar cursos en el usuario
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

  usuarioIncompleto.cursos = [...cursos];

  const rol = usuarioIncompleto.rol;

  if (!rol) {
    alert("Aún no has seleccionado un rol. Vuelve a la pantalla anterior.");
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    window.location.href = "registroSeleccionarRol.html";
    return;
  }

  if (rol === "pasajero") {
    usuarioIncompleto.registroCompleto = true;

    if ("datosVehiculares" in usuarioIncompleto) {
      delete usuarioIncompleto.datosVehiculares;
    }

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Registro completado con éxito. Inicia sesión.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";

  } else if (rol === "conductor") {
    usuarioIncompleto.registroCompleto = false;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    window.location.href = "registroDatosVehiculares.html";
  } else {
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
