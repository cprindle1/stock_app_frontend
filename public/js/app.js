var app = angular.module('StockApp', ['ngRoute', 'ngCookies']);

// ROUTES CONFIGURATION
app.config(function($routeProvider) {

  $routeProvider
    .when('/', {
      controller: 'loginCtr',
      templateUrl: '/views/landing-page.html',
      controllerAs: 'vm'
    })
    .when('/register', {
      controller: 'loginCtr',
      templateUrl: '/views/register.html',
      controllerAs: 'vm'
      //Added a meals config
    })
    .when('/login', {
      controller: 'loginCtr',
      templateUrl: '/views/login.html',
      reloadOnSearch: false,
      controllerAs: 'vm'
    })
    .when('/dashboard', {
      resolve: {
        "check": function($location, $rootScope) {
          if (!$rootScope.loggedIn) {
            $location.path('/');
          }
        }
      },
      templateUrl: '/views/dashboard.html',
      controller: 'loginCtr',
      controllerAs: 'vm'
    })
    .otherwise({
      redirectTo: '/'
    });
});

app.config(['$qProvider', function($qProvider) {
  $qProvider.errorOnUnhandledRejections(false);
}]);

// LOGIN CONTROLLER
app.controller('loginCtr', ['$http', '$scope', '$location', '$rootScope', '$cookies', '$window', 'userPersistenceService', function($http, $scope, $location, $rootScope, $cookies, $window, userPersistenceService) {
  // DECLARING CONTROLLER VARIABLES
  var vm = this;
  this.token = null;

  // DECLARING USER VARIABLES
  this.currentUser = {};

  // DECLARING TOGGLE VARIABLES
  this.loginError = false;
  this.errorMessage = '';
  this.loginForm = false;
  this.registerForm = false;
  this.modalActive = false;

  // SHOWS LOGIN FORM
  this.showLogin = function() {
    this.loginForm = true;
  }

  // ACTIVATES MODAL
  this.modalToggle = function() {
    this.modalActive = !this.modalActive;
  }

  // SENDS LOGIN REQUEST TO API
  this.submit = function() {
    $scope.error_msg = null;
    $rootScope.loggedIn = false;
    localStorage.clear('token');
    // userPersistenceService.clearCookieData('userName');

    console.log("this.formLogin", this.formLogin);
    this.URL = 'http://localhost:3000/login';
    $http({
      method: 'POST',
      url: this.URL,
      data: this.formLogin
    }).then(function(result) {
      console.log("Data from server: ", result.data);
      if (result.data.error) {
        this.loginError = true;
        // dont need this.. error will send from backend.
        // if (result.data.error === 'No User ') {
        //   result.data.error = "wrong username";
        // }
        this.errorMessage = result.data.error;
      } else {

        $scope.error_msg = null;
        $rootScope.loggedIn = true;
        $rootScope.currentUser = result.data.user;
        localStorage.setItem('token', JSON.stringify(result.data.token));
        $location.path('/dashboard');
      }
    }.bind(this));
  };

  // create user ... from register form
  this.register = function() {

    console.log("Register");
    console.log("this.formdata", this.formdata);
    this.URL = 'http://localhost:3000/users';

    $http({
      method: 'POST',
      url: this.URL,
      data: this.formdata
    }).then(function(result) {
      console.log("Data from server: ", result);
      this.formLogin = {
        username: this.formdata.username,
        password: this.formdata.password
      }
      this.submit();
    }.bind(this));
  };


}]);

// Server - set cookies
app.factory("userPersistenceService", [
  "$cookies",
  function($cookies) {
    var userName = "";

    return {
      setCookieData: function(username) {
        userName = username;
        $cookies.put("userName", username);
      },
      getCookieData: function() {
        userName = $cookies.get("userName");
        return userName;
      },
      clearCookieData: function() {
        userName = "";
        $cookies.remove("userName");
      }
    };
  }
]);
