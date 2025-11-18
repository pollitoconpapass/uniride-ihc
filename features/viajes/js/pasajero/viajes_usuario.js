// Render de Viajes del Usuario (Agendados y Pasados)
// Requiere: viajesData.js
(function(){
  function renderAgendados(list){
    var tbody = document.querySelector('.scheduled-table tbody');
    if (!tbody) return;
    tbody.innerHTML='';
    for (var i=0;i<list.length;i++){
      var v = list[i];
      if (v.estado !== 'agendado') continue;
      var tr = document.createElement('tr');
      tr.innerHTML = ''+
        '<td data-label="Conductor">'+v.conductor.nombre+'</td>'+
        '<td data-label="Hora">'+v.hora+'</td>'+
        '<td data-label="Fecha de salida">'+v.fecha_salida+'</td>'+
        '<td data-label="Tiempo estimado"><span class="badge badge-blue">'+v.tiempo_estimado+'</span></td>'+
        '<td data-label="Lugar de recojo">'+(v.lugar_recojo||'')+'</td>'+
        '<td data-label="Cancelar" class="small"><a class="cancel-btn" href="cancelar_viaje_confirmar.html?id='+v.id+'">Cancelar</a></td>'+
        '<td data-label="Ver" class="small"><a class="action-icon" href="informacion_viaje.html?id='+v.id+'">&#128065;</a></td>';
      tbody.appendChild(tr);
    }
  }

  function renderPasados(list){
    var tbody = document.querySelector('.past-table tbody');
    if (!tbody) return;
    tbody.innerHTML='';
    for (var i=0;i<list.length;i++){
      var v = list[i];
      if (v.estado !== 'pasado') continue;
      var tr = document.createElement('tr');
      var estrellas = ''.padEnd(v.calificacion||0,'★');
      tr.innerHTML = ''+
        '<td data-label="Conductor">'+v.conductor.nombre+'</td>'+
        '<td data-label="Hora">'+v.hora+'</td>'+
        '<td data-label="Fecha de salida">'+v.fecha_salida+'</td>'+
        '<td data-label="Tiempo de viaje"><span class="badge badge-gray">'+v.tiempo_estimado+'</span></td>'+
        '<td data-label="Método de compensación">'+(v.metodo_compensacion||'Pago en Efectivo')+'</td>'+
        '<td data-label="Calificación"><span class="stars">'+(estrellas||'')+'</span></td>';
      tbody.appendChild(tr);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var viajes = (window.PasajeroViajesData && window.PasajeroViajesData.getViajes()) || [];
    renderAgendados(viajes);
    renderPasados(viajes);
  });
})();

