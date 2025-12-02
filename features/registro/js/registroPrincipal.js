// 1. Seleccionar botones
const btnContinuar = document.querySelector(".contenedor-next-icon");
const btnRetroceder = document.getElementById("btnRetroceder");

// Input específicos (para validación en tiempo real)
const inputCelular = document.querySelector('input[name="input-numero-celular"]');
const inputFechaNacimiento = document.querySelector('input[name="bday"]');

btnRetroceder.addEventListener("click", function () {
  window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
});

// -------------------------------------------
// FUNCIONES AUXILIARES
// -------------------------------------------

// Quitar espacios y verificar vacío
function estaVacio(valor) {
  return !valor || valor.trim() === "";
}

// Validar celular: exactamente 9 dígitos numéricos
function esCelularValido(numero) {
  if (!numero) return false;

  // Quitar espacios por si acaso
  const soloNumeros = numero.replace(/\s+/g, "");

  // Debe tener exactamente 9 caracteres y todos deben ser dígitos
  const regex = /^\d{9}$/;
  return regex.test(soloNumeros);
}

// Calcular edad a partir de la fecha (string "YYYY-MM-DD")
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

// -------------------------------------------
// CARGAR DATOS PERSONALES SI EXISTE USUARIO
// + CONFIGURAR RESTRICCIONES DE FECHA
// + VALIDACIÓN EN TIEMPO REAL
// -------------------------------------------
window.addEventListener("DOMContentLoaded", function () {

    // 1) Configurar límites de la fecha de nacimiento (15 a 90 años)
    if (inputFechaNacimiento) {
      const hoy = new Date();

      // Máximo: hoy - 15 años
      const maxFecha = new Date(
        hoy.getFullYear() - 15,
        hoy.getMonth(),
        hoy.getDate()
      );

      // Mínimo: hoy - 90 años
      const minFecha = new Date(
        hoy.getFullYear() - 90,
        hoy.getMonth(),
        hoy.getDate()
      );

      inputFechaNacimiento.min = formatearFechaISO(minFecha);
      inputFechaNacimiento.max = formatearFechaISO(maxFecha);
    }

    // 2) Cargar datos si hay usuario incompleto
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    if (usuarioIncompleto) {
        const datos = usuarioIncompleto.datosPersonales || {};

        // Rellenar inputs de esta página
        document.querySelector('input[name="input-nombres"]').value = datos.nombres || "";
        document.querySelector('input[name="input-apellido-paterno"]').value = datos.apellidoPaterno || "";
        document.querySelector('input[name="input-apellido-materno"]').value = datos.apellidoMaterno || "";
        document.querySelector('input[name="input-numero-celular"]').value = datos.numeroCelular || "";
        document.querySelector('input[name="bday"]').value = datos.fechaNacimiento || "";
        document.querySelector('input[name="input-direccion-domicilio"]').value = datos.direccionDomicilio || "";

        // Selects (usa los value reales de tu HTML)
        document.getElementById("id_universidad").value = datos.universidad || "UPC";
        document.getElementById("id_carrera").value = datos.carrera || "Administracion";
    }

    // 3) VALIDACIÓN EN TIEMPO REAL: CELULAR
    if (inputCelular) {
      inputCelular.addEventListener("input", function () {
        // Dejar solo dígitos
        let valor = inputCelular.value.replace(/\D/g, "");

        // Limitar a máximo 9 dígitos
        if (valor.length > 9) {
          valor = valor.slice(0, 9);
        }

        inputCelular.value = valor;
      });
    }

    // (La fecha ya tiene min y max, así que el propio input no dejará seleccionar fuera del rango)
});

// -------------------------------------------
// CLICK EN BOTÓN CONTINUAR
// -------------------------------------------
btnContinuar.addEventListener("click", function(event) {
    event.preventDefault(); // evita que el formulario recargue la página

    // --- 1. Obtener los inputs de datos personales ---
    const nombres = document.querySelector('input[name="input-nombres"]').value;
    const apellidoPaterno = document.querySelector('input[name="input-apellido-paterno"]').value;
    const apellidoMaterno = document.querySelector('input[name="input-apellido-materno"]').value;
    const numeroCelular = document.querySelector('input[name="input-numero-celular"]').value;
    const fechaNacimiento = document.querySelector('input[name="bday"]').value;
    const direccion = document.querySelector('input[name="input-direccion-domicilio"]').value;
    const universidad = document.querySelector('#id_universidad').value;
    const carrera = document.querySelector('#id_carrera').value;

    // -------------------------------------------
    // 2. VALIDACIONES AL ENVIAR
    // -------------------------------------------

    // 2.1. Validar campos vacíos (solo inputs que el user puede dejar en blanco)
    if (
      estaVacio(nombres) ||
      estaVacio(apellidoPaterno) ||
      estaVacio(apellidoMaterno) ||
      estaVacio(numeroCelular) ||
      estaVacio(fechaNacimiento) ||
      estaVacio(direccion)
    ) {
      alert("Por favor, completa todos los campos antes de continuar.");
      return; // no seguimos, no guardamos, no redirigimos
    }

    // 2.2. Validar número de celular (además del recorte en tiempo real)
    if (!esCelularValido(numeroCelular)) {
      alert("El número de celular debe tener exactamente 9 dígitos numéricos.");
      return;
    }

    // 2.3. Validar fecha de nacimiento (edad 15–90 y no futura)
    const { edad, fechaNac, hoy } = calcularEdad(fechaNacimiento);

    if (isNaN(fechaNac.getTime())) {
      alert("Por favor, ingresa una fecha de nacimiento válida.");
      return;
    }

    // Fecha futura (por si acaso)
    if (fechaNac > hoy) {
      alert("La fecha de nacimiento no puede ser una fecha futura.");
      return;
    }

    // Rango de edad
    if (edad < 15) {
      alert("Solo se permiten usuarios de 15 años o más.");
      return;
    }

    if (edad > 90) {
      alert("Por favor, ingresa una fecha de nacimiento válida (edad menor o igual a 90 años).");
      return;
    }

    // -------------------------------------------
    // 3. SI TODO ES VÁLIDO → GUARDAR Y SEGUIR
    // -------------------------------------------

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Buscar usuario incompleto (registroCompleto: false)
    let usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

    const nuevosDatosPersonales = {
        nombres: nombres.trim(),
        apellidoPaterno: apellidoPaterno.trim(),
        apellidoMaterno: apellidoMaterno.trim(),
        numeroCelular: numeroCelular.trim(),
        fechaNacimiento: fechaNacimiento,
        direccionDomicilio: direccion.trim(),
        universidad: universidad,
        carrera: carrera
    };

    if (usuarioIncompleto) {
        // --- SI YA EXISTE usuario incompleto → SOLO ACTUALIZAR ---
        usuarioIncompleto.datosPersonales = nuevosDatosPersonales;
    } else {
        // --- SI NO EXISTE → CREAR UNO NUEVO ---
        const nuevoUsuario = {
            id: crypto.randomUUID(),  // genera un id único
            correo: "",               // todavía no se llena
            contraseña: "",           // todavía no se llena
            rol: "",                  // todavía no se define
            registroCompleto: false,  // importante

            datosPersonales: nuevosDatosPersonales,

            cursos: [],               // se llenará después
            datosVehiculares: null    // solo si es conductor se llena luego
        };

        usuarios.push(nuevoUsuario);
    }

    // Guardar el array actualizado en localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Redirigir a la siguiente pantalla
    window.location.href = "registroSecundario.html";
});
