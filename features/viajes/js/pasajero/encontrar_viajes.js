// Render dinámico para Encontrar Viajes (Pasajero)
// Requiere: viajesData.js cargado previamente
(function(){
  function availabilityClass(total, ocupados){
    var libres = Math.max((total||0) - (ocupados||0), 0);
    var ratio = total ? libres/total : 0;
    if (ratio >= 0.5) return 'good';
    if (ratio >= 0.25) return 'medium';
    return 'low';
  }

  function render(list){
    var tbody = document.querySelector('.driver-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (var i=0;i<list.length;i++){
      var v = list[i];
      // v: {fecha, hora, ruta, pasajeros, estado}
      var total = parseInt(v.pasajeros||4,10);
      var ocupados = 0; // no tenemos dato de ocupación; se puede calcular con solicitudes si se requiere
      var libres = Math.max(total - ocupados, 0);

      var tr = document.createElement('tr');
      tr.innerHTML = ''+
        '<td data-label="Conductor">Conductor</td>'+
        '<td data-label="Hora">'+(v.hora||'')+'</td>'+
        '<td data-label="Fecha de salida">'+(v.fecha||'')+'</td>'+
        '<td data-label="Disponibilidad"><span class="availability-pill '+availabilityClass(total, ocupados)+'">'+libres+'/'+total+' asientos</span></td>'+
        '<td data-label="Reservar"><button class="reserve-btn" data-index="'+i+'">Reservar</button></td>'+
        '<td data-label="Ver"><a class="action-icon" href="informacion_viaje.html?i='+i+'">&#128065;</a></td>';
      tbody.appendChild(tr);
    }
  }

  function filterToday(v){
    // Filtrar por hoy en base a fecha_salida DD/MM/YYYY
    var parts = v.fecha_salida.split('/');
    var d = new Date(parts[2], parseInt(parts[1],10)-1, parts[0]);
    var now = new Date();
    return d.toDateString() === new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
  }

  document.addEventListener('DOMContentLoaded', function(){
    var viajes = (window.PasajeroViajesData && window.PasajeroViajesData.getConductorViajes()) || [];
    render(viajes);

    // Ocultar mapa simulado
    var map = document.querySelector('.map-placeholder');
    if (map) map.style.display = 'none';
    var wrapper = document.querySelector('.map-wrapper');
    if (wrapper) wrapper.style.gridTemplateColumns = '1fr';

    // Filtros simples
    var buttons = document.querySelectorAll('.filters button');
    if (buttons && buttons.length){
      buttons[0].addEventListener('click', function(){
        buttons[0].classList.add('active');
        if (buttons[1]) buttons[1].classList.remove('active');
        if (buttons[2]) buttons[2].classList.remove('active');
        render(viajes.filter(filterToday));
      });
      if (buttons[1]) buttons[1].addEventListener('click', function(){
        buttons[1].classList.add('active');
        buttons[0].classList.remove('active');
        if (buttons[2]) buttons[2].classList.remove('active');
        render(viajes); // placeholder simple
      });
      if (buttons[2]) buttons[2].addEventListener('click', function(){
        buttons[2].classList.add('active');
        buttons[0].classList.remove('active');
        if (buttons[1]) buttons[1].classList.remove('active');
        render(viajes); // placeholder simple
      });
    }

    // Delegación Reservar -> abrir modal
    var tbody = document.querySelector('.driver-table tbody');
    if (tbody){
      tbody.addEventListener('click', function(e){
        var btn = e.target.closest('.reserve-btn');
        if (!btn) return;
        var idx = parseInt(btn.getAttribute('data-index'),10);
        if (window.PasajeroModals && !isNaN(idx)){
          window.PasajeroModals.openReservaModal({ index: idx });
        }
      });
    }
  });
})();
