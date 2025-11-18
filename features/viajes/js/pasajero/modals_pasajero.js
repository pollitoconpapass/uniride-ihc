// Utilidades de modales para el flujo del pasajero
// Requiere: viajesData.js y solicitudesData.js
(function(){
  function el(html){
    var div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
  }

  function close(backdrop){
    if (backdrop && backdrop.parentNode){ backdrop.parentNode.removeChild(backdrop); }
  }

  function openReservaModal(opts){
    var index = (opts && typeof opts.index==='number') ? opts.index : null;
    var viajes = window.PasajeroViajesData.getConductorViajes();
    var v = viajes[index];
    if (!v) return;

    var paraderos = window.PasajeroViajesData.findStopsByRouteName(v.ruta) || [];
    var opciones = paraderos.map(function(p){ return '<option>'+p+'</option>'; }).join('');
    var html = '\n<div class="modal-backdrop">\n  <div class="modal">\n    <div class="modal-header"><h2 class="modal-title">Reservar viaje</h2><button class="modal-close" aria-label="Cerrar">&times;</button></div>\n    <form class="modal-form">\n      <div class="form-field"><label for="f_nombres">Nombres</label><input id="f_nombres" type="text" placeholder="Tu nombre completo" required></div>\n      <div class="form-field"><label for="f_punto">Lugar de recojo</label><input id="f_punto" type="text" placeholder="Escribe o selecciona un punto de recojo"></div>\n      <div class="form-field"><label for="f_metodo">Método de compensación</label><select id="f_metodo"><option>Efectivo</option><option>Yape</option><option>Gasolina</option><option>Almuerzo</option></select></div>\n      <div class="form-field"><label for="f_monto">Monto de compensación (S/.)</label><input id="f_monto" type="number" placeholder="Ej: 5.00" step="0.50" min="0" required></div>\n      <div class="form-field"><label for="f_msj">Comunicación (Mensaje)</label><textarea id="f_msj" placeholder="Mensaje opcional para el conductor"></textarea></div>\n      <button type="submit" class="btn-primary">Enviar solicitud</button>\n    </form>\n  </div>\n</div>';

    var backdrop = el(html);
    document.body.appendChild(backdrop);
    backdrop.querySelector('.modal-close').addEventListener('click', function(){ close(backdrop); });
    backdrop.addEventListener('click', function(e){ if (e.target===backdrop) close(backdrop); });

    backdrop.querySelector('form').addEventListener('submit', function(e){
      e.preventDefault();
      var nombres = backdrop.querySelector('#f_nombres').value.trim();
      var punto = backdrop.querySelector('#f_punto').value;
      var metodo = backdrop.querySelector('#f_metodo').value;
      var monto = backdrop.querySelector('#f_monto').value;
      var msj = backdrop.querySelector('#f_msj').value.trim();
      if (!nombres || !monto) return;

      // crear solicitud
      var payload = {
        id_viaje: index,
        pasajero: nombres,
        conductor: 'Conductor',
        horario: (v.hora||'') + ' ' + (v.fecha||''),
        estado: 'pendiente',
        metodo_compensacion: metodo,
        monto_compensacion: monto,
        punto_recogida: punto,
        mensaje_opcional: msj
      };
      if (window.PasajeroSolicitudesData){ window.PasajeroSolicitudesData.createSolicitud(payload); }

      // agregar a viajes del pasajero
      window.PasajeroViajesData.addPasajeroViaje({
        fecha: v.fecha,
        hora: v.hora,
        ruta: v.ruta,
        punto_recogida: punto,
        metodo_compensacion: metodo,
        estado: 'Agendado'
      });

      close(backdrop);
      openInfoModal('Tu solicitud ha sido enviada al conductor');
    });
  }

  function openCancelarModal(opts){
    var id = opts && opts.id; // id de viaje del pasajero
    var html = '\n<div class="modal-backdrop">\n  <div class="modal">\n    <div class="modal-header"><button class="modal-close" aria-label="Cerrar">&times;</button></div>\n    <h2>Cancelar viaje</h2>\n    <p>¿Seguro que deseas cancelar este viaje?</p>\n    <div style="display:flex; gap:12px;">\n      <button class="btn-outline" id="cancelarNo">No</button>\n      <button class="btn-danger" id="cancelarSi">Sí, cancelar</button>\n    </div>\n  </div>\n</div>';
    var backdrop = el(html);
    document.body.appendChild(backdrop);
    backdrop.querySelector('.modal-close').addEventListener('click', function(){ close(backdrop); });
    backdrop.addEventListener('click', function(e){ if (e.target===backdrop) close(backdrop); });
    backdrop.querySelector('#cancelarNo').addEventListener('click', function(){ close(backdrop); });
    backdrop.querySelector('#cancelarSi').addEventListener('click', function(){
      window.PasajeroViajesData.removePasajeroViajeById(id);
      close(backdrop);
      openInfoModal('Tu viaje ha sido cancelado');
      if (typeof window.actualizarListasPasajero === 'function') window.actualizarListasPasajero();
    });
  }

  function openInfoModal(texto){
    var backdrop = el('\n<div class="modal-backdrop">\n  <div class="modal">\n    <h2>'+texto+'</h2>\n    <button class="btn-primary" id="okBtn">Aceptar</button>\n  </div>\n</div>');
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function(e){ if (e.target===backdrop) close(backdrop); });
    backdrop.querySelector('#okBtn').addEventListener('click', function(){ close(backdrop); });
  }

  window.PasajeroModals = {
    openReservaModal: openReservaModal,
    openCancelarModal: openCancelarModal,
    openInfoModal: openInfoModal
  };
})();

