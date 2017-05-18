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
      // resolve: {
      //   "check": function($location, $rootScope) {
      //     if (!$rootScope.loggedIn) {
      //       $location.path('/');
      //     }
      //   }
      // },
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
  this.currentUser;

  // DECLARING USER VARIABLES
  this.currentUser = {};
  // erase this dummy variable later
  this.currentUser.firstName = 'firstname'

  // DECLARING TOGGLE VARIABLES
  this.loginForm = false;
  this.loggedIn = true; /* CHANGE THIS TO FALSE LATER */
  this.modalActive = false;

  // SHOWS LOGIN FORM
  this.showLogin = function(){
    this.loginForm = true;
  }

  // ACTIVATES STOCK MODAL
  this.stockModalToggle = function(){
    this.modalActive = !this.modalActive;
  }

  // SENDS LOGIN REQUEST TO API
  this.submit = function() {

    // $scope.error_msg = null;
    // $rootScope.loggedIn = false;
    // localStorage.clear('token');
    // userPersistenceService.clearCookieData('userName');
    // console.log("username = ", this.username);
    // console.log("pw =", this.username);
    console.log("i am in login ");

    console.log("this.formLogin", this.formLogin);
    this.URL = 'http://localhost:3000/login';

    $http({
      method: 'POST',
      url: this.URL,
      data: this.formLogin
    }).then(function(result) {
      console.log("Data from server: ", result.data);

      $location.path('/dashboard');
    }).
    then(function(error) {
      console.log(error.data);
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
      $location.path('/login');
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
