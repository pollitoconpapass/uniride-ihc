// Lógica para la página de detalle de un viaje reservado por el pasajero
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
    var viajeId = getParam('id');
    if (!viajeId) {
      document.querySelector('.info-wrapper').innerHTML = '<h2>No se encontró el viaje.</h2>';
      return;
    }

    var misViajes = window.PasajeroViajesData.getPasajeroViajes();
    var viaje = misViajes.find(function(v) { return v.id == viajeId; });

    if (!viaje) {
      document.querySelector('.info-wrapper').innerHTML = '<h2>No se encontró el viaje en tu lista.</h2>';
      return;
    }

    // Poblar datos
    setText(document.querySelector('#trip-route-name'), 'Detalle del Viaje: ' + viaje.ruta);
    setText(document.querySelector('#trip-status'), viaje.estado || 'Agendado');
    setText(document.querySelector('#driver-name'), viaje.conductor || 'Conductor'); // Asumiendo que se guarda el nombre del conductor
    
    setText(document.querySelector('#trip-time'), viaje.hora || '');
    setText(document.querySelector('#trip-date'), viaje.fecha || '');
    setText(document.querySelector('#trip-pickup'), viaje.punto_recogida || 'No especificado');
    setText(document.querySelector('#trip-payment-method'), viaje.metodo_compensacion || 'No especificado');

    // Lógica para paradas de la ruta
    var stops = window.PasajeroViajesData.findStopsByRouteName(viaje.ruta);
    renderPickups(stops || []);

    // Lógica del botón cancelar
    var btnCancelar = document.querySelector('.btn-danger');
    if (btnCancelar) {
      btnCancelar.addEventListener('click', function(e){
        e.preventDefault();
        if (window.PasajeroModals) {
          window.PasajeroModals.openCancelarModal({
            id: viaje.id,
            onConfirm: function() {
              // Redirigir a la lista de viajes después de cancelar
              window.location.href = 'viajes_usuario.html';
            }
          });
        }
      });
    }
  });
})();
