var express = require('express')
var mongoose = require('mongoose');
var getAllBusStops = require('./routes/getAllBusStops');
var ruter = require('./ruter');
var atb = require('./atb');
mongoose.connect('mongodb://localhost/bus');


// Creates new model for bus stops

var BusStopModel = mongoose.model(
    'BusStop',
    {
        ID: Number,
        name: String,
        city: String,
        lat: Number,
        long: Number,
        operator: String,
        lastUpdated: Date
    }
);

ruter.updateBusStopLocations();
atb.updateBusStopLocations();

var app = express()

app.get('/', function (req, res) {
    res.send('hello');
})

app.get('/getAllBusStops/:operator', getAllBusStops.show);


var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})