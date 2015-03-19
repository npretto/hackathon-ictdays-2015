'use strict';

angular.module('greenEnergySaver')
  .controller('solareCostiController', function ($scope) {
    

  });

angular.module('greenEnergySaver')
  .controller('previsioneController', function($scope, $http) {
  $http.get('http://api.openweathermap.org/data/2.5/forecast/hourly?q=Trento&mode=json').
    success(function(data, status, headers, config) {
    
      $scope.city = data.city["name"];
      $scope.hours = [];
      data.list.forEach(function(hour)
      {
        //console.log(hour);
        var date = new Date(hour.dt_txt);
        var times = SunCalc.getTimes(date, 46.07, 11.12);
        var sunLevel = -1;
        var midSun = new Date(times.sunrise.getTime() + (times.sunset.getTime()-times.sunrise.getTime())/2);
        if(date.getTime() < times.sunrise.getTime() || date.getTime() > times.sunset.getTime())
        {
          sunLevel = 0;
        }else
        if(date.getTime() < midSun) //"morning"
        {
          var midHour = new Date( date );
          midHour.setHours ( date.getHours() + 1 );
          midHour.setMinutes(date.getMinutes()+30);
          //console.log(date);
          //console.log(midHour);
          sunLevel = interpolate(times.sunrise,midSun,midHour);          
        }else //"evening"
        {
          var midHour = new Date( date );
          midHour.setHours ( date.getHours() );
          midHour.setMinutes(date.getMinutes());
          //console.log(date);
          //console.log(midHour);
          var inter = interpolate(midSun,times.sunset ,midHour);
          sunLevel = Math.max(1,inter) - inter;
        }

        sunLevel = Math.min(1,sunLevel);


        //console.log(times);
        //console.log(""+times.sunset)
        $scope.hours.push(
        {
          time: date,
          clouds: hour.clouds.all,
          sunset: times.sunset,
          sunrise: times.sunrise,
          sunLevel : sunLevel,
          midSun : midSun,
          powerLevel : sunLevel * (100-hour.clouds.all),
        });
      });

      var ctx = $("#sunChart").get(0).getContext("2d");
      // This will get the first returned node in the jQuery collection.
      var data = {
          labels: [],
          datasets: [
              {
                  label: "Sun Level",
                  fillColor: "rgba(220,220,220,0.5)",
                  strokeColor: "rgba(220,220,220,0.8)",
                  highlightFill: "rgba(220,220,220,0.75)",
                  highlightStroke: "rgba(220,220,220,1)",
                  data: []
              }
          ]
      };

      $scope.hours.forEach(function(hour)
      {
        data.labels.push(hour.time.getHours());
        data.datasets[0].data.push(hour.powerLevel);
      });

      var myNewChart = new Chart(ctx).Bar(data, []);;
      


      //console.log(data);
      //console.log("ok");
    }).
    error(function(data, status, headers, config) {
      console.log("ERRORE");
      console.log(data);
    });
});

//                12:24    18:26         19:30
//    interpolate(midSun,times.sunset ,midHour);
function interpolate(start,end,date)
{
  console.log((date.getTime() - start.getTime()) +" / "+(end.getTime()-start.getTime()));
  return ( (date.getTime() - start.getTime()) / (end.getTime()-start.getTime()) );
  //return (date.getTime() - times.sunrise.getTime()) / (midSun.getTime()-times.sunrise.getTime()))
}