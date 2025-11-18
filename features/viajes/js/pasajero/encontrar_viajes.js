// Render dinámico para Encontrar Viajes (Pasajero)
// Requiere: viajesData.js cargado previamente
(function(){
  function availabilityClass(av){
    var libres = Math.max((av.total||0) - (av.ocupados||0), 0);
    var ratio = av.total ? libres/av.total : 0;
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
      if (v.estado === 'pasado') continue; // solo disponibles / próximos
      var libres = Math.max(v.disponibilidad.total - v.disponibilidad.ocupados, 0);

      var tr = document.createElement('tr');
      tr.innerHTML = ''+
        '<td data-label="Conductor">'+v.conductor.nombre+'</td>'+
        '<td data-label="Distancia">'+v.distancia_km+' km</td>'+
        '<td data-label="Hora">'+v.hora+'</td>'+
        '<td data-label="Fecha de salida">'+v.fecha_salida+'</td>'+
        '<td data-label="Tiempo estimado"><span class="badge badge-blue">'+v.tiempo_estimado+'</span></td>'+
        '<td data-label="Disponibilidad"><span class="availability-pill '+availabilityClass(v.disponibilidad)+'">'+libres+'/'+v.disponibilidad.total+' asientos</span></td>'+
        '<td data-label="Reservar"><a class="reserve-btn" href="informacion_viaje.html?id='+v.id+'">Reservar</a></td>'+
        '<td data-label="Ver"><a class="action-icon" href="informacion_viaje.html?id='+v.id+'">&#128065;</a></td>';
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
    var viajes = (window.PasajeroViajesData && window.PasajeroViajesData.getViajes()) || [];
    render(viajes);

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
  });
})();

