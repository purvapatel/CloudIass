var app = angular.module('app', ['ngRoute']);


app.config(function($routeProvider){
  $routeProvider

  .when('/',{
    templateUrl : 'pages/dashboard.html',
    controller : 'DashboardController'
  })

  .when('/billing',{
    templateUrl : 'pages/billing.html',
    controller : 'BillingController'
  })

  .when('/addsensor',{
    templateUrl : 'pages/addsensor.html',
    controller : 'AddSensorController'
  })
  
  .when('/viewsensor',{
    templateUrl : 'pages/viewsensor.html',
    controller : 'ViewSensorController'
  })
  
  .when('/map',{
    templateUrl : 'pages/map.html',
    controller : 'MapController'
  })
  
  .when('/profile',{
    templateUrl : 'pages/profile.html',
    controller : 'ProfileController'
  })
  .otherwise({redirectTo: '/'});
});

app.controller('DashboardController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello from DashboardController");

}]);

//billing
app.controller('BillingController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello from BillingController");
	
	$http.get('/sensorlist').success(function(response) {
		console.log("I got the data I requested");
		console.log(response);
		
		var total=0;
			
			for(var i=0; i<response.length; i++)
			{
				var hours=0;
				var minutes=0;
				
				//hours = Number(response[i].duration)/60;
				//minutes = Number(response[i].duration)%60;
				//response[i].duration =hours.toString()+":"+minutes.toString();
				total=total + parseFloat(response[i].bill);
			}
		
		$scope.sensor_total = total;
		$scope.sensorlist = response;
		
		
		
		});
		
}]);

//add sensor
app.controller('AddSensorController', ['$scope', '$http', '$window', function($scope, $http,  $window) {
    console.log("Hello from AddSensorController");
  
  //addSensor() 
  $scope.addSensor = function() {
  console.log($scope.sensor);
  $scope.sensor.state = "Active";
  $scope.sensor.bill = "0.00";
  $scope.sensor.downtime = "";
  
  if($scope.sensor.type == "Bus Sensor" || $scope.sensor.type == "Bus Stop Sensor"){
	$scope.sensor.cost= "0.20";
  }
  else{
	$scope.sensor.cost= "0.30";  
  }
  $http.post('/sensorlist', $scope.sensor).success(function(response) {
	console.log("done");
    console.log(response);
	$window.alert("Sensor added successfully .. !!")
	$scope.sensor="";
  });
};

}]);

//view sensor
app.controller('ViewSensorController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello from ViewSensorController");
	
	var refresh = function() {
		$http.get('/sensorlist').success(function(response) {
		console.log("I got the data I requested");
		
		for(i=0;i<response.length;i++)
		{
			if(response[i].state == "Active"){
				response[i].button_state = "Deactive";
				console.log("de");
			}
			else{
				response[i].button_state = "Active";
				console.log("ac");
			}
		}
		$scope.sensorlist = response;
		
		});
	}
	
	refresh();

	//delete sensor -> remove button
	$scope.remove = function(id) {
		console.log(id);
		$http.delete('/sensorlist/' + id).success(function(response) {
			refresh();
		});
	};
	
	// active/deactive button
	$scope.updateState = function(id,state,sensor) {
		var temp_state = "";
		console.log(id);
		console.log(state);
		if(state == "Active"){
			temp_state = "Active";
		}
		else{
			temp_state = "Deactive";
		}
		
		//update uptime and downtime
		$http.put('/sensorlisttime/' + id + '/' +temp_state, sensor).success(function(response) {
		console.log(response);
		});
		
		//update status of the sensor
		$http.put('/sensorlist/' + id + '/' +temp_state).success(function(response) {
		console.log(response);
		refresh();
		});
		
		//calculate billing
		if(temp_state == "Deactive"){
			$http.put('/sensorbilling/' + id, sensor).success(function(response) {
			console.log(response);
			});
		}
	};


}]);

//maps
app.controller('MapController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello from MapController");
	
	var myLatlng = new google.maps.LatLng(30.2353412,-92.010498);
    var myOptions = {
        zoom: 13,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    }
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	
	//Used to remember markers
	var markerStore = {};
	
    function getMarkers() {
		$.get('/markers', {}, function(res,resp) {
        for(var i=0, len=res.length; i<len; i++) {

            //Do we have this marker already?
            if(markerStore.hasOwnProperty(res[i].id)) {
                markerStore[res[i].id].setPosition(new google.maps.LatLng(res[i].position.lat,res[i].position.long));
            } else {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(res[i].position.lat,res[i].position.long),
                    title:res[i].name,
                    map:map
                }); 
                markerStore[res[i].id] = marker;
            }
        }
        window.setTimeout(getMarkers,INTERVAL);
    }, "json");
}

}]);

//view and edit profile
app.controller('ProfileController', ['$scope', '$http', function($scope, $http) {
    console.log("Hello from ProfileController");
}]);