'use strict';

angular.module('greenEnergySaver')
  .controller('homePageController', function ($scope,$http) {
    $scope.prezzoVendita=0.12;
    $scope.prezzoAcquisto=0.17;
    $scope.intervals = {};
    $scope.quarters = [];

    $scope.guadagnoTotale = function()
    {
      var sum = 0;
      for(var key in $scope.intervals)
      {
        sum+= $scope.intervals[key].price();
      }
      return sum;
    }

    $http.get('/data/consumi.json').
    success(function(data, status, headers, config) {
      data.entry.IntervalReading.forEach(function(interval)
      {
        //console.log(interval)
        $scope.intervals[new Date(interval.timePeriod.start)] = {
          start: interval.timePeriod.start,
          consumo: interval.value,
          produzione:0,
          diff:0,
          price: function() {
            if(this.diff>0)
              return this.diff*$scope.prezzoVendita;
            else
              return this.diff*$scope.prezzoAcquisto;
          }
        };
      });

      var ctx = $("#chart").get(0).getContext("2d");
      var graphData = {
          labels: [],
          datasets: [
              {
                  label: "Produzione",
                  fillColor: "rgba(0,220,0,0)",
                  strokeColor: "rgba(0,220,0,1)",
                  highlightFill: "rgba(220,220,220,0)",
                  highlightStroke: "rgba(220,220,220,1)",
                  data: []
              },
              {
                  label: "Consumi",
                  fillColor: "rgba(220,220,220,0.0)",
                  strokeColor: "rgba(220,0,0,0.5)",
                  highlightFill: "rgba(220,220,220,0.0)",
                  highlightStroke: "rgba(220,220,220,1)",
                  data: []
              },
              {
                  label: "Differenza",
                  fillColor: "rgba(220,220,0,0.0)",
                  strokeColor: "rgba(0,0,0,1)",
                  highlightFill: "rgba(220,220,220,0.0)",
                  highlightStroke: "rgba(220,220,220,1)",
                  data: []
              },
          ]
      };

      $http.get('/data/produzione.json').
      success(function(data, status, headers, config) {
        data.entry.IntervalReading.forEach(function(interval)
        {
          //console.log(interval)
          var date = new Date(interval.timePeriod.start);
          var current = $scope.intervals[date]
          //console.log(current)
          if(current != null)
          {
            current.produzione = interval.value;
            current.diff = current.produzione - current. consumo;

            var quarter = $scope.quarters[date.getHours()+"-"+date.getMinutes()];
            if(quarter == null)
            {
              //console.log(date);
              quarter = {consumo:[],produzione:[],diff:[]};
              $scope.quarters[date.getHours()+"-"+date.getMinutes()] = quarter;
            }
            quarter.consumo.push(current.consumo);
            quarter.produzione.push(current.produzione);
            quarter.diff.push(current.diff);

            

            /*graphData.labels.push("aa")
            graphData.datasets[0].data.push(current.produzione);
            graphData.datasets[1].data.push(current.consumo);
            graphData.datasets[2].data.push(current.diff);*/
          }
        });
        console.log($scope.quarters)
        for(var key in $scope.quarters){
          //console.log(key);
          var quarter = $scope.quarters[key];
          //console.log(quarter)
          //console.log(average(quarter.consumo))
          quarter.consumoMedia=average(quarter.consumo);
          quarter.produzioneMedia=average(quarter.produzione);
          quarter.diffMedia=average(quarter.diff);

          graphData.labels.push(key)
          graphData.datasets[0].data.push(quarter.produzioneMedia);
          graphData.datasets[1].data.push(quarter.consumoMedia);
          graphData.datasets[2].data.push(quarter.diffMedia);
        }

        var myNewChart = new Chart(ctx).Line(graphData,{pointDot:false});

      });

    });

  });


function average(arr)
{
  var sum = 0;
  var length=0;
  for(var n in arr)
  {
    sum+=parseInt(arr[n]);
    length++;
  }
  //console.log(sum+"/"+arr.length)
  return sum/arr.length;
}