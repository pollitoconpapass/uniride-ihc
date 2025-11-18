// Página de Información del Viaje (Pasajero)
// Requiere: viajesData.js
(function(){
  function byId(id){ return document.getElementById(id); }

  function qs(sel){ return document.querySelector(sel); }

  function getParam(name){
    var m = new RegExp('[?&]'+name+'=([^&]+)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setText(el, text){ if (el) el.textContent = text; }

  function setRouteImage(){ /* mapa omitido por requerimiento */ }

  function renderPickups(stops){
    var card = qs('.pickup-card');
    if (!card) return;
    // Mantener el título existente
    // Eliminar pills previas
    var pills = card.querySelectorAll('.info-pill');
    for (var i=0;i<pills.length;i++) pills[i].remove();
    for (var j=0;j<stops.length;j++){
      var span = document.createElement('span');
      span.className = 'info-pill';
      span.textContent = stops[j];
      card.appendChild(span);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var index = getParam('i'); // índice en viajes del conductor
    var viajes = window.PasajeroViajesData.getConductorViajes();
    var viaje = viajes && index!=null ? viajes[parseInt(index,10)] : null;
    if (!viaje) return;

    // Perfil de conductor
    setText(qs('#driver-name'), 'Conductor'); // Name is not in the trip object from conductor

    // Título de la tarjeta
    setText(qs('#trip-route-name'), "Viaje a " + (viaje.ruta || ''));

    // CTA reservar -> modal
    var reservar = document.querySelector('.cta-group .btn-primary');
    if (reservar) reservar.addEventListener('click', function(e){ e.preventDefault(); if (window.PasajeroModals) window.PasajeroModals.openReservaModal({ index: parseInt(index,10) }); });
    var chat = document.querySelector('.badge-whatsapp');
    if (chat) chat.textContent = 'Coordinar por chat';

    // Meta
    setText(qs('#trip-time'), viaje.hora || '');
    setText(qs('#trip-date'), (viaje.fecha || viaje.fecha_salida) || '');

    // Ruta y paraderos
    setRouteImage();
    var stops = window.PasajeroViajesData.findStopsByRouteName(viaje.ruta);
    renderPickups(stops || []);

    // Limpiar sección de meta del conductor (edad/carrera)
    var metaProfile = document.querySelector('.driver-profile .meta');
    if (metaProfile){ metaProfile.innerHTML = ''; }
  });
})();
