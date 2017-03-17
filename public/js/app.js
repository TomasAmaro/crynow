var app = angular.module('newApp', ['ngRoute', 'ngResource', 'ngCookies', 'angularMoment']);


// Routes configuration binding the views and controllers
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'main.html',
            controller: 'mainController'
        })
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'authController'
        })
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'authController'
        });
});

// Posts Factory to be access on every controllers who inject it  
app.factory('postService', function($resource) {
    return $resource('/api/posts/:id');
});

app.controller('indexController', ['$scope', '$http', '$window', function($scope, $http, $window) {

    // This block fills the browser Session Storage. After the first Authentication is handled by the client keeping the server C00L as a C00Ala
    if ($window.localStorage.autheticated === undefined) {
        $window.localStorage.autheticated = false;
        $window.localStorage.current_user = '';
    }

    $scope.currentSession = $window.localStorage;

    $scope.isAuthenticated = function() {
        return $scope.currentSession.autheticated;
    }

    // The logout function retrives the info back to the server about the Authentication status of that user
    $scope.logout = function() {

        $window.localStorage.autheticated = false;
        $window.localStorage.current_user = '';
        $http.get('auth/signout');
    }

}]);


app.controller('mainController', ['$scope', '$http', 'postService', '$window', '$timeout', function($scope, $http, postService, $window, $timeout) {


    // Get the GeoLocation of the user to be part of the post object on server
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            $scope.$apply(function() {
                $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&key=' + 'AIzaSyAV5JPQXR_8BCkNQ4iDwgmBRrsliIjAnwk').then(function(response) {
                    $window.localStorage.location = response.data.results[6].formatted_address;
                });
            });
        });
    };


    $scope.currentSession = $window.localStorage.autheticated;


    $scope.isAuthenticated = function() {
        return $scope.currentSession;
    };

    //Fetching all the posts on DB
    $scope.posts = postService.query();




    $scope.newPost = { created_by: '', text: '', created_at: '' };

    //Setting the data from the view to the PostService($resource) to be sent via JSON using the API  
    $scope.post = function() {
        $scope.newPost.created_by = $window.localStorage.current_user;
        $scope.newPost.created_at = Date.now();
        $scope.newPost.location = $window.localStorage.location;
        postService.save($scope.newPost, function() {
            $scope.posts = postService.query();
            $scope.newPost = { created_by: '', text: '', created_at: '' };
        });
    };

}]);


app.controller('authController', ['$scope', '$location', '$http', '$window', function($scope, $location, $http, $window) {

    $scope.error_message = '';

    $scope.user = {
        username: '',
        password: ''
    }


    $scope.login = function() {
        //Force the user to be Lower Case
        $scope.user.username = $scope.user.username.toLowerCase();
        $scope.userToSend = $scope.user;

        $http.post('/auth/login', $scope.userToSend).then(function(success) {

            if (success.data.state === 'failure') {
                $scope.error_message = success.data.message;
            } else {
                $window.localStorage.autheticated = true;
                $window.localStorage.current_user = success.data.user.username;

                $location.path('/');
            }


        })
    };

    $scope.register = function() {

        //Force the user to be Lower Case
        $scope.user.username = $scope.user.username.toLowerCase();
        $scope.userToSend = $scope.user;

        $http.post('/auth/signup', $scope.userToSend).then(function(success) {
            // Blocking the Authentication on the client side using the response from the API
            if (success.data.state === 'failure') {
                $scope.error_message = success.data.message;
            } else {
                $window.localStorage.autheticated = true;
                $window.localStorage.current_user = success.data.user.username;

                $location.path('/');
            }
        }, function(error) {
            $scope.error_message = error.data.message;
        });

    };



}])