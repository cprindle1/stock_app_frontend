// =============== MODULE =================
app = angular.module('StockApp', []);

// =============== CONTROLLER =============
app.controller('MainController', ['$http', function($http){

  // PAGE TOGGLE VARIABLES
  this.landingPage = true;
  this.loginForm = false;

  // RESETS PAGE
  this.resetPage = function(){
    this.landingPage = true;
    this.loginForm = false;
  }

  // SHOWS LOGIN FORM
  this.showLogin = function(){
    this.loginForm = true;
  }

}]);
