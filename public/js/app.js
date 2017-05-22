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
  this.URL = 'http://localhost:3000/';

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
  this.buyingMore = false;
  this.sellingShares = false;
  this.stockFilter = 'bought';
  this.msg_watching_stock = null;

  // SHOWS LOGIN FORM
  this.showLogin = function() {
    this.loginForm = true;
  }

  // ACTIVATES MODALS
  this.modalToggle = function(modal, index) {
    switch (modal) {
      case 'register':
        this.registerModal = !this.registerModal;
        break;
      case 'boughtStock':
        this.boughtModal = !this.boughtModal;
        this.viewedStock = $rootScope.myStocks[index];
        this.automatedSearchStock($rootScope.myStocks[index].symbol);
        break;
      case 'watchedStock':
        this.watchedModal = !this.watchedModal;
        this.viewedStock = $rootScope.myStocks[index];
        this.automatedSearchStock($rootScope.myStocks[index].symbol);
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

  // SHOWS BUYING (MORE) SHARES FORM
  this.buyMore = function() {
    this.buyingMore = !this.buyingMore;
  }

  // SHOWS SELLING SHARES FORM
  this.sellShares = function() {
    this.sellingShares = !this.sellingShares;
  }

  // FILTERS BETWEEN BOUGHT AND WATCHED STOCKS
  this.filterStocks = function(status) {
    if (status === 'bought') {
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

        // calls countUserStocks function
        this.countUserStocks();

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
    $rootScope.msg_watching_stock = null;
    var URL = this.URL + 'search_stocks';
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
      chartData = {
        labels: ["Current", "Fr. 50 Day Moving Avg", "Fr. 200 Day Moving Avg", "Fr. Year High", "Fr. Year Low"],
        datasets: [{
          backgroundColor: 'rgba(2, 102, 112, 0.5)',
          data: [result.data.change, result.data.change_from_fiftyday_moving_average, result.data.change_from_two_hundredday_moving_average, result.data.change_from_year_high, result.data.change_from_year_low]
        }]
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

  // AUTOMATED SEARCH FOR STOCKS
  this.automatedSearchStock = function(sym) {
    var URL = this.URL + 'search_stocks';
    $http({
      method: 'POST',
      url: URL,
      data: {
        stock: sym
      }
    }).then(function(result) {
      this.automatedStock = result.data;
      console.log(this.automatedStock);
    }.bind(this));
  };

  // Buy stock
  this.buystock = function() {
    console.log("buying.....");

    if (typeof this.buyingStock.NumberShares === 'undefined') {
      $scope.error_msg_not_enough_fund = "Number of Share should not be 0"
    }

    var numberOfShare = this.buyingStock.NumberShares;
    var userId = $rootScope.currentUser.id;
    var isWatched = false;
    var userMoney = $rootScope.currentUser.money;

    var sharePrice = $rootScope.stockSearchResult.ask
    if (sharePrice === null || sharePrice === 0) {
      sharePrice = $rootScope.stockSearchResult.last_trade_price_only
    }

    costTrading = sharePrice * numberOfShare;
    if (userMoney >= costTrading) {
      var URL = this.URL + 'users/' + userId + '/ledgers';
      $http({
        method: 'POST',
        url: URL,
        data: {
          user: $rootScope.currentUser,
          qty: numberOfShare,
          isWatched: isWatched,
          stock: $rootScope.stockSearchResult
        }
      }).then(function(result) {
        $scope.error_msg_not_enough_fund = null
        console.log(result.data.errors);
        if (!result.data) {
          $scope.error_msg_not_enough_fund = result.data.errors;
        } else {
          $rootScope.myStocks = result.data.userstocks;
          $rootScope.currentUser = result.data.currentUser;
          this.countUserStocks();

          console.log("Save Success");
        }

      }.bind(this));

    } else {
      $scope.error_msg_not_enough_fund = "Not enough money"
    }

  }; // End buy stock

  // WATCH STOCKS

  this.watchedStock = function() {

    console.log("Add a stock to the watching list..");
    $rootScope.msg_watching_stock = null;
    var userId = $rootScope.currentUser.id;
    var isWatched = true;
    var currentSymbol = $rootScope.stockSearchResult.symbol;

    var isStock = false;
    $rootScope.myStocks.forEach(function(stock) {
      if (stock.symbol === currentSymbol) {
        isStock = true;
      }

    });

    if (isStock) {
      $rootScope.msg_watching_stock = "The stock is already in your Bought/Watched list.";
    } else {
      var URL = this.URL + 'users/' + userId + '/ledgers';

      $http({
        method: 'POST',
        url: URL,
        data: {
          ledger: {
            qty: 0
          },
          user: $rootScope.currentUser,
          isWatched: isWatched,
          stock: $rootScope.stockSearchResult
        }
      }).then(function(result) {
        $scope.error_msg_not_enough_fund = null
        console.log(result.data.errors);
        if (!result.data) {
          console.log(result.data.errors);
          $rootScope.msg_watching_stock = result.data.errors;
        } else {
          $rootScope.myStocks = result.data.userstocks;
          $rootScope.currentUser = result.data.currentUser;
          this.countUserStocks();

          console.log("Save Success");
        }

      }.bind(this));

    }






  }; // End Watch Stock

  // COUNTS USER'S BOUGHT AND WATCHED STOCKS
  this.countUserStocks = function() {
    $rootScope.currentUser.userBought = 0;
    $rootScope.currentUser.userWatched = 0;
    for (var i = 0; i < $rootScope.myStocks.length; i++) {
      if ($rootScope.myStocks[i].watched === true) {
        $rootScope.currentUser.userWatched++;
      } else {
        $rootScope.currentUser.userBought++;
      }
    }
    return;
  }

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
