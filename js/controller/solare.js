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

      var ctx01 = $("#sunChart01").get(0).getContext("2d");
      var ctx02 = $("#sunChart02").get(0).getContext("2d");
      var ctx03 = $("#sunChart03").get(0).getContext("2d");

      // This will get the first returned node in the jQuery collection.
      var data01 = {
          labels: [],
          datasets: [
              {
                  label: "Sun Level",
                  fillColor: "rgba(0,220,0,0.5)",
                  strokeColor: "rgba(220,220,220,0.8)",
                  highlightFill: "rgba(220,220,220,0.75)",
                  highlightStroke: "rgba(220,220,220,1)",
                  data: []
              }/*,
              {
                  label: "Clouds",
                  fillColor: "rgba(220,220,220,0.5)",
                  strokeColor: "rgba(220,220,220,0.8)",
                  highlightFill: "rgba(220,220,220,0.75)",
                  highlightStroke: "rgba(220,220,220,1)",
                  data: []
              },
              {
                  label: "Sun Phase",
                  fillColor: "rgba(220,220,0,0.5)",
                  strokeColor: "rgba(220,220,220,0.8)",
                  highlightFill: "rgba(220,220,220,0.75)",
                  highlightStroke: "rgba(220,220,220,1)",
                  data: []
              },*/
          ]
      };
      var data02 = jQuery.extend(true, {}, data01);
      var data03 = jQuery.extend(true, {}, data01);
      var data = [data01,data02,data03];
      var dataIndex = 0;
      var currentDay = $scope.hours[0].time.getDay();

      $scope.hours.some(function(hour)
      {
        console.log(currentDay);
        if(currentDay!=hour.time.getDay())
        {
          //console.log(">"+currentDay +"!=!" +hour.time);
          //console.log("<"+dataIndex)
          currentDay=hour.time.getDay();
          dataIndex++;
          if(dataIndex>2)
            return true;
        }
        data[dataIndex].labels.push(hour.time.getHours()+" - " + (hour.time.getHours()+3));
        data[dataIndex].datasets[0].data.push(hour.powerLevel);
        //data[dataIndex].datasets[1].data.push(hour.clouds);
        //data[dataIndex].datasets[2].data.push(hour.sunLevel*100);
      });

      var options = {
        scaleOverride : true,
        scaleSteps : 10,
        scaleStepWidth : 10,
        scaleStartValue : 0,
      };


      var myNewChart = new Chart(ctx01).Bar(data[0], options);;
      var myNewChart = new Chart(ctx02).Bar(data[1], options);;
      var myNewChart = new Chart(ctx03).Bar(data[2], options);;

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
  //console.log((date.getTime() - start.getTime()) +" / "+(end.getTime()-start.getTime()));
  return ( (date.getTime() - start.getTime()) / (end.getTime()-start.getTime()) );
  //return (date.getTime() - times.sunrise.getTime()) / (midSun.getTime()-times.sunrise.getTime()))
}