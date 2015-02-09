var mongoose = require('mongoose');

exports.show = function(req, res){
	var op = req.params.operator;
	mongoose.model('BusLine').find({operator: op}, function (err, busLineList){
	    if(err) 
	    	return console.error(err);
	    res.send(busLineList);
	});
}