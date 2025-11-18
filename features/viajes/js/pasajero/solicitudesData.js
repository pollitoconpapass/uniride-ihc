// JSON local de solicitudes del pasajero
// Se guarda en localStorage para consulta entre pantallas
(function(){
  var STORAGE_KEY = 'pasajero_solicitudes';

  function getAll(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ return []; }
  }

  function saveAll(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list||[]));
  }

  function nextId(list){
    var max = 0;
    for (var i=0;i<list.length;i++){ if (list[i].id_solicitud>max) max = list[i].id_solicitud; }
    return max + 1;
  }

  function createSolicitud(payload){
    var list = getAll();
    var id = nextId(list);
    var now = new Date();
    var nueva = {
      id_solicitud: id,
      id_viaje: payload.id_viaje,
      pasajero: payload.pasajero || 'Jose',
      conductor: payload.conductor,
      horario: payload.horario, // '10:00 am 10/10/2025'
      estado: payload.estado || 'pendiente',
      metodo_compensacion: payload.metodo_compensacion || 'Pago en efectivo',
      monto_compensacion: payload.monto_compensacion || '0.00',
      punto_recogida: payload.punto_recogida || '',
      mensaje_opcional: payload.mensaje_opcional || '',
      creado_en: now.toISOString()
    };
    list.push(nueva);
    saveAll(list);
    return nueva;
  }

  window.PasajeroSolicitudesData = {
    storageKey: STORAGE_KEY,
    getAll: getAll,
    saveAll: saveAll,
    createSolicitud: createSolicitud
  };
})();

