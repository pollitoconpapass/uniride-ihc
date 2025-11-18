const btn_back = document.getElementById("btn_back");
const btnIniciarSesion = document.getElementById("btn-iniciar-sesion");

// Volver al index
btn_back.addEventListener("click", function () {
  window.location.href = "../../../index.html";
});

// -------------------------------------------
// INICIAR SESIÓN
// -------------------------------------------
btnIniciarSesion.addEventListener("click", function (event) {
  event.preventDefault(); // Evita que el form recargue la página

  const correoInput = document.querySelector('input[name="input-correo-institucional"]').value.trim();
  const passwordInput = document.querySelector('input[name="input-contraseña"]').value;

  if (!correoInput || !passwordInput) {
    alert("Por favor, ingresa tu correo y contraseña.");
    return;
  }

  // 1) Traer usuarios del localStorage
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // 2) Filtrar solo usuarios con registroCompleto = true
  const usuariosCompletos = usuarios.filter(u => u.registroCompleto === true);

  if (usuariosCompletos.length === 0) {
    alert("No hay usuarios registrados. Regístrate primero.");
    return;
  }

  // 3) Buscar usuario con correo y contraseña
  const usuarioEncontrado = usuariosCompletos.find(
    u => u.correo === correoInput && u.contraseña === passwordInput
  );

  if (!usuarioEncontrado) {
    alert("Correo o contraseña incorrectos.");
    return;
  }

  // 4) Crear / actualizar usuario-activo en localStorage
  const usuarioActivo = {
    id_usuario: usuarioEncontrado.id
  };

  localStorage.setItem("usuario-activo", JSON.stringify(usuarioActivo));

  // 5) Redirigir según rol
  if (usuarioEncontrado.rol === "conductor") {
    window.location.href = "../../principal/pages/principalConductor.html";
  } else if (usuarioEncontrado.rol === "pasajero") {
    window.location.href = "../../principal/pages/principalPasajero.html";
  } else {
    alert("Tu rol no es válido. Contacta con soporte o vuelve a registrarte.");
  }
});