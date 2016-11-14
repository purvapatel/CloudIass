// MEAN Stack RESTful API Tutorial - Contact List App

var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('clouduser:user@ds151927.mlab.com:51927/cloudsensor',['sensorlist']);
var bodyParser = require('body-parser');
var moment = require('moment-timezone');
var tc = require("timezonecomplete");   
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
 
  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'AIzaSyDevpxCh5pqYdIJB36HInOMYIEbwm7_uH4', // for Mapquest, OpenCage, Google Premier 
  formatter: null         // 'gpx', 'string', ... 
};

var geocoder = NodeGeocoder(options);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

//list of sensors
app.get('/sensorlist', function (req, res) {
  console.log('I received a GET request');

  db.sensorlist.find(function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

//insert sensor data
app.post('/sensorlist', function (req, res) {
  console.log(req.body);
  //creation date -> today date
  req.body.creationDate = moment().tz("America/Los_Angeles").format("MM-DD-YYYY");
  //creation time -> current time
  req.body.creationTime = moment().tz("America/Los_Angeles").format("HH:mm");
  req.body.uptime = moment().tz("America/Los_Angeles").format("HH:mm");
 
  
	//get latitude and longitude from location
	geocoder.geocode(req.body.location, function(err, resp) {
		console.log(resp[0].latitude + " and " + resp[0].longitude);
		req.body.latitude=resp[0].latitude;
		req.body.longitude=resp[0].longitude;
		
		db.sensorlist.insert(req.body, function(err, doc) {
			console.log("data entry done");
			res.json(doc);
		});
		  
	});
	
  
  
});

//delete sensor
app.delete('/sensorlist/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);
  db.sensorlist.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
	
  });
});

//update state of sensor (active/deactive) 
app.put('/sensorlist/:id/:state', function (req, res) {
  var id = req.params.id;
  //console.log(req.params.id);
  //console.log(req.params.state);
  db.sensorlist.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {"state": req.params.state.toString()}},
    new: true}, function (err, doc) {
      res.json	(doc);
    }
  );
});

//update uptime/downtime of sensor (active/deactive) 
app.put('/sensorlisttime/:id/:state', function (req, res) {
  var id = req.params.id;
  //console.log(req.params.id);
  //console.log(req.params.state);
  
  
  if(req.params.state == "Active"){ //active -> update uptime
		db.sensorlist.findAndModify({
		query: {_id: mongojs.ObjectId(id)},
		update: {$set: {"uptime": moment().tz("America/Los_Angeles").format("HH:mm")}},
		new: true}, function (err, doc) {
		  res.json	(doc);
		}
	);
  }
  else { //deactive -> update downtime
		db.sensorlist.findAndModify({
		query: {_id: mongojs.ObjectId(id)},
		update: {$set: {"downtime": moment().tz("America/Los_Angeles").format("HH:mm")}},
		new: true}, function (err, doc) {
		  res.json	(doc);
		}
	);
  }
  
});

//update billing into database when user deactivate the sensor
app.put('/sensorbilling/:id', function (req, res){
	var id = req.params.id;
	//***** Billing
	//find row based on _id
	db.sensorlist.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
		
		console.log('billing');
		console.log(doc.uptime);
		console.log(doc.downtime);
		var cost=0.0;
		var startTime = doc.downtime;
		var endTime = doc.uptime;
		//difference between uptime and downtione in HH:mm format
		console.log(time_diff(startTime,endTime));
		var timeDifference = time_diff(startTime,endTime);
		var timeParts = timeDifference.split(':');    
		var minutes=Number(timeParts[0])*60+Number(timeParts[1]);
		console.log(minutes);
		
		//calculate cost based on minutes (difference between uptime and downtime)
		if(doc.type == "Bus Sensor" || doc.type == "Bus Stop Sensor"){
			cost = Number(doc.bill) + 0.20*minutes;
		}
		else{
			cost = Number(doc.bill) + 0.30*minutes;  
		}
		console.log(cost);
		
		//update bill into database
		db.sensorlist.findAndModify({
			query: {_id: mongojs.ObjectId(id)},
			update: {$set: {"bill": Math.round(cost * 100) / 100}},
			new: true}, function (err, doc) {
			  res.json	(doc);
		});
		
		//res.json(doc);
	
	});
	
});

//function for find difference between twin time in HH:mm format
function time_diff(t1, t2) 
{
  var t1parts = t1.split(':');    
  var t1cm=Number(t1parts[0])*60+Number(t1parts[1]);

  var t2parts = t2.split(':');    
  var t2cm=Number(t2parts[0])*60+Number(t2parts[1]);

  var hour =Math.floor((t1cm-t2cm)/60);    
  var min=Math.floor((t1cm-t2cm)%60);    
  return (hour+':'+min); 
}

app.listen(3000);
console.log("Server running on port 3000");