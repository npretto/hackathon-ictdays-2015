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
      .when('/recupero/', {
        templateUrl: 'view/consumi.html',
        controller: 'homePageController'
      })
      .when('/previsione/', {
        templateUrl: 'view/solarePrevisione.html',
        controller: 'previsioneController'
      })
      .otherwise({
        redirectTo: '/recupero/'
      });
  });