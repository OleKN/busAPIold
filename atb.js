var soap = require('soap');
var fs = require('fs');
var mongoose = require('mongoose');
var stripBom = require('strip-bom');

exports.updateBusStopLocations = function(){
	var operatorName = 'AtB';

	// Clears database of any entries in the Oslo area
	var BusStopModel = mongoose.model('BusStop');
	BusStopModel.remove({operator: operatorName}, function(err){
	    console.log('collection removed');
	});

	var user = 'sNb14SepBatb';
    var pass = 'E1mfMII84Vy1U1e';

	var url = 'http://st.atb.no/infotransit/userservices.asmx?WSDL'
	//var url = 'http://miz.it/infotransit/getUserRealTimeForecastEx';
	//var url = 'http://miz.it/infotransit';
	var args = fs.readFile('./AtBsoap.xml', 'UTF-8', function(err, data){
		if(err) console.log(err);
		console.log(data);
		stripBom(data)
		soap.createClient(url, function(err, client) {
			if(err) console.log(err);

			//client.setSecurity(new soap.BasicAuthSecurity(user, pass));
			//client.auth(user,pass);
			client.setSecurity(new soap.WSSecurity(user, pass))
			
			client.GetBusStopsList(data, function(err, result) {
				if(err) console.log(err);
			   	console.log(result);
			});
			
		});
	});
}
