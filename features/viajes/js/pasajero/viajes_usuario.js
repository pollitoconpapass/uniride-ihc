// Render de Viajes del Usuario (Agendados y Pasados)
// Requiere: viajesData.js
(function(){
  function renderAgendados(list){
    var tbody = document.querySelector('.scheduled-table tbody');
    if (!tbody) return;
    tbody.innerHTML='';
    if (!list.length){
      tbody.innerHTML = '<tr><td colspan="7" class="empty-table-message">No tienes viajes en el momento</td></tr>';
      return;
    }
    for (var i=0;i<list.length;i++){
      var v = list[i];
      var tr = document.createElement('tr');
      tr.innerHTML = ''+
        '<td data-label="Conductor">Conductor</td>'+
        '<td data-label="Hora">'+(v.hora||'')+'</td>'+
        '<td data-label="Fecha de salida">'+(v.fecha||'')+'</td>'+
        '<td data-label="Lugar de recojo">'+(v.punto_recogida||v.lugar_recojo||'')+'</td>'+
        '<td data-label="Cancelar" class="small"><button class="cancel-btn" data-id="'+(v.id||i)+'">Cancelar</button></td>'+
        '<td data-label="Ver" class="small"><a class="action-icon" href="viaje_reservado_detalle.html?id='+(v.id||i)+'"><img src="../../../../assets/icons/ver_mas_icon.svg" alt="Ver" style="width:24px; height:24px; vertical-align: middle;"></a></td>';
      tbody.appendChild(tr);
    }
  }

  function renderPasados(list){
    var tbody = document.querySelector('.past-table tbody');
    if (!tbody) return;
    tbody.innerHTML='';
    // No mostrar calificación; si no hay pasados, dejar vacío
  }

  document.addEventListener('DOMContentLoaded', function(){
    var viajes = window.PasajeroViajesData.getPasajeroViajes();
    renderAgendados(viajes);
    renderPasados([]);

    // Ocultar paginación si existe
    var pag = document.querySelector('.pagination');
    if (pag) pag.style.display = 'none';

    // Quitar cabecera de calificación
    var ths = document.querySelectorAll('.past-table thead th');
    if (ths && ths.length) ths[ths.length-1].style.display='none';

    // Delegación cancelar
    var tbody = document.querySelector('.scheduled-table tbody');
    if (tbody){
      tbody.addEventListener('click', function(e){
        var btn = e.target.closest('.cancel-btn');
        if (!btn) return;
        var id = btn.getAttribute('data-id');
        if (window.PasajeroModals) window.PasajeroModals.openCancelarModal({ id: id });
      });
    }

    // Exponer para refrescar luego de cancelar
    window.actualizarListasPasajero = function(){
      var v2 = window.PasajeroViajesData.getPasajeroViajes();
      renderAgendados(v2);
    };
  });
})();
