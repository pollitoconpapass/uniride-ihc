// Selección de elementos
const btnRetroceder = document.querySelector(".contenedor-icon");
const btnAceptar = document.querySelector(".btn_aceptar");
const btnVolver = document.querySelector(".btn_volver");

// Inputs
const inputModelo = document.getElementById("modelo-carro");
const inputMarca = document.getElementById("marca-carro");
const inputColor = document.getElementById("color-carro");
const inputPlaca = document.getElementById("placa-carro");

// -------------------------------------------
// CARGAR DATOS VEHICULARES SI YA EXISTEN
// -------------------------------------------
window.addEventListener("DOMContentLoaded", function () {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

  if (!usuarioIncompleto) {
    console.log("No se encontró usuario en proceso de registro.");
    return;
  }

  const vehiculo = usuarioIncompleto.datosVehiculares || null;

  if (vehiculo) {
    inputModelo.value = vehiculo.modelo || "";
    inputMarca.value = vehiculo.marca || "";
    inputColor.value = vehiculo.color || "";
    inputPlaca.value = vehiculo.placa || "";
  }
});

// -------------------------------------------
// VALIDACIÓN DE CAMPOS VACÍOS
// -------------------------------------------
function estaVacio(valor) {
  return !valor || valor.trim() === "";
}

// -------------------------------------------
// BOTÓN ACEPTAR → GUARDAR DATOS VEHICULARES
// -------------------------------------------
btnAceptar.addEventListener("click", function () {
  const modelo = inputModelo.value.trim();
  const marca = inputMarca.value.trim();
  const color = inputColor.value.trim();
  const placa = inputPlaca.value.trim();

  // VALIDACIÓN DE CAMPOS VACÍOS
  if (
    estaVacio(modelo) ||
    estaVacio(marca) ||
    estaVacio(color) ||
    estaVacio(placa)
  ) {
    alert("Por favor llena todos los datos del vehículo antes de continuar.");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

  if (!usuarioIncompleto) {
    alert("No se encontró un usuario en proceso de registro.");
    return;
  }

  // Actualizar datosVehiculares
  usuarioIncompleto.datosVehiculares = {
    modelo,
    marca,
    color,
    placa
  };

  // Marcar registro como completo
  usuarioIncompleto.registroCompleto = true;

  // Guardar en localStorage
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  // Redirección
  alert("Registro Completado, Ahora Inicia Sesión");
  window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
});

// -------------------------------------------
// BOTÓN RETROCEDER → VOLVER
// -------------------------------------------
btnRetroceder.addEventListener("click", function () {
  window.location.href = "registroCargaManual.html";
});

// -------------------------------------------
// LINK "¿Deseas volver?" → MISMO COMPORTAMIENTO
// -------------------------------------------
btnVolver.addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "registroCargaManual.html";
});
