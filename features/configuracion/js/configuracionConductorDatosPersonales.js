const btnRegresar = document.getElementById("btn-regresar"); // ahora es EDITAR
const btnGuardarCambios = document.getElementById("btn-guardar-cambios");

// Inputs
const inputNombres = document.querySelector('input[name="input-nombres"]');
const inputApellidoPaterno = document.querySelector('input[name="input-apellido-paterno"]');
const inputApellidoMaterno = document.querySelector('input[name="input-apellido-materno"]');
const inputNumeroCelular = document.querySelector('input[name="input-numero-celular"]');
const inputFechaNacimiento = document.querySelector('input[name="bday"]');
const inputDireccion = document.querySelector('input[name="input-direccion-domicilio"]');
const selectUniversidad = document.getElementById("id_universidad");
const selectCarrera = document.getElementById("id_carrera");

// INFO GENERAL (sidebar, títulos, etc.)
document.addEventListener("DOMContentLoaded", () => {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario-activo"));
    if (!usuarioActivo) {
        console.warn("No hay usuario activo...");
        return;
    }

    const usuariosLS = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuariosLS.find(u => u.id === usuarioActivo.id_usuario);

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

// -------------------------------------
// FUNCIONES DE VALIDACIÓN
// -------------------------------------

function estaVacio(valor) {
  return !valor || valor.trim() === "";
}

// Validar celular: exactamente 9 dígitos numéricos
function esCelularValido(numero) {
  if (!numero) return false;

  const soloNumeros = numero.replace(/\s+/g, "");
  const regex = /^\d{9}$/;
  return regex.test(soloNumeros);
}

// Calcular edad a partir de fecha "YYYY-MM-DD"
function calcularEdad(fechaStr) {
  const fechaNac = new Date(fechaStr);
  const hoy = new Date();

  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  return { edad, fechaNac, hoy };
}

// Formatear fecha a "YYYY-MM-DD"
function formatearFechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// -------------------------------------
// MODO EDICIÓN / SOLO LECTURA
// -------------------------------------
function setModoEdicion(activo) {
  const campos = [
    inputNombres,
    inputApellidoPaterno,
    inputApellidoMaterno,
    inputNumeroCelular,
    inputFechaNacimiento,
    inputDireccion,
    selectUniversidad,
    selectCarrera
  ];

  campos.forEach(campo => {
    if (!campo) return;
    campo.disabled = !activo;

    if (!activo) {
      campo.style.backgroundColor = "#f0f0f0";
      campo.style.color = "#555";
    } else {
      campo.style.backgroundColor = "#ffffff";
      campo.style.color = "#000";
    }
  });

  // Botón guardar solo activo en modo edición
  btnGuardarCambios.disabled = !activo;
  if (!activo) {
    btnGuardarCambios.style.opacity = "0.6";
    btnGuardarCambios.style.cursor = "not-allowed";
  } else {
    btnGuardarCambios.style.opacity = "1";
    btnGuardarCambios.style.cursor = "pointer";
  }
}

// Variables globales para manejar el usuario
let usuarios = [];
let usuarioActual = null;

// -------------------------------------
// CARGAR USUARIO ACTIVO, RELLENAR FORM,
// CONFIGURAR FECHA Y CELULAR EN TIEMPO REAL
// -------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const usuarioActivoLS = JSON.parse(localStorage.getItem("usuario-activo") || "null");

  if (!usuarioActivoLS || !usuarioActivoLS.id_usuario) {
    alert("No hay un usuario activo. Por favor, inicia sesión.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  usuarioActual = usuarios.find(u => u.id === usuarioActivoLS.id_usuario);

  if (!usuarioActual) {
    alert("No se encontró la información del usuario activo. Por favor, inicia sesión nuevamente.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  const datos = usuarioActual.datosPersonales || {};
  rellenarFormulario(datos);

  // Configurar límites de la fecha de nacimiento (15 a 90 años)
  if (inputFechaNacimiento) {
    const hoy = new Date();

    const maxFecha = new Date(
      hoy.getFullYear() - 15,
      hoy.getMonth(),
      hoy.getDate()
    );

    const minFecha = new Date(
      hoy.getFullYear() - 90,
      hoy.getMonth(),
      hoy.getDate()
    );

    inputFechaNacimiento.min = formatearFechaISO(minFecha);
    inputFechaNacimiento.max = formatearFechaISO(maxFecha);
  }

  // Validación en tiempo real del número de celular
  if (inputNumeroCelular) {
    inputNumeroCelular.addEventListener("input", function () {
      let valor = inputNumeroCelular.value.replace(/\D/g, ""); // solo dígitos
      if (valor.length > 9) {
        valor = valor.slice(0, 9); // máximo 9
      }
      inputNumeroCelular.value = valor;
    });
  }

  // 🔒 Al cargar la página: modo SOLO LECTURA
  setModoEdicion(false);
});

function rellenarFormulario(datos) {
  inputNombres.value = datos.nombres || "";
  inputApellidoPaterno.value = datos.apellidoPaterno || "";
  inputApellidoMaterno.value = datos.apellidoMaterno || "";

  const celularInicial = (datos.numeroCelular || "").replace(/\D/g, "").slice(0, 9);
  inputNumeroCelular.value = celularInicial;

  inputFechaNacimiento.value = datos.fechaNacimiento || "";
  inputDireccion.value = datos.direccionDomicilio || "";

  if (datos.universidad) {
    selectUniversidad.value = datos.universidad;
  }
  if (datos.carrera) {
    selectCarrera.value = datos.carrera;
  }
}

// -------------------------------------
// BOTÓN EDITAR (antes "Regresar")
// -------------------------------------
btnRegresar.addEventListener("click", function () {
  setModoEdicion(true);
  console.log("🔓 Modo edición activado para datos personales del conductor");
});

// -------------------------------------
// BOTÓN GUARDAR CAMBIOS
// -------------------------------------
btnGuardarCambios.addEventListener("click", function () {
  if (!usuarioActual) {
    alert("No se encontró el usuario activo. Intenta iniciar sesión nuevamente.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  if (btnGuardarCambios.disabled) {
    alert("Primero presiona el botón 'Editar' para modificar tus datos.");
    return;
  }

  const nombres = (inputNombres.value || "").trim();
  const apellidoPaterno = (inputApellidoPaterno.value || "").trim();
  const apellidoMaterno = (inputApellidoMaterno.value || "").trim();
  const numeroCelular = (inputNumeroCelular.value || "").trim();
  const fechaNacimiento = inputFechaNacimiento.value || "";
  const direccion = (inputDireccion.value || "").trim();
  const universidad = selectUniversidad.value;
  const carrera = selectCarrera.value;

  if (
    estaVacio(nombres) ||
    estaVacio(apellidoPaterno) ||
    estaVacio(apellidoMaterno) ||
    estaVacio(numeroCelular) ||
    estaVacio(fechaNacimiento) ||
    estaVacio(direccion)
  ) {
    alert("Por favor, completa todos los campos antes de guardar los cambios.");
    return;
  }

  if (!esCelularValido(numeroCelular)) {
    alert("El número de celular debe tener exactamente 9 dígitos numéricos.");
    return;
  }

  const { edad, fechaNac, hoy } = calcularEdad(fechaNacimiento);

  if (isNaN(fechaNac.getTime())) {
    alert("Por favor, ingresa una fecha de nacimiento válida.");
    return;
  }

  if (fechaNac > hoy) {
    alert("La fecha de nacimiento no puede ser una fecha futura.");
    return;
  }

  if (edad < 15) {
    alert("Solo se permiten usuarios de 15 años o más.");
    return;
  }

  if (edad > 90) {
    alert("Por favor, ingresa una fecha de nacimiento válida (edad menor o igual a 90 años).");
    return;
  }

  const nuevosDatos = {
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    numeroCelular,
    fechaNacimiento,
    direccionDomicilio: direccion,
    universidad,
    carrera
  };

  usuarioActual.datosPersonales = nuevosDatos;
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Cambios aplicados correctamente.");

  rellenarFormulario(usuarioActual.datosPersonales);
  setModoEdicion(false);
});
