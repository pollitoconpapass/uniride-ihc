// Datos locales de viajes del pasajero (sin semillas)
// Lectura de viajes del CONDUCTOR y viajes agendados del PASAJERO
(function () {
  var STORAGE_PASAJERO = 'pasajero_viajes'; // viajes que el pasajero reservó
  var STORAGE_CONDUCTOR = 'viajesGuardados'; // viajes creados por el conductor (existente)

  function getConductorViajes() {
    try { return JSON.parse(localStorage.getItem(STORAGE_CONDUCTOR) || '[]'); }
    catch (e) { return []; }
  }

  function getPasajeroViajes() {
    try { return JSON.parse(localStorage.getItem(STORAGE_PASAJERO) || '[]'); }
    catch (e) { return []; }
  }

  function savePasajeroViajes(list) {
    localStorage.setItem(STORAGE_PASAJERO, JSON.stringify(list || []));
  }

  function addPasajeroViaje(v) {
    var list = getPasajeroViajes();
    // generar id incremental
    var id = list.reduce(function(max, it){ return Math.max(max, it.id||0); }, 0) + 1;
    v.id = id;
    list.push(v);
    savePasajeroViajes(list);
    return v;
  }

  function removePasajeroViajeById(id){
    id = Number(id);
    var list = getPasajeroViajes();
    var out = [];
    for (var i=0;i<list.length;i++) if ((list[i].id||0) !== id) out.push(list[i]);
    savePasajeroViajes(out);
    return out;
  }

  // Helpers para rutas
  function getUserRoutes(){
    try { return JSON.parse(localStorage.getItem('userRoutes') || '[]'); }
    catch(e){ return []; }
  }
  function findStopsByRouteName(name){
    var routes = getUserRoutes();
    for (var i=0;i<routes.length;i++){
      if (routes[i].name === name){
        var places = routes[i].referencePlaces || '';
        if (typeof places === 'string' && places.length > 0) {
          return places.split(',').map(function(s) { return s.trim(); });
        }
        return [];
      }
    }
    return [];
  }

  window.PasajeroViajesData = {
    storagePasajero: STORAGE_PASAJERO,
    storageConductor: STORAGE_CONDUCTOR,
    getConductorViajes: getConductorViajes,
    getPasajeroViajes: getPasajeroViajes,
    savePasajeroViajes: savePasajeroViajes,
    addPasajeroViaje: addPasajeroViaje,
    removePasajeroViajeById: removePasajeroViajeById,
    findStopsByRouteName: findStopsByRouteName
  };
})();
