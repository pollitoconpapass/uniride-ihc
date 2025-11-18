const btnRegresar = document.getElementById("btn-regresar");
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

// Variables globales para manejar el usuario
let usuarios = [];
let usuarioActual = null;

// -------------------------------------
// CARGAR USUARIO ACTIVO Y RELLENAR FORM
// -------------------------------------
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

  // 4) Rellenar el formulario con sus datos personales
  const datos = usuarioActual.datosPersonales || {};

  rellenarFormulario(datos);
});

function rellenarFormulario(datos) {
  inputNombres.value = datos.nombres || "";
  inputApellidoPaterno.value = datos.apellidoPaterno || "";
  inputApellidoMaterno.value = datos.apellidoMaterno || "";
  inputNumeroCelular.value = datos.numeroCelular || "";
  inputFechaNacimiento.value = datos.fechaNacimiento || "";
  inputDireccion.value = datos.direccionDomicilio || "";

  // Selects: si no hay valor guardado, dejamos el que ya está por defecto
  if (datos.universidad) {
    selectUniversidad.value = datos.universidad;
  }
  if (datos.carrera) {
    selectCarrera.value = datos.carrera;
  }
}

// -------------------------------------
// BOTÓN REGRESAR
// -------------------------------------
btnRegresar.addEventListener("click", function () {
  window.location.href = "configuracionConductorOpciones.html";
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

  // 1) Leer valores del formulario
  const nuevosDatos = {
    nombres: (inputNombres.value || "").trim(),
    apellidoPaterno: (inputApellidoPaterno.value || "").trim(),
    apellidoMaterno: (inputApellidoMaterno.value || "").trim(),
    numeroCelular: (inputNumeroCelular.value || "").trim(),
    fechaNacimiento: inputFechaNacimiento.value || "",
    direccionDomicilio: (inputDireccion.value || "").trim(),
    universidad: selectUniversidad.value,
    carrera: selectCarrera.value
  };

  // 2) Actualizar datosPersonales del usuario
  usuarioActual.datosPersonales = nuevosDatos;

  // 3) Guardar de nuevo el array de usuarios en localStorage
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  // 4) Avisar y recargar datos en el formulario (por si acaso)
  alert("Cambios aplicados correctamente.");
  rellenarFormulario(usuarioActual.datosPersonales);
});
