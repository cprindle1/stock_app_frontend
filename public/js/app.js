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
  // DECLARING VARIABLES
  var vm = this;
  this.currentUser;

  // DECLARING TOGGLE VARIABLES
  this.loginForm = false;
  this.loggedIn = true; /* CHANGE THIS TO FALSE LATER */

  // SHOWS LOGIN FORM
  this.showLogin = function(){
    this.loginForm = true;
  }

  // SENDS LOGIN REQUEST TO API
  this.submit = function() {

    $scope.error_msg = null;
    $rootScope.loggedIn = false;
    localStorage.clear('token');
    userPersistenceService.clearCookieData('userName');
    console.log("username = ", this.username);
    console.log("pw =", this.username);
    console.log("i am in login ");

    // $http({
    //   method: 'POST',
    //   url: "/login",
    //   data: {
    //     username: this.username,
    //     password: this.password
    //   }
    // }).then(function(response) {
    //   console.log(response);
    //   if (response.data.success === true) {
    //
    //     $scope.error_msg = null;
    //     $rootScope.loggedIn = true;
    //     $rootScope.currentUser = response.data.user;
    //     $rootScope.children = response.data.children;
    //
    //     localStorage.setItem('token', JSON.stringify(response.data.token));
    //     userPersistenceService.setCookieData(response.data.token);
    //     $window.sessionStorage.setItem('token', JSON.stringify(response.data.token));
    //
    //     $location.path('/dashboard');
    //   } else {
    //     $scope.error_msg = response.data.message;
    //     $rootScope.loggedIn = false;
    //   }
    // }, function(error) {
    //   $rootScope.loggedIn = false;
    //   console.log("login failure");
    // });
  };

  // create user ... from register form
  this.register = function() {

    console.log("Register");
    console.log(this);
    // $http({
    //   method: 'POST',
    //   url: "/login/register",
    //   data: this,
    //   headers: {
    //     'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
    //   }
    // }).then(function(response) {
    //   console.log("Register success", response);
    //   if (response.data.success === true) {
    //     $scope.error_msg = null;
    //     // $rootScope.loggedIn = true;
    //     $location.path('/login');
    //   } else {
    //     $scope.error_msg = response.data;
    //   }
    //
    // }, function(error) {
    //   console.log("Register failure", response);
    // });
  };
  //
  // this.logout = function() {
  //   $scope.error_msg = null;
  //   localStorage.clear('token');
  //   userPersistenceService.clearCookieData('userName');
  //   $location.path("/");
  //   location.reload();
  //
  // };
  //
  //
  // // Get all user .. testing..
  // $scope.getUsers = function() {
  //   $http({
  //     url: '/users',
  //     method: 'GET',
  //
  //     headers: {
  //       'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
  //     }
  //   }).then(function(response) {
  //     console.log(response);
  //     if (response.data.status == 401) {
  //       this.error = "Unauthorized";
  //     } else {
  //       this.users = response.data;
  //       $scope.allUsers = response.data;
  //       // $location.path('/dashboard');
  //     }
  //   }.bind(this));
  // };

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
