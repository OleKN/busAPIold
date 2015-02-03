// Note this should probobly not return _id and __v as those are
// not used by the application. 

var mongoose = require('mongoose');

exports.show = function(req, res){
	var op = req.params.operator;
	mongoose.model('BusStop').find({operator: op}, function (err, busStopList){
	    if(err) 
	    	return console.error(err);
	    res.send(busStopList);
	});
}