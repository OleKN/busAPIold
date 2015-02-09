var mongoose = require('mongoose');
var request = require('request');
var converter = require('coordinator');



exports.updateBusStopLocations = function(){
	var operatorName = 'Ruter';
	var getStopsRuterURL = "http://reisapi.ruter.no/Place/GetStopsRuter?json=true";

	// Clears database of any entries in the Oslo area
	var BusStopModel = mongoose.model('BusStop');
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
	                    busLines: [],
	                    lastUpdated: new Date()
	                });

	                // Store all positions to DB
	                newBusStop.save(function (err, newBusStop) {
	                	if (err) return console.error(err);
	                });
	            }
	            updateLines();
	    }
	});
}

// Finds all lines
// Finds all bus stops on all lines
// Stores lines on each bus stop that serve that line


// this should be rewritten to use Line/GetLinesByStopID/{id}
function updateLines(){
	var operatorName = 'Ruter';
	var getLinesRuterURL = "http://reisapi.ruter.no/Line/GetLines?json=true";

	//Get all lines
	request({
	    url: getLinesRuterURL,
	    json: true
	    }, function(error, response, body){
	        if(!error && response.statusCode === 200){
	            var busLinesList = body;

	            
	            for(var i = busLinesList.length - 1; i >= 0; i--){
	            	// Look up stops
	            	getStopsByLine(busLinesList[i].ID, function(ID, stopsList){
	            		for(var y = stopsList.length - 1; y >= 0; y--){
		            		mongoose.model('BusStop').findOne({operator: operatorName})
		            		.where('ID').equals(stopsList[y].ID)
		            		.exec(function (err, busStop){
		            			if(err) return console.error(err);
		            			if(busStop){
			            			busStop.busLines.push(ID);
			            			busStop.save();
		            			}
		            		});
						}		            		
	            	});
	            }
	    	}
		}
	);
}


function getStopsByLine (lineID, callback) {
	var getStopsByLineURL = "http://reisapi.ruter.no/Place/GetStopsByLineID/" + lineID + "?json=true";
	var list;
	request({
	    url: getStopsByLineURL,
	    json: true
	    }, function(error, response, body){
	        if(!error && response.statusCode === 200){
	        	callback(lineID, body);
	    	}
	    }
	);
}