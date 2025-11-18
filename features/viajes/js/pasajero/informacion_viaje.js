// Lógica para la página de información de una oferta de viaje
(function(){
  function getParam(name){
    var m = new RegExp('[?&]'+name+'=([^&]+)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setText(el, text){
    if (el) el.textContent = text;
  }

  function renderPickups(stops){
    var card = document.querySelector('.pickup-card');
    if (!card) return;
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
    var offerIndex = getParam('i');
    if (offerIndex === null) {
        document.querySelector('.info-wrapper').innerHTML = '<h2>No se encontró la oferta de viaje.</h2>';
        return;
    }

    var viajesConductor = window.PasajeroViajesData.getConductorViajes();
    var viaje = viajesConductor && viajesConductor[parseInt(offerIndex, 10)];

    if (!viaje) {
        document.querySelector('.info-wrapper').innerHTML = '<h2>No se encontró la oferta de viaje.</h2>';
        return;
    }

    // Poblar datos de la oferta
    setText(document.querySelector('#trip-route-name'), 'Viaje a ' + viaje.ruta);
    setText(document.querySelector('#driver-name'), 'Conductor'); // Nombre no disponible en el objeto de oferta

    setText(document.querySelector('#trip-time'), viaje.hora || '');
    setText(document.querySelector('#trip-date'), viaje.fecha || '');

    // Lógica para paradas de la ruta
    var stops = window.PasajeroViajesData.findStopsByRouteName(viaje.ruta);
    renderPickups(stops || []);

    // Lógica del botón reservar
    var btnReservar = document.querySelector('.btn-primary');
    if (btnReservar) {
      btnReservar.addEventListener('click', function(e){
        e.preventDefault();
        if (window.PasajeroModals) {
          window.PasajeroModals.openReservaModal({ index: parseInt(offerIndex, 10) });
        }
      });
    }
  });
})();