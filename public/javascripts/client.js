function routeLoad(){
	var uri = $('#stationSelect option:selected').val();
	var stationNum = uri.substring(uri.lastIndexOf('='));
	$('#routeSelect').html('');
	$.get("loadRoutes/"+stationNum, function(data){
		var routeSelect=$('#routeSelect');
  		for(var i=0; i<data.length; i+=2){
  			routeSelect.append('<option value=' + data[i].substring(data[i].lastIndexOf('#')+1) + '>' + data[i+1] + '</option>');
  		}
	});
}

function sheduleLoad(){
	var temp = $('#stationSelect option:selected').val();
	var stationNum = temp.substring(temp.lastIndexOf('=')+1);
	var routeNum = $('#routeSelect option:selected').val();

	document.location.href = '/loadShedule/' + stationNum + '/' + routeNum;
}