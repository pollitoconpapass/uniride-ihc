const btnRegresar = document.getElementById("btn-regresar");
const btnGuardarCambios = document.getElementById("btn-guardar-cambios");

// Inputs
const inputModelo = document.getElementById("modelo-carro");
const inputMarca  = document.getElementById("marca-carro");
const inputColor  = document.getElementById("color-carro");
const inputPlaca  = document.getElementById("placa-carro");

// Variables globales
let usuarios = [];
let usuarioActual = null;

// ------------------------------
// CARGAR USUARIO ACTIVO Y DATOS
// ------------------------------
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

  // (Opcional) verificar que sea conductor
  if (usuarioActual.rol !== "conductor") {
    console.warn("El usuario activo no es conductor, pero está en configuración de datos vehiculares.");
  }

  // 4) Asegurar que datosVehiculares exista
  if (!usuarioActual.datosVehiculares) {
    usuarioActual.datosVehiculares = {
      modelo: "",
      marca: "",
      color: "",
      placa: ""
    };
  }

  // 5) Rellenar el formulario
  rellenarFormulario(usuarioActual.datosVehiculares);
});

function rellenarFormulario(vehiculo) {
  inputModelo.value = vehiculo.modelo || "";
  inputMarca.value  = vehiculo.marca  || "";
  inputColor.value  = vehiculo.color  || "";
  inputPlaca.value  = vehiculo.placa  || "";
}

// ------------------------------
// BOTÓN REGRESAR
// ------------------------------
btnRegresar.addEventListener("click", () => {
  window.location.href = "configuracionConductorOpciones.html";
});

// ------------------------------
// BOTÓN GUARDAR CAMBIOS
// ------------------------------
btnGuardarCambios.addEventListener("click", () => {
  if (!usuarioActual) {
    alert("No se encontró el usuario activo. Intenta iniciar sesión nuevamente.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  // 1) Leer valores del formulario
  const nuevosDatosVehiculares = {
    modelo: (inputModelo.value || "").trim(),
    marca:  (inputMarca.value  || "").trim(),
    color:  (inputColor.value  || "").trim(),
    placa:  (inputPlaca.value  || "").trim()
  };

  // 2) Actualizar en el usuario
  usuarioActual.datosVehiculares = nuevosDatosVehiculares;

  // 3) Guardar en localStorage
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  // 4) Avisar y refrescar formulario
  alert("Cambios aplicados correctamente.");
  rellenarFormulario(usuarioActual.datosVehiculares);
});
