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
      .when('/consumi/', {
        templateUrl: 'view/consumi.html',
        controller: 'homePageController'
      })
      .when('/solare/costi/', {
        templateUrl: 'view/solareCosti.html',
        controller: 'solareCostiController'
      })
      .when('/solare/previsione/', {
        templateUrl: 'view/solarePrevisione.html',
        controller: 'previsioneController'
      })
      .when('/solare/', {
        templateUrl: 'view/solare.html',
        controller: 'solareController'
      })
      .otherwise({
        redirectTo: '/consumi/'
      });
  });