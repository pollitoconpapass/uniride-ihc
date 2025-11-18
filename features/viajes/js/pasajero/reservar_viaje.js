// Manejo de reserva y creación de solicitud
// Requiere: viajesData.js y solicitudesData.js
(function(){
  function getParam(name){
    var m = new RegExp('[?&]'+name+'=([^&]+)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setRouteImage(routeNumber){
    var container = document.querySelector('.map-card .map-route');
    if (!container) return;
    var url = '../../../../assets/imgs/ruta-'+routeNumber+'-trazado.png';
    container.style.backgroundImage = 'url("'+url+'")';
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
    container.style.height = '220px';
    container.style.borderRadius = '12px';
  }

  function fillPickups(stops){
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
    // actualizar select de punto
    var sel = document.getElementById('punto');
    if (sel){
      sel.innerHTML = '';
      var def = document.createElement('option');
      def.textContent = 'Seleccionar punto de recogida';
      def.value = '';
      sel.appendChild(def);
      for (var k=0;k<stops.length;k++){
        var opt = document.createElement('option');
        opt.value = stops[k];
        opt.textContent = stops[k];
        sel.appendChild(opt);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var id = getParam('id') || 2;
    var viaje = (window.PasajeroViajesData && window.PasajeroViajesData.findById(id)) || null;
    if (!viaje) return;

    // Encabezado pequeño con resumen
    var overview = document.querySelector('.trip-overview');
    if (overview){
      overview.innerHTML = ''+
        '<span><small>Conductor</small>'+viaje.conductor.nombre+'</span>'+
        '<span><small>Tiempo del viaje</small>'+viaje.tiempo_estimado+'</span>'+
        '<span><small>Fecha</small>'+viaje.fecha_salida+'</span>';
    }

    // Imagen de ruta y paraderos
    setRouteImage(viaje.routeNumber || 1);
    fillPickups(viaje.paraderos || []);

    // Acción Aceptar -> crear solicitud
    var aceptar = document.querySelector('.modal .btn-primary');
    if (aceptar){
      aceptar.addEventListener('click', function(e){
        e.preventDefault();
        var metodo = document.getElementById('metodo');
        var punto = document.getElementById('punto');
        var mensaje = document.getElementById('mensaje');
        var payload = {
          id_viaje: viaje.id,
          conductor: viaje.conductor.nombre,
          horario: viaje.hora + ' ' + viaje.fecha_salida,
          estado: 'pendiente',
          metodo_compensacion: metodo ? metodo.value : 'Pago en efectivo',
          punto_recogida: punto ? punto.value : '',
          mensaje_opcional: mensaje ? mensaje.value : ''
        };
        var s = window.PasajeroSolicitudesData && window.PasajeroSolicitudesData.createSolicitud(payload);
        var next = 'solicitud_enviada_detalle.html?id='+viaje.id;
        if (s && s.id_solicitud) next += '&idSolicitud='+s.id_solicitud;
        window.location.href = next;
      });
    }
  });
})();

