const btnRegresar = document.getElementById("btn-regresar"); // ahora es EDITAR
const btnGuardarCambios = document.getElementById("btn-guardar-cambios");

// Inputs
const inputModelo = document.getElementById("modelo-carro");
const inputMarca  = document.getElementById("marca-carro");
const inputColor  = document.getElementById("color-carro");
const inputPlaca  = document.getElementById("placa-carro");

// Función básica reutilizable
function estaVacio(valor) {
  return !valor || valor.trim() === "";
}

// -------------------------------------
// MODO EDICIÓN / SOLO LECTURA
// -------------------------------------
function setModoEdicion(activo) {
  const campos = [inputModelo, inputMarca, inputColor, inputPlaca];

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

  btnGuardarCambios.disabled = !activo;
  if (!activo) {
    btnGuardarCambios.style.opacity = "0.6";
    btnGuardarCambios.style.cursor = "not-allowed";
  } else {
    btnGuardarCambios.style.opacity = "1";
    btnGuardarCambios.style.cursor = "pointer";
  }
}

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

// Variables globales
let usuarios = [];
let usuarioActual = null;

// ------------------------------
// CARGAR USUARIO ACTIVO Y DATOS
// ------------------------------
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

  if (!usuarioActual.datosVehiculares) {
    usuarioActual.datosVehiculares = {
      modelo: "",
      marca: "",
      color: "",
      placa: ""
    };
  }

  rellenarFormulario(usuarioActual.datosVehiculares);

  // 🔒 Al cargar: modo solo lectura
  setModoEdicion(false);
});

function rellenarFormulario(vehiculo) {
  inputModelo.value = vehiculo.modelo || "";
  inputMarca.value  = vehiculo.marca  || "";
  inputColor.value  = vehiculo.color  || "";
  inputPlaca.value  = vehiculo.placa  || "";
}

// ------------------------------
// BOTÓN EDITAR (antes "Regresar")
// ------------------------------
btnRegresar.addEventListener("click", () => {
  setModoEdicion(true);
  console.log("🔓 Modo edición activado para datos vehiculares");
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

  if (btnGuardarCambios.disabled) {
    alert("Primero presiona el botón 'Editar' para modificar tus datos vehiculares.");
    return;
  }

  const modelo = (inputModelo.value || "").trim();
  const marca  = (inputMarca.value  || "").trim();
  const color  = (inputColor.value  || "").trim();
  const placa  = (inputPlaca.value  || "").trim();

  // ❌ Validación principal
  if (
    estaVacio(modelo) ||
    estaVacio(marca)  ||
    estaVacio(color)  ||
    estaVacio(placa)
  ) {
    alert("Por favor, completa todos los datos vehiculares antes de guardar.");
    return;
  }

  // ✅ Si llega aquí, todo ok
  usuarioActual.datosVehiculares = {
    modelo,
    marca,
    color,
    placa
  };

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Cambios aplicados correctamente.");
  rellenarFormulario(usuarioActual.datosVehiculares);
  setModoEdicion(false);
});
