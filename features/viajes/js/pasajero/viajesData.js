// Datos locales de viajes del pasajero
// - Sin frameworks ni módulos ES6
// - Persiste en localStorage para usarlo entre pantallas
(function () {
  var STORAGE_KEY = 'pasajero_viajes';

  function seedData() {
    // Rutas disponibles en assets/imgs/ruta-<#>-trazado.png
    // routeNumber hace referencia a esa imagen y a posibles paraderos
    var base = [
      {
        id: 1,
        conductor: { nombre: 'Joaquin', foto: '../../../../assets/imgs/user_carlos.png' },
        distancia_km: 3,
        hora: '09:00 am',
        fecha_salida: '09/10/2025',
        tiempo_estimado: '15 minutos',
        disponibilidad: { ocupados: 1, total: 4 },
        precio: 'S/ 6.00',
        calificacion: 5,
        lugar_recojo: 'Teatro Nacional',
        paraderos: ['Teatro Nacional', 'La Rambla', 'Estación La Cultura'],
        routeNumber: 1,
        estado: 'agendado'
      },
      {
        id: 2,
        conductor: { nombre: 'Carlos', foto: '../../../../assets/imgs/user_wade.png' },
        distancia_km: 2,
        hora: '10:00 am',
        fecha_salida: '10/10/2025',
        tiempo_estimado: '15 minutos',
        disponibilidad: { ocupados: 2, total: 4 },
        precio: 'S/ 6.00',
        calificacion: 4,
        lugar_recojo: 'La Rambla',
        paraderos: ['La Rambla', 'Estación La Cultura', 'Instituto de Salud del Niño'],
        routeNumber: 2,
        estado: 'agendado'
      },
      {
        id: 3,
        conductor: { nombre: 'Jose', foto: '../../../../assets/imgs/user_robert.png' },
        distancia_km: 3,
        hora: '11:00 am',
        fecha_salida: '10/10/2025',
        tiempo_estimado: '15 minutos',
        disponibilidad: { ocupados: 1, total: 4 },
        precio: 'S/ 5.50',
        calificacion: 5,
        lugar_recojo: 'La Rambla',
        paraderos: ['La Rambla', 'Estación La Cultura', 'Instituto de Salud del Niño'],
        routeNumber: 3,
        estado: 'agendado'
      },
      {
        id: 4,
        conductor: { nombre: 'William', foto: '../../../../assets/imgs/user_marvin.png' },
        distancia_km: 4,
        hora: '11:30 am',
        fecha_salida: '10/10/2025',
        tiempo_estimado: '32 minutos',
        disponibilidad: { ocupados: 3, total: 4 },
        precio: 'S/ 7.00',
        calificacion: 4,
        lugar_recojo: 'Est. La Cultura',
        paraderos: ['La Rambla', 'Estación La Cultura', 'Instituto de Salud del Niño'],
        routeNumber: 4,
        estado: 'agendado'
      },
      {
        id: 5,
        conductor: { nombre: 'Majo', foto: '../../../../assets/imgs/user_jane.png' },
        distancia_km: 3,
        hora: '12:00 pm',
        fecha_salida: '12/10/2025',
        tiempo_estimado: '15 minutos',
        disponibilidad: { ocupados: 2, total: 4 },
        precio: 'S/ 6.50',
        calificacion: 5,
        lugar_recojo: 'La Rambla',
        paraderos: ['La Rambla', 'Estación La Cultura', 'Instituto de Salud del Niño'],
        routeNumber: 5,
        estado: 'agendado'
      },
      {
        id: 6,
        conductor: { nombre: 'Adrian', foto: '../../../../assets/imgs/user_cody.png' },
        distancia_km: 5,
        hora: '03:00 pm',
        fecha_salida: '14/09/2025',
        tiempo_estimado: '18 minutos',
        disponibilidad: { ocupados: 4, total: 4 },
        precio: 'S/ 6.00',
        calificacion: 4,
        lugar_recojo: 'Paradero Central',
        paraderos: ['Paradero Central', 'La Rambla'],
        routeNumber: 1,
        estado: 'pasado'
      },
      {
        id: 7,
        conductor: { nombre: 'Mariana', foto: '../../../../assets/imgs/user_savannah.png' },
        distancia_km: 6,
        hora: '01:00 pm',
        fecha_salida: '10/09/2025',
        tiempo_estimado: '20 minutos',
        disponibilidad: { ocupados: 4, total: 4 },
        precio: 'S/ 6.00',
        calificacion: 4,
        lugar_recojo: 'Paradero Central',
        paraderos: ['Paradero Central', 'La Rambla'],
        routeNumber: 2,
        estado: 'pasado'
      },
      {
        id: 8,
        conductor: { nombre: 'Luis', foto: '../../../../assets/imgs/user_ralphs.png' },
        distancia_km: 7,
        hora: '07:50 pm',
        fecha_salida: '30/08/2025',
        tiempo_estimado: '44 minutos',
        disponibilidad: { ocupados: 4, total: 4 },
        precio: 'S/ 7.50',
        calificacion: 3,
        lugar_recojo: 'Paradero Central',
        paraderos: ['Paradero Central', 'La Rambla'],
        routeNumber: 3,
        estado: 'pasado'
      }
    ];

    // Intentar enriquecer con rutas del módulo de rutas si existen
    try {
      var storedRoutes = JSON.parse(localStorage.getItem('userRoutes') || '[]');
      if (storedRoutes && storedRoutes.length) {
        // Si hay rutas guardadas por el usuario, usar sus nombres como paraderos de ejemplo
        for (var i = 0; i < base.length; i++) {
          var rIndex = base[i].routeNumber - 1;
          var route = storedRoutes[rIndex] || storedRoutes[0];
          if (route && route.stops && route.stops.length) {
            base[i].paraderos = route.stops.map(function (s) { return s.name || s; }).slice(0, 3);
            base[i].lugar_recojo = base[i].paraderos[0];
          }
        }
      }
    } catch (e) {
      // Ignorar errores de parsing
    }

    return base;
  }

  function getViajes() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      var seeded = seedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    try {
      return JSON.parse(raw) || [];
    } catch (e) {
      return seedData();
    }
  }

  function saveViajes(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
  }

  function findById(id) {
    id = Number(id);
    var all = getViajes();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  // API pública simple en el ámbito global
  window.PasajeroViajesData = {
    storageKey: STORAGE_KEY,
    getViajes: getViajes,
    saveViajes: saveViajes,
    findById: findById
  };
})();

