// ================== REFERENCIAS A ELEMENTOS ==================
const btnManual = document.getElementById("btn-manual-carga-masiva");
const btnMasiva = document.getElementById("btn-masiva-carga-masiva");
const btnContinuar = document.getElementById("btnContinuar");
const btnVolver = document.querySelector(".contenedor-icon");
const btnAdjuntar = document.querySelector(".contenedor-adjuntar-img");

// Representa los cursos del usuario en localStorage
const cursosUsuario = [];

// ================== INPUT FILE OCULTO (SOLO PARA LEER PDF) ==================
const inputFile = document.createElement("input");
inputFile.type = "file";
inputFile.accept = "application/pdf";
inputFile.style.display = "none";
document.body.appendChild(inputFile);

// ================== COMPROBAR LIBRERÍAS ==================
if (!window.pdfjsLib) {
  console.error("❌ pdf.js no está cargado. Agrega el <script> de pdf.js en el HTML.");
}
if (!window.Tesseract) {
  console.error("❌ Tesseract.js no está cargado. Agrega el <script> de Tesseract en el HTML.");
}

// Config worker de pdf.js (si existe)
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
}

// ================== CARGAR CURSOS EXISTENTES DEL USUARIO ==================
window.addEventListener("DOMContentLoaded", () => {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

  if (!usuarioIncompleto || !Array.isArray(usuarioIncompleto.cursos)) return;

  cursosUsuario.length = 0;
  usuarioIncompleto.cursos.forEach(c => cursosUsuario.push(c));

  console.log("📌 Cursos ya existentes del usuario:", cursosUsuario);
});

// ================== ADJUNTAR PDF: CLICK BOTÓN → ABRIR SELECTOR ==================
btnAdjuntar.addEventListener("click", () => {
  inputFile.value = ""; // limpiar selección anterior
  inputFile.click();
});

// ================== LECTURA DEL PDF + OCR + JSON ==================
inputFile.addEventListener("change", async () => {
  const file = inputFile.files[0];
  if (!file) return;

  console.log("📄 Archivo seleccionado:", file.name);

  if (!window.pdfjsLib || !window.Tesseract) {
    console.error("Faltan pdf.js o Tesseract.js para procesar el PDF.");
    return;
  }

  try {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    let textoOCR = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 }); // más resolución para mejor OCR

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Renderizar página en el canvas
      await page.render({ canvasContext: ctx, viewport }).promise;

      console.log(`🔍 Reconociendo texto de la página ${pageNum}/${pdf.numPages}...`);

      // OCR con Tesseract (idioma español)
      const result = await Tesseract.recognize(canvas, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(
              `P${pageNum}: ${Math.round(m.progress * 100)}%`
            );
          }
        },
      });

      textoOCR += result.data.text + "\n";
    }

    console.log("===== TEXTO OCR DEL PDF =====");
    console.log(textoOCR);

    const jsonHorario = parseHorarioTexto(textoOCR);

    console.log("===== CURSOS (OCURRENCIAS POR DÍA) =====");
    console.log(JSON.stringify(jsonHorario.cursos, null, 2));

    console.log("===== CURSOS DETECTADOS (AGRUPADOS) =====");
    console.log(JSON.stringify(jsonHorario.cursosDetectados, null, 2));

    // 💾 Guardar cursosDetectados en localStorage del usuario
    guardarCursosDetectadosEnLocalStorage(jsonHorario.cursosDetectados);

  } catch (error) {
    console.error("Error al procesar el PDF con OCR:", error);
  }
});

// ================== AGRUPAR CURSOS POR NOMBRE + HORARIO ==================
function agruparCursosPorNombreYHorario(cursos) {
  const mapa = new Map(); 
  // key: "nombreCurso||HH:MM||HH:MM"

  for (const c of cursos) {
    const key = `${c.nombreCurso}||${c.horarioInicio}||${c.horarioFin}`;

    if (!mapa.has(key)) {
      mapa.set(key, {
        idCurso: crypto.randomUUID(),   // id único
        nombreCurso: c.nombreCurso,
        horarioInicio: c.horarioInicio,
        marcadorHorarioInicio: c.marcadorHorarioInicio,
        horarioFin: c.horarioFin,
        marcadorHorarioFin: c.marcadorHorarioFin,
        frecuencia: []                  // llenamos abajo
      });
    }

    const cursoDetectado = mapa.get(key);

    // Evitar duplicar días
    if (!cursoDetectado.frecuencia.includes(c.dia)) {
      cursoDetectado.frecuencia.push(c.dia);
    }
  }

  return Array.from(mapa.values());
}

// ================== PARSER: TEXTO → JSON DE HORARIO ==================
function parseHorarioTexto(texto) {
  // 1) Limpiamos líneas
  const lineas = texto
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let diaActual = null;
  const cursos = [];

  const diasAbreviatura = {
    "Lunes": "L",
    "Martes": "M",
    "Miércoles": "Mi",
    "Miercoles": "Mi",
    "Jueves": "J",
    "Viernes": "V",
    "Sábado": "S",
    "Sabado": "S",
    "Domingo": "D",
  };

  for (let linea of lineas) {
    // --- LIMPIEZA BÁSICA AL INICIO ---
    linea = linea.replace(/^[|•\-]+/, "").trim();

    // 1) DETECCIÓN DE DÍA
    const mDia = linea.match(
      /^(Lunes|Martes|Mi[eé]rcoles|Jueves|Viernes|S[áa]bado|Domingo)\s+(\d{1,2})/i
    );
    if (mDia) {
      const nombreDia = mDia[1];
      if (/mi[eé]rcoles/i.test(nombreDia)) {
        diaActual = "Miercoles";
      } else if (/s[áa]bado/i.test(nombreDia)) {
        diaActual = "Sabado";
      } else {
        diaActual = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1).toLowerCase();
      }
      continue;
    }

    if (!diaActual) continue;

    // 2) DETECCIÓN DE CURSO
    const lineaSinBarra = linea.replace(/^\|\s*/, "");

    // Opción A: NOMBRE - CODIGO HH:MM - HH:MM ...
    let mCurso = lineaSinBarra.match(
      /^(.+?)\s*-\s*([0-9A-Z]{3,})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i
    );

    let nombreRaw, horaInicio, horaFin;

    if (mCurso) {
      nombreRaw   = mCurso[1];
      horaInicio  = mCurso[3];
      horaFin     = mCurso[4];
    } else {
      // Opción B: NOMBRE - HH:MM - HH:MM (sin código)
      const mCursoSinCodigo = lineaSinBarra.match(
        /^(.+?)\s*-\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i
      );
      if (!mCursoSinCodigo) {
        continue;
      }
      nombreRaw   = mCursoSinCodigo[1];
      horaInicio  = mCursoSinCodigo[2];
      horaFin     = mCursoSinCodigo[3];
    }

    let nombreCurso = nombreRaw
      .replace(/^\|?\s*/, "")
      .toLowerCase();
    nombreCurso = nombreCurso.charAt(0).toUpperCase() + nombreCurso.slice(1);

    const diaAbrev = diasAbreviatura[diaActual];
    const marcadorInicio = horaInicio > "12:00" ? "PM" : "AM";
    const marcadorFin    = horaFin    > "12:00" ? "PM" : "AM";

    cursos.push({
      nombreCurso,
      dia: diaAbrev,
      horarioInicio: horaInicio,
      marcadorHorarioInicio: marcadorInicio,
      horarioFin: horaFin,
      marcadorHorarioFin: marcadorFin,
    });
  }

  const cursosDetectados = agruparCursosPorNombreYHorario(cursos);

  return {
    cursos,
    cursosDetectados
  };
}

// ================== GUARDAR cursosDetectados EN LOCALSTORAGE ==================
function guardarCursosDetectadosEnLocalStorage(cursosDetectados) {
  if (!Array.isArray(cursosDetectados) || cursosDetectados.length === 0) {
    alert("No se detectaron cursos en el horario. Revisa el PDF o intenta nuevamente.");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIncompleto = usuarios.find(u => u.registroCompleto === false);

  if (!usuarioIncompleto) {
    alert("No se encontró un usuario en proceso de registro.");
    return;
  }

  if (!Array.isArray(usuarioIncompleto.cursos)) {
    usuarioIncompleto.cursos = [];
  }

  // Mapear cursosDetectados al formato que usa cargaManual:
  // { id, nombre, inicio: [hora, AM/PM], fin: [hora, AM/PM], dias: [] }
  cursosDetectados.forEach(cd => {
    const cursoManual = {
      id: cd.idCurso || crypto.randomUUID(),
      nombre: cd.nombreCurso,
      inicio: [cd.horarioInicio, cd.marcadorHorarioInicio],
      fin: [cd.horarioFin, cd.marcadorHorarioFin],
      dias: Array.isArray(cd.frecuencia) ? cd.frecuencia : []
    };

    usuarioIncompleto.cursos.push(cursoManual);
    cursosUsuario.push(cursoManual); // también lo reflejamos en la variable local
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Cursos subidos masivamente con exito, para verlos ve a Manual");
}

// ================== BOTÓN MANUAL → IR A CARGA MANUAL ==================
btnManual.addEventListener("click", function () {
  btnManual.classList.add("btn-seleccionar-rol-seleccionado");
  btnMasiva.classList.remove("btn-seleccionar-rol-seleccionado");

  console.log("Botón Manual presionado");

  window.location.href = "registroCargaManual.html";
});

// ================== BOTÓN MASIVA (solo estilo) ==================
btnMasiva.addEventListener("click", function () {
  btnMasiva.classList.add("btn-seleccionar-rol-seleccionado");
  btnManual.classList.remove("btn-seleccionar-rol-seleccionado");

  console.log("Botón Masiva presionado");
});

// ================== BOTÓN CONTINUAR → SEGÚN ROL ==================
btnContinuar.addEventListener("click", function () {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioIncompleto = usuarios.find((u) => u.registroCompleto === false);

  if (!usuarioIncompleto) {
    alert("No se encontró un usuario en proceso de registro.");
    return;
  }

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

// ================== BOTÓN RETROCEDER → REGRESAR A ELEGIR ROL ==================
btnVolver.addEventListener("click", function () {
  window.location.href = "registroSeleccionarRol.html";
});
