blogApp.controller('loginCtrl', function($scope,$rootScope,apiFactory,$anchorScroll, $http,$window,$location,$routeParams,$timeout) {


      $scope.show_reg=true;
        $scope.registration=function()
          {
            var data={
              "name":$scope.username,
              "email":$scope.email,
              "password":$scope.password
            }

            apiFactory.registerUser(data)
            .then(function (data,response) {
             
              $scope.postResponse = data.data;
              console.log($scope.postResponse);
               $window.alert("Registration successful,login to view blogs");
              $scope.userName=$scope.postResponse.username;
              $scope.userId=$scope.postResponse.userId;
              $scope.uname="";
              $scope.pass="";
              $scope.show_reg=true;
            })
            .catch(function(response) {
              $scope.uname="";
              $scope.pass="";
              if(response.status==409)
                  { console.log(response);
                    $window.alert("Username already present, Register with another one :)");

                  }
                   if(response.status==401)
                  {
                    $window.alert("username and password both required");
                  }
                  else if(response.status==500){
                    $window.alert("Something went wrong!!");
                  }

            })

        }

          $scope.login=function(){

            var data={
              "name":$scope.uname,
              "password":$scope.pass
            }

            apiFactory.userLogin(data)
            .then(function (data,response) {
              
              $scope.postResponse = data.data;
              console.log($scope.postResponse);
              console.log($scope.postResponse.data);
              localStorage.session=$scope.postResponse.session;
              localStorage.userName=$scope.postResponse.data.name;
              console.log(localStorage.userName);
              localStorage.userId=$scope.postResponse.data.userId;
              localStorage.email=$scope.postResponse.data.email;
              $http.defaults.headers.common.token = localStorage.session;
              $rootScope.FlashLoginSuccess=true;
              $timeout(function () {
                  $rootScope.FlashLoginSuccess=false;
              },3000);
              $location.path('/');
            })
            .catch(function(response) {
              if(response.status==410)
                  {
                    $window.alert("User Not found");

                  }
                   if(response.status==411)
                  {
                    $window.alert("wrong password");
                  }
                  else if(response.status==500){
                    $window.alert("Something went wrong!!");
                  }

            })

          };

           $scope.logout = function () {

            // call logout from service
            apiFactory.logout()
              .then(function () {
                delete localStorage.session;
                 $http.defaults.headers.common.token = '';
                 $location.search({});
                 $location.path('/login');

              });

          };
          $scope.stop = function(){
          $timeout.cancel(stopped);
            } 
          $scope.counter = 60*60;
          var stopped;
          $scope.countdown = function() {
          stopped = $timeout(function() {
            //console.log($scope.counter);
          $scope.counter--;  
          if($scope.counter==0) 
          {
            console.log("session Expired");
            $scope.stop();
            return;
          }
          $scope.countdown();   
          }, 1000);
        };
        
        


});