'use strict';


var app = angular
  .module('greenEnergySaver', [
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/home/', {
        templateUrl: 'view/home.html',
        controller: 'homePageController'
      })
      .when('/solare/', {
        templateUrl: 'view/solare.html',
        controller: 'solarePageController'
      })
      .otherwise({
        redirectTo: '/home'
      });
  });