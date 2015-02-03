var mongoose = require('mongoose');
var request = require('request');
var converter = require('coordinator');

exports.updateBusStopLocations = function(){
	var operatorName = 'Ruter';
	var getStopsRuterURL = "http://reisapi.ruter.no/Place/GetStopsRuter?json=true";

	// Clears database of any entries in the Oslo area
	var BusStopModel = mongoose.model('BusStop')
	BusStopModel.remove({operator: operatorName}, function(err){
	    console.log('collection removed')
	});


	// Get all stops positions and IDs from SIRI Ruter
	request({
	    url: getStopsRuterURL,
	    json: true
	    }, function(error, response, body){
	        if(!error && response.statusCode === 200){
	            var busStopList = body;

	            // Convert all stop coordinates to lat/long 
	            var fn = converter('utm', 'latlong');

	            for(var i = busStopList.length - 1; i >= 0; i--){
	                var busStop = busStopList[i];
	                var pos = fn(busStop.Y, busStop.X, 32);

	                var newBusStop = new BusStopModel({
	                    ID: busStop.ID,
	                    name: busStop.Name,
	                    city: busStop.District,
	                    lat: pos.latitude,
	                    long: pos.longitude,
	                    operator: operatorName,
	                    lastUpdated: new Date()
	                });

	                // Store all positions to DB
	                newBusStop.save(function (err, newBusStop) {
	                  if (err) return console.error(err);
	                });
	            }
	    }
	});

	/*
	BusStopModel.find(function (err, busStopList){
	    if(err) return console.error(err);
	    console.log(busStopList.length);
	})
	*/
}