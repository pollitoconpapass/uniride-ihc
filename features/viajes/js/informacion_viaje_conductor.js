console.log("JS de información del viaje cargado");

const viajeGuardado = JSON.parse(localStorage.getItem("viajeGuardado"));

if (viajeGuardado) {
    document.querySelector(".section p:nth-child(2)").innerHTML = 
        `<strong>Fecha:</strong> ${viajeGuardado.fecha}`;

    document.querySelector(".section p:nth-child(3)").innerHTML = 
        `<strong>Hora de inicio:</strong> ${viajeGuardado.hora}`;

    document.querySelector(".section p:nth-child(4)").innerHTML = 
        `<strong>Punto de inicio:</strong> Por definir`;

    document.querySelector(".section p:nth-child(5)").innerHTML = 
        `<strong>Ruta:</strong> ${viajeGuardado.ruta}`;
} else {
    console.warn("No hay datos en LocalStorage");
}
