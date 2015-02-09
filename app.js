var express = require('express')
var mongoose = require('mongoose');
var getAllBusStops = require('./routes/getAllBusStops');
var getAllBuses = require('./routes/getAllBuses');
//var getAllBusLines = require('./routes/getAllBusLines');
//var getBusStopsByLine = require('./routes/getBusStopsByLine');
var getBusByLine = require('./routes/getBusByLine');
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
        busLines: [ {type: Number} ],
        lastUpdated: Date
    }
);

// Call this sometime
//ruter.updateBusStopLocations();

//atb.updateBusStopLocations();

var app = express()

app.get('/', function (req, res) {
    res.send('hello');
})

app.get('/Stops/getAllBusStops/:operator', getAllBusStops.show);
app.get('/Stops/getBusStopsOnLine/:operator/:lineID', getBusByLine.getBusStopsByLine);
app.get('/Buses/getBusLocationByLine/:operator/:lineID', getBusByLine.getBusLocationByLine);
app.get('/Buses/getAllBuses/:operator', something.something);

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})