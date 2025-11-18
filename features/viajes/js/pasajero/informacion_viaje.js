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

  function setRouteImage(routeNumber){
    var container = qs('.map-card .map-route');
    if (!container) return;
    var url = '../../../../assets/imgs/ruta-'+routeNumber+'-trazado.png';
    container.style.backgroundImage = 'url("'+url+'")';
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
    container.style.height = '220px';
    container.style.borderRadius = '12px';
  }

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
    var id = getParam('id') || 2; // por defecto mostrar uno conocido
    var viaje = (window.PasajeroViajesData && window.PasajeroViajesData.findById(id)) || null;
    if (!viaje) return;

    // Perfil de conductor
    var profileImg = qs('.driver-profile img');
    if (profileImg && viaje.conductor && viaje.conductor.foto) profileImg.src = viaje.conductor.foto;
    setText(qs('.driver-profile .details h2'), viaje.conductor.nombre);

    // CTA reservar
    var reservar = document.querySelector('.cta-group .btn-primary');
    if (reservar) reservar.setAttribute('href', 'reservar_viaje.html?id='+viaje.id);

    // Meta
    var meta = document.querySelectorAll('.trip-meta .light-card');
    if (meta && meta.length >= 4){
      setText(meta[0].querySelector('span'), viaje.hora);
      setText(meta[1].querySelector('span'), viaje.fecha_salida);
      setText(meta[2].querySelector('span'), viaje.tiempo_estimado);
      setText(meta[3].querySelector('span'), viaje.lugar_recojo);
    }

    // Ruta y paraderos
    setRouteImage(viaje.routeNumber || 1);
    renderPickups(viaje.paraderos || []);
  });
})();

