var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/index', function(req, res){
	buildStationsList(req, res);
});

router.get('/loadShedule/:station/:route', function(req, res){
	loadShedule(req, res);
});

router.get('/loadRoutes/:uri', function(req, res) {
	 buildRoutesList(req, res);
});

function loadShedule(req, res){
	var route = req.params.route;
	var station = req.params.station;
	
	request('http://www.rasp.ap1.by/pointdetails.php?ost=' + station, function(error, response, body){
		var cheerio = require('cheerio');
		var $ = cheerio.load(body);

		var date = new Date();
		var dayClass = 'workdays';

		if(date.getDay()==0||date.getDay()==6){
			dayClass='weekdays';
		}	

		var hour = date.getHours();
		var minutes = date.getMinutes();

		var timesheet;

		$('.timesheet').each(function(){
			if($(this).find('.busicon').find('a').attr('name')==route){
				timesheet = $(this);
			}
		});

		var hour ='';
		var minutes = new Array();
		var result;

		timesheet.find('table').find('tr').each(function(){
			hour = $(this).find('.hours').text();
			$(this).find('.'+dayClass).children().each(function(){
				minutes.push($(this).text());
			})
			if((result=compareTime(date, hour, minutes))!=false){
				res.send(result);
				return false;
			}
			minutes=[];
		});

		if(result==false){
			res.send('No more routes today');
		}
	});
}

function compareTime(date, sheduleHour, sheduleMinutes){

	for(var i=0; i<sheduleMinutes.length; i++){
		var hour = sheduleHour;
		var minutes = sheduleMinutes[i].substring(sheduleMinutes[i].lastIndexOf('.')+1);

		//console.log('compare date ' + date.getHours() + ':' + date.getMinutes() + ' with ' + hour + ':' + minutes);

		if(parseInt(hour,10)>date.getHours()){
			return 'Nearest bus at time ' + hour + ':' + minutes; 
		}else{
			if(parseInt(hour,10)==date.getHours()&&parseInt(minutes,10)>date.getMinutes()){
				return 'Nearest bus at time ' + hour + ':' + minutes;
			}
		}
	}
	return false;
}

function buildStationsList(req, res){
	var stations = new Array();
	
	request('http://www.rasp.ap1.by/', function(error, response, body) {
		var cheerio = require('cheerio');
  		var $ = cheerio.load(body);
  		
  		$('.stoppoint').each(function(){
  			var temp = $(this).find('a');
  			stations.push(temp.attr('href'));
  			stations.push(temp.attr('title'));
  		})

  		res.render('index', {stations:stations});
  	});
}

function buildRoutesList(req, res){
	var routeList = new Array();
	
	request('http://www.rasp.ap1.by/pointdetails.php?ost'+ req.params.uri, 
		function(error, response, body){
			var cheerio = require('cheerio')
    		var $ = cheerio.load(body);
    
    		$('ul').children().each(function(){
    			routeList.push($(this).find('a').attr('href'));
    			routeList.push($(this).text());
    		})

    		res.send(routeList);
		}
	);
}

module.exports = router;
