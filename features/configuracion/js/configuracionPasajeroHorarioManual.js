console.log("JS de configuracionPasajeroHorarioManual.js CARGADO");

// INFO GENERAL (sidebar)
document.addEventListener("DOMContentLoaded", () => {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.id === usuarioActivo.id_usuario);

    if (!usuario) {
        console.warn("No se encontró al usuario activo en la base de usuarios");
        return;
    }

    const dp = usuario.datosPersonales || {};

    const sidebarNombre = document.getElementById("sidebarNombre");
    if (sidebarNombre) {
        sidebarNombre.innerText = (dp.nombres || "").split(" ")[0] || "";
    }

    const tituloNombre = document.getElementById("tituloNombre");
    if (tituloNombre) {
        tituloNombre.innerText = (dp.nombres || "").split(" ")[0] || "";
    }

    const carreraTexto = document.getElementById("carrera");
    if (carreraTexto) {
        carreraTexto.textContent = dp.carrera || "No especificado";
    }

    const universidadTexto = document.getElementById("universidad");
    if (universidadTexto) {
        universidadTexto.textContent = dp.universidad || "No especificada";
    }
});

const btnManual = document.getElementById("btn-manual-carga-manual");
const btnMasiva = document.getElementById("btn-masiva-carga-manual");
const mostrarFormulario = document.getElementById("modal-curso");
const btnAddCurso = document.getElementById("btnAddCurso");
const btnCancelarFormulario = document.getElementById("btnCancelFormulario");
const btnGuardarFormulario = document.getElementById("btnGuardarFormulario");
const listaCursos = document.getElementById("listaCursos");
const btnGuardarCurso = document.getElementById("btnGuardarCurso");

// Inputs del mini-formulario
const inputNombreCurso = document.querySelector('input[name="input-nombre-curso"]');
const inputHoraInicio = document.querySelector('input[name="input-horario-inicio"]');
const inputHoraFin = document.querySelector('input[name="input-horario-fin"]');

const cursos = [];   // aquí viven los cursos en memoria
let onGuardar = null;

// Para manejar usuario activo
let usuarios = [];
let usuarioActual = null;

// ---------------------------
// HELPERS
// ---------------------------
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

  if (estaVacio(nombre) || estaVacio(horaInicio) || estaVacio(horaFin)) {
    alert("Por favor, completa el nombre del curso y ambos horarios (inicio y fin).");
    return false;
  }

  if (diasSeleccionados.length === 0) {
    alert("Selecciona al menos un día de la semana para la frecuencia del curso.");
    return false;
  }

  if (horaFin <= horaInicio) {
    alert("La hora de fin debe ser mayor que la hora de inicio.");
    return false;
  }

  return true;
}

// ---------------------------
// CARGAR CURSOS DEL USUARIO ACTIVO
// ---------------------------
window.addEventListener("DOMContentLoaded", () => {
  // 1) Leer usuario-activo
  const usuarioActivoLS = JSON.parse(localStorage.getItem("usuario-activo") || "null");

  if (!usuarioActivoLS || !usuarioActivoLS.id_usuario) {
    alert("No hay un usuario activo. Por favor, inicia sesión.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  // 2) Leer lista de usuarios
  usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // 3) Buscar usuario por id
  usuarioActual = usuarios.find(u => u.id === usuarioActivoLS.id_usuario);

  if (!usuarioActual) {
    alert("No se encontró la información del usuario activo. Por favor, inicia sesión nuevamente.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  // 4) Cargar cursos si tiene
  if (Array.isArray(usuarioActual.cursos)) {
    cursos.length = 0;
    usuarioActual.cursos.forEach(c => {
      cursos.push({
        id: c.id || String(Date.now()),
        nombre: c.nombre,
        inicio: c.inicio,
        fin: c.fin,
        dias: c.dias || []
      });
    });
    renderAll();
  }

  console.log("📌 Cursos del usuario activo (configuración pasajero):", cursos);

  // 5) Configurar restricción en hora fin según hora inicio
  if (inputHoraInicio && inputHoraFin) {
    inputHoraInicio.addEventListener("change", () => {
      inputHoraFin.min = inputHoraInicio.value || "";
      if (inputHoraFin.value && inputHoraFin.value < inputHoraFin.min) {
        inputHoraFin.value = "";
      }
    });
  }
});

// ---------------------------
// NAVEGACIÓN
// ---------------------------

btnManual.addEventListener("click", function () {
  btnManual.classList.add("btn-seleccionar-rol-seleccionado");
  btnMasiva.classList.remove("btn-seleccionar-rol-seleccionado");
  console.log("Botón Manual presionado");
});

btnMasiva.addEventListener("click", function () {
  btnMasiva.classList.add("btn-seleccionar-rol-seleccionado");
  btnManual.classList.remove("btn-seleccionar-rol-seleccionado");
  console.log("Botón Masiva presionado");
  window.location.href = "configuracionPasajeroHorarioMasiva.html";
});

// ---------------------------
// FORMULARIO MODAL CURSO
// ---------------------------
function resetFormValue() {
  inputNombreCurso.value = '';
  inputHoraInicio.value = '';
  inputHoraFin.value = '';
  inputHoraFin.min = "";

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

function getFormValue() {
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

// ---------------------------
// RENDER DE CARDS
// ---------------------------
function renderCard(curso) {
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
  btnEliminar.addEventListener('click', function () {
    const idx = cursos.findIndex(c => c.id === curso.id);
    if (idx !== -1) {
      cursos.splice(idx, 1);
    }
    renderAll();
    console.log("Eliminar curso");
  });

  const btnEditar = card.querySelector('.btn-editar-card-curso');
  btnEditar.addEventListener('click', function () {
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

function renderAll() {
  listaCursos.innerHTML = "";
  cursos.forEach(c => listaCursos.appendChild(renderCard(c)));
}

// ---------------------------
// BOTONES DEL MODAL
// ---------------------------
btnGuardarFormulario.addEventListener("click", function () {
  if (typeof onGuardar === "function") {
    onGuardar();
  }
});

btnCancelarFormulario.addEventListener("click", function () {
  mostrarFormulario.setAttribute('hidden', '');
  resetFormValue();
  console.log("Formulario cerrado");
});

btnAddCurso.addEventListener("click", function () {
  resetFormValue();
  mostrarFormulario.removeAttribute("hidden");
  onGuardar = () => {
    // VALIDACIÓN ANTES DE CREAR
    if (!validarFormularioCurso()) return;

    const { nombre, inicio, fin, dias } = getFormValue();
    const nuevo = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
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

// ---------------------------
// DÍAS (toggle estilo)
// ---------------------------
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

prepararDia(document.getElementById('lunes'), 'Lunes');
prepararDia(document.getElementById('martes'), 'Martes');
prepararDia(document.getElementById('miercoles'), 'Miércoles');
prepararDia(document.getElementById('jueves'), 'Jueves');
prepararDia(document.getElementById('viernes'), 'Viernes');
prepararDia(document.getElementById('sabado'), 'Sábado');
prepararDia(document.getElementById('domingo'), 'Domingo');

// ---------------------------
// GUARDAR CURSOS → LOCALSTORAGE
// ---------------------------
btnGuardarCurso.addEventListener("click", function () {
  if (!usuarioActual) {
    alert("No se encontró el usuario activo. Intenta iniciar sesión nuevamente.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  usuarioActual.cursos = [...cursos];

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Cambios aplicados correctamente.");
});
