var adminapp = angular.module('adminapp', ['ngRoute']);

adminapp.config(function($routeProvider){
  $routeProvider

  .when('/',{
    templateUrl : 'admin/dashboard_admin.html',
    controller : 'DashboardCtrl'
  })

  .when('/billing',{
    templateUrl : 'admin/billing_admin.html',
    controller : 'BillingCtrl'
  })
  
  .when('/viewsensor',{
    templateUrl : 'admin/viewsensor_user.html',
    controller : 'ViewSensorCtrl'
  })
  
  .when('/viewadminsensor',{
    templateUrl : 'admin/viewsensor_admin.html',
    controller : 'ViewAdminSensorCtrl'
  })
  
  .when('/createsensor',{
    templateUrl : 'admin/createsensor_admin.html',
    controller : 'CreateSensorCtrl'
  })
  
  .when('/map',{
    templateUrl : 'admin/map_admin.html',
    controller : 'MapCtrl'
  })
  
  .when('/profile',{
    templateUrl : 'admin/profile_admin.html',
    controller : 'ProfileCtrl'
  })
  
  .otherwise({redirectTo: '/'});
});

adminapp.factory('Scopes', function ($rootScope) {
    var mem = {};
 
    return {
        store: function (key, value) {
            mem[key] = value;
        },
        get: function (key) {
            return mem[key];
        }
    };
});

//dashboard
adminapp.controller('DashboardCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
    console.log("Hello from DashboardCtrl");
	
	//session checking
	$http.get('/sessioncheck').success(function(response) {
    console.log("I got the data I requested");
    console.log(response);
	
	if(response.toString() == 'not exist'){
		$rootScope.login_user="";
	}
	else{
		$rootScope.login_user=response.toString();
	}

  });

}]);

//billing
adminapp.controller('BillingCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
    console.log("Hello from BillingCtrl");
	
	$http.get('/sensorlist_admin').success(function(response) {
		console.log("I got the data I requested");
		console.log(response);
		
		var total=0;
			
			for(var i=0; i<response.length; i++)
			{
				var hours=0;
				var minutes=0;
				
				//convert minutes into hours and minutes format
				hours = parseInt(Number(response[i].duration)/60);
				minutes = parseInt(Number(response[i].duration)%60);
				var duration =hours.toString()+":"+minutes.toString();
				
				//display duration in HH:mm format
				response[i].duration=duration;
				
				//calculate total bill (all sensors)
				total=total + parseFloat(response[i].bill);
			}
		
		$scope.sensor_total = total;
		$scope.sensorlist = response;
		
		
		
		});
		
}]);


//view sensor
adminapp.controller('ViewSensorCtrl', ['$scope', '$http', function($scope, $http) {
    console.log("Hello from ViewSensorCtrl");
	
	var refresh = function() {
		$http.get('/sensorlist_admin').success(function(response) {
		console.log("I got the data I requested");
		
		$scope.sensorlist = response;
		
		});
	}
	refresh();

}]);

//maps
adminapp.controller('MapCtrl', ['$scope', '$http', function($scope, $http) {
    console.log("Hello from MapCtrl");
	

}]);

//view and edit profile
adminapp.controller('ProfileCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
    console.log("Hello from ProfileCtrl");
	
	$http.get('/userprofile/'+$rootScope.login_user).success(function(response) {
		console.log("I got the data I requested");

		$scope.user = response;
		
	});
	
	
}]);

//create new sensor
adminapp.controller('CreateSensorCtrl', ['$scope', '$http', '$rootScope', '$window', function($scope, $http, $rootScope, $window) {
    console.log("Hello from CreateSensorCtrl");
	
  //createSensor() 
  $scope.createSensor = function() {
		  console.log($scope.sensor);
		  $scope.sensor.adminname = $rootScope.login_user;
		  
		  if($scope.sensor.type == "Bus Sensor" || $scope.sensor.type == "Bus Stop Sensor"){
			$scope.sensor.cost= "0.20";
		  }
		  else{
			$scope.sensor.cost= "0.30";  
		  }
		  $http.post('/createphysicalsensorlist', $scope.sensor).success(function(response) {
			console.log("done");
			console.log(response);
			$window.alert("Sensor added successfully .. !!")
			$scope.sensor="";
		  });
	};
}]);

//view sensor
adminapp.controller('ViewAdminSensorCtrl', ['$scope', '$http','$rootScope', function($scope, $http, $rootScope) {
    console.log("Hello from ViewSensorCtrl");
	
		$http.get('/physicalsensorlist_admin/'+$rootScope.login_user).success(function(response) {
		console.log("I got the data I requested");
		
		$scope.sensorlist = response;
		
		});

}]);

