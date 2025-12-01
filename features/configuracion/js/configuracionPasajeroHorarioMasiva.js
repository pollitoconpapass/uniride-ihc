console.log("JS configuracionPasajeroHorarioMasiva CARGADO");
// INFO GENERAL
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

    const dp = usuario.datosPersonales;

    document.getElementById("sidebarNombre").innerText = dp.nombres.split(" ")[0] || "";
    document.getElementById("tituloNombre").innerText = dp.nombres.split(" ")[0] || "";

    document.getElementById("carrera").textContent =
        dp.carrera || "No especificado";

    document.getElementById("universidad").textContent =
        dp.universidad || "No especificada";

});
// ================== REFERENCIAS A ELEMENTOS ==================
const btnManual   = document.getElementById("btn-manual-carga-masiva");
const btnMasiva   = document.getElementById("btn-masiva-carga-masiva");
const btnRegresar = document.getElementById("btn-regresar");
const btnAdjuntar = document.querySelector(".contenedor-adjuntar-img");

// Representa los cursos del usuario activo (solo referencia, por debug)
const cursosUsuario = [];

// Para manejar usuario activo
let usuariosGlobal = [];
let usuarioActual  = null;

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

// ================== CARGAR USUARIO ACTIVO Y SUS CURSOS ==================
window.addEventListener("DOMContentLoaded", () => {
  const usuarioActivoLS = JSON.parse(localStorage.getItem("usuario-activo") || "null");

  if (!usuarioActivoLS || !usuarioActivoLS.id_usuario) {
    alert("No hay un usuario activo. Por favor, inicia sesión.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  usuariosGlobal = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarioActual  = usuariosGlobal.find(u => u.id === usuarioActivoLS.id_usuario);

  if (!usuarioActual) {
    alert("No se encontró la información del usuario activo. Por favor, inicia sesión nuevamente.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  if (Array.isArray(usuarioActual.cursos)) {
    cursosUsuario.length = 0;
    usuarioActual.cursos.forEach(c => cursosUsuario.push(c));
  }

  console.log("📌 Cursos ya existentes del usuario (config):", cursosUsuario);
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
      const viewport = page.getViewport({ scale: 2 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      console.log(`🔍 Reconociendo texto de la página ${pageNum}/${pdf.numPages}...`);

      const result = await Tesseract.recognize(canvas, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`P${pageNum}: ${Math.round(m.progress * 100)}%`);
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

    // 💾 Guardar cursosDetectados en localStorage del usuario activo
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
        idCurso: crypto.randomUUID(),
        nombreCurso: c.nombreCurso,
        horarioInicio: c.horarioInicio,
        marcadorHorarioInicio: c.marcadorHorarioInicio,
        horarioFin: c.horarioFin,
        marcadorHorarioFin: c.marcadorHorarioFin,
        frecuencia: []
      });
    }

    const cursoDetectado = mapa.get(key);

    if (!cursoDetectado.frecuencia.includes(c.dia)) {
      cursoDetectado.frecuencia.push(c.dia);
    }
  }

  return Array.from(mapa.values());
}

// ================== PARSER: TEXTO → JSON DE HORARIO ==================
function parseHorarioTexto(texto) {
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
    linea = linea.replace(/^[|•\-]+/, "").trim();

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

    const lineaSinBarra = linea.replace(/^\|\s*/, "");

    let mCurso = lineaSinBarra.match(
      /^(.+?)\s*-\s*([0-9A-Z]{3,})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i
    );

    let nombreRaw, horaInicio, horaFin;

    if (mCurso) {
      nombreRaw  = mCurso[1];
      horaInicio = mCurso[3];
      horaFin    = mCurso[4];
    } else {
      const mCursoSinCodigo = lineaSinBarra.match(
        /^(.+?)\s*-\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/i
      );
      if (!mCursoSinCodigo) {
        continue;
      }
      nombreRaw  = mCursoSinCodigo[1];
      horaInicio = mCursoSinCodigo[2];
      horaFin    = mCursoSinCodigo[3];
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

// ================== GUARDAR cursosDetectados EN LOCALSTORAGE (USUARIO ACTIVO) ==================
function guardarCursosDetectadosEnLocalStorage(cursosDetectados) {
  if (!usuarioActual) {
    alert("No se encontró el usuario activo. Por favor, inicia sesión nuevamente.");
    window.location.href = "../../iniciar_sesion/pages/inicioSesion.html";
    return;
  }

  if (!Array.isArray(cursosDetectados) || cursosDetectados.length === 0) {
    alert("No se detectaron cursos en el horario. Revisa el PDF o intenta nuevamente.");
    return;
  }

  if (!Array.isArray(usuarioActual.cursos)) {
    usuarioActual.cursos = [];
  }

  cursosDetectados.forEach(cd => {
    const cursoManual = {
      id: cd.idCurso || crypto.randomUUID(),
      nombre: cd.nombreCurso,
      inicio: [cd.horarioInicio, cd.marcadorHorarioInicio],
      fin: [cd.horarioFin, cd.marcadorHorarioFin],
      dias: Array.isArray(cd.frecuencia) ? cd.frecuencia : []
    };

    usuarioActual.cursos.push(cursoManual);
    cursosUsuario.push(cursoManual);
  });

  localStorage.setItem("usuarios", JSON.stringify(usuariosGlobal));

  alert("Cursos subidos masivamente con exito, para verlos ve a Manual");
}

// ================== BOTONES NAVEGACIÓN ==================
btnManual.addEventListener("click", function () {
  btnManual.classList.add("btn-seleccionar-rol-seleccionado");
  btnMasiva.classList.remove("btn-seleccionar-rol-seleccionado");
  console.log("Botón Manual presionado");
  window.location.href = "configuracionPasajeroHorarioManual.html";
});

btnMasiva.addEventListener("click", function () {
  btnMasiva.classList.add("btn-seleccionar-rol-seleccionado");
  btnManual.classList.remove("btn-seleccionar-rol-seleccionado");
  console.log("Botón Masiva presionado");
});

btnRegresar.addEventListener("click", function () {
  window.location.href = "configuracionPasajeroOpciones.html";
});
