var mongoose = require('mongoose');
var request = require('request');
var _ = require('underscore');


// This request takes 10 seconds, and should be improved somehow
exports.getBusLocationByLine = function(req, res){
	var op = req.params.operator;
	var lineID = req.params.lineID;
	console.log(new Date());
	findBusStopsByLine(op, lineID, function(busStopList){
		getInfoFromBusStop(busStopList, lineID, function(list){
			
			list.sort(function(a, b){
				if(a.VehicleID > b.VehicleID)
					return 1;
				if(a.VehicleID < b.VehicleID)
					return -1;
				if(a.ExpectedArrivalTime > b.ExpectedArrivalTime)
					return 1;
				if(a.ExpectedArrivalTime < b.ExpectedArrivalTime)
					return -1;
				return 0;
			})
			res.send(list);


			/*
			var listOfClosestStops = [];
			for(var i = list.length - 1; i >= 0; i--){
				var index = indexOfVehicle(listOfClosestStops, list[i]);
				if(index === -1){
					listOfClosestStops.push(list[i]);
				}else if(list[i].ExpectedArrivalTime < listOfClosestStops[index].ExpectedArrivalTime){
					listOfClosestStops[index] = list[i];
				}
			}

			console.log(new Date());
			res.send(listOfClosestStops);
			*/
		})
	});
}

function indexOfVehicle(list, vehicle){
	for(var i = list.length - 1; i >= 0; i--){
		if(list[i].VehicleID === vehicle.VehicleID)
			return i;
	}
	return -1;
}

function getInfoFromBusStop(busStopList, lineID, callback){
	// List of all visits of buses on a given line.
	var busStopVisits = [];
	var cb = _.after(busStopList.length, callback);
	
	for(var x = busStopList.length - 1; x >= 0; x--){
		var busStopLookupURL = 'http://reisapi.ruter.no/StopVisit/GetDepartures/' + busStopList[x].ID + '?json=true&linenames=' + lineID;
		// function used to store the current value of x, so that the JSON can be returned with information about the bus stop
		// without this, all the async calls will use the same value for x
		(function(index){
			// Sends a request for arrivals at a given bus stop
			request({
		    url: busStopLookupURL,
		    json: true
		    }, function(error, response, body){
		    	if(!error && response.statusCode === 200){
		    		var incomingBuses = body;
		    		for(var i = 0; i < incomingBuses.length; i++){
		    			var bus = incomingBuses[i];
		    			if(bus.MonitoredVehicleJourney.LineRef == lineID
		    			   	&& bus.MonitoredVehicleJourney.VehicleRef != null){
		    				var visit = {
		    					VehicleID: bus.MonitoredVehicleJourney.VehicleRef,
		    					BusStopID: bus.MonitoringRef,
		    					BusStopName: busStopList[index].name,
		    					Position: {
		    						Latitude: busStopList[index].lat,
		    						Longditude: busStopList[index].long
		    					},
		    					LineName: bus.MonitoredVehicleJourney.VehicleRef.LineRef,
		    					DestinationName: bus.MonitoredVehicleJourney.DestinationName,
		    					Direction: bus.MonitoredVehicleJourney.DiectionRef,
		    					AimedArrivalTime: bus.MonitoredVehicleJourney.MonitoredCall.AimedArrivalTime,
		    					ExpectedArrivalTime: bus.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime
		    				}
		    				busStopVisits.push(visit);
		    			}
		    		}
		    		cb(busStopVisits);
		    	}
		    });
		})(x);
	}
}

exports.getBusStopsByLine = function(req, res){
	var op = req.params.operator;
	var lineID = req.params.lineID;
	findBusStopsByLine(op, lineID, function(list){
		res.send(list);
	});
}


function findBusStopsByLine(operator, lineID, callback){
	mongoose.model('BusStop').find({busLines: lineID})
	.where('operator').equals(operator)
	.exec(function(err, busStopList){
		if(err) return console.error(err);
		callback(busStopList);
	});
}