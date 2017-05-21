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
  var refreshIntervalId = null;
  this.URL = 'http://localhost:3000/'

  // DECLARING TOGGLE VARIABLES
  this.registerModal = false;
  this.watchedModal = false;
  this.boughtModal = false;
  this.editModal = false;
  this.deleteModal = false;
  this.loginError = false;
  this.errorMessage = '';
  this.loginForm = false;
  this.registerForm = false;
  this.buyingShares = false;
  this.stockFilter = 'bought';

  // SHOWS LOGIN FORM
  this.showLogin = function() {
    this.loginForm = true;
  }

  // ACTIVATES MODALS
  this.modalToggle = function(modal) {
    switch(modal) {
      case 'register':
        this.registerModal = !this.registerModal;
        break;
      case 'boughtStock':
        this.boughtModal = !this.boughtModal;
        break;
      case 'watchedStock':
        this.watchedModal = !this.watchedModal;
        break;
      case 'editUser':
        this.editModal = !this.editModal;
        break;
      case 'deleteUser':
        this.deleteModal = !this.deleteModal;
        break;
    }
  }

  // SHOWS BUYING SHARE FORM
  this.buyShareToggle = function() {
    this.buyingShares = !this.buyingShares;
  }

  // FILTERS BETWEEN BOUGHT AND WATCHED STOCKS
  this.filterStocks = function(status) {
    if(status === 'bought') {
      this.stockFilter = 'bought';
    } else {
        this.stockFilter = 'watched';
    }
  }


  // Testing.... this will go to backend to get data market price for stock
  function myTimer() {
    console.log(' each 1 second...');
  }
  // ----

  // SENDS LOGIN REQUEST TO API
  this.submit = function() {
    $scope.error_msg = null;
    $rootScope.loggedIn = false;
    localStorage.clear('token');
    // userPersistenceService.clearCookieData('userName');

    console.log("this.formLogin", this.formLogin);
    // this.URL = 'https://stockerapi.herokuapp.com/login';
    // this.URL = 'http://localhost:3000/login'
    var URL = this.URL + 'login'
    $http({
      method: 'POST',
      url: URL,
      data: this.formLogin
    }).then(function(result) {
      console.log("Data from server: ", result.data);
      if (result.data.error) {
        this.loginError = true;
        this.errorMessage = result.data.error;
      } else {

        $scope.error_msg = null;
        $rootScope.loggedIn = true;
        $rootScope.currentUser = result.data.user;
        localStorage.setItem('token', JSON.stringify(result.data.token));
        $window.sessionStorage.setItem('token', JSON.stringify(result.data.token));

        // user stocks
        // get stocks from rails server.  this is just user's stocks
        // not a current market price
        console.log("User stocks", result.data.userstocks);
        $rootScope.myStocks = result.data.userstocks;


        // testing... to refresh all stocks
        refreshIntervalId = setInterval(function() {
          myTimer()
        }, 20000);

        $location.path('/dashboard');
      }
    }.bind(this));
  };

  // SENDS CREATE USER REQUEST TO BACKEND
  this.register = function() {

    console.log("Register");
    console.log("this.formdata", this.formdata);
    // this.URL = 'https://stockerapi.herokuapp.com/users';
    // this.URL = 'http://localhost:3000/users'
    var URL = this.URL + 'users'
    $http({
      method: 'POST',
      url: URL,
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

  // SENDS LOGOUT REQUEST
  this.logout = function() {
    console.log("Logout.......", refreshIntervalId);
    clearInterval(refreshIntervalId);
    console.log('Success');
    $rootScope.currentUser = null;
    $scope.error_msg = null;
    localStorage.clear('token');
    // userPersistenceService.clearCookieData('userName');
    $window.sessionStorage.clear('token');
    $location.path("/");
  };

  // SEARCHES FOR A STOCK
  this.searchStock = function() {
    console.log("this.stocksearch", this.stocksearch);
    $rootScope.stockSearchResult = null;
    var URL = this.URL + 'search_stocks'
    $http({
      method: 'POST',
      url: URL,
      data: this.stocksearch
    }).then(function(result) {
      $scope.error_msg = null
      $rootScope.stockSearchResult = result.data;
      console.log(result.data);
      // DRAWS THE CHART
      var ctx = document.querySelector('#stock-chart');
      var chartData = {
        labels: ["Current", "Fr. 50 Day Moving Avg", "Fr. 200 Day Moving Avg", "Fr. Year High", "Fr. Year Low"],
        datasets: [
          {
            backgroundColor: 'rgba(2, 102, 112, 0.5)',
            data: [result.data.change, result.data.change_from_fiftyday_moving_average, result.data.change_from_two_hundredday_moving_average, result.data.change_from_year_high, result.data.change_from_year_low]
          }
        ]
      }
      var stockChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          legend: {
            display: false
          }
        }
      });
      // IF INCORRECT STOCK
      if (!result.data) {
        $scope.error_msg = "No Records found";
      }

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
