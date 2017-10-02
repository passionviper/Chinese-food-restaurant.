blogApp.controller('article_viewCtrl', function($scope,apiFactory,$timeout,$location,$anchorScroll,$routeParams,$sce, $http, $window) {
  $scope.id = $routeParams.id;
  $scope.userName=localStorage.userName;
  $scope.userId=localStorage.userId;
  $anchorScroll();
  $scope.upvotedComment=[];
  var flag=0;
  $scope.articleGet=function(){
    apiFactory.getBlogArticle($scope.id)
    	    .then(function (response) {
            $scope.getBlog = response.data;
            console.log($scope.getBlog);
            if($scope.getBlog.upvoters.length!=0)
            {
              for(var i=0;i<$scope.getBlog.upvoters.length;i++)
              {
                
                if($scope.getBlog.upvoters[i].userId==localStorage.userId)
                {
                  $scope.upvote=true;
                }
                 
              }
            }
            else
            {
              $scope.upvote=false;
            }
            if($scope.getBlog.comments.length!=0)
              {
                for(var i=0;i<$scope.getBlog.comments.length!=0;i++)
                  { 
                    if($scope.getBlog.comments[i].upvoters.length!=0)
                    {
                       
                      for(var j=0;j<$scope.getBlog.comments[i].upvoters.length;j++)
                        {
                         flag=1;
                          if($scope.getBlog.comments[i].upvoters[j].userId==localStorage.userId)
                            {
                              $scope.upvotedComment[i]=true;
                              flag=0;
                              break;
                            }
                          
                        }
                         if(flag==1)
                            {
                              $scope.upvotedComment[i]=false;
                            }   
                    }
                 
                }
              
            }

          })
           .catch(function(response) {
                  if(response.status==403)
                  {
                    console.log("session Expired, Login again");
                    $location.search({});
                    $location.path('/login');
                    delete localStorage.session;
                  }
                   if(response.status==404)
                  {
                    $window.alert("Check your Internet Connection/page not found");
                  }
                  else if(response.status==500){
                    $window.alert("Something went wrong!!");
                  }
                })
    }
    $scope.articleGet();

    $scope.toTrustedHTML = function(html){
		    return $sce.trustAsHtml(html);
		}

    $scope.featuredBlogs=function()
         {
          apiFactory.featuredBlogs()
    	    .then(function (response) {
            $scope.getFeaturedBlogs = response.data;
            console.log($scope.getFeaturedBlogs);
            if ($scope.getFeaturedBlogs.length==0) {
              $scope.no_data_div=true;
              $scope.hidePagination=true;
            }

          })
          .catch(function(response) {
                  if(response.status==403)
                  {
                    console.log("session Expired, Login again");
                    $location.search({});
                    $location.path('/login');
                    delete localStorage.session;
                  }
                   if(response.status==404)
                  {
                    $window.alert("Check your Internet Connection/page not found");
                  }
                  else if(response.status==500){
                    $window.alert("Something went wrong!!");
                  }
                })
        
         }
         $scope.featuredBlogs();


         $scope.upvoteFunc=function()
         {
          var data={
            "userId":$scope.userId
          }
          apiFactory.upvoteBlog(data,$scope.id)
          .then(function (response) {
            $scope.getUpvoteResponse = response.data;
            if($scope.getUpvoteResponse.upvote==true)
            {
              $scope.upvote=true;
              $scope.getBlog.upvotes++;
            }
            else
            {
              $scope.upvote=false;
              $scope.getBlog.upvotes--;
            }
          })
          .catch(function(response) {
                  if(response.status==403)
                  {
                    console.log("session Expired, Login again");
                    $location.search({});
                    $location.path('/login');
                    delete localStorage.session;
                  }
                   if(response.status==404)
                  {
                    $window.alert("Check your Internet Connection/page not found");
                  }
                  else if(response.status==500){
                    $window.alert("Something went wrong!!");
                  }
                });
        

         }

         $scope.commentFunc=function()
         {
           console.log($scope.comment);
           if($scope.comment==""||$scope.comment==undefined)
           {
             return;
           }
          
            var data={
              "person":$scope.userName,
              "comment":$scope.comment,
              "userId":$scope.userId
            }
            apiFactory.commentBlog(data,$scope.id)
            .then(function (response) {
            $scope.getUpvoteResponse = response.data;
            $scope.comment="";
            $scope.articleGet();
          })
          .catch(function(response) {
              if(response.status==403)
              {
                console.log("session Expired, Login again");
                $location.search({});
                $location.path('/login');
                delete localStorage.session;
              }
                if(response.status==404)
              {
                $window.alert("Check your Internet Connection/page not found");
              }
              else if(response.status==500){
                $window.alert("Something went wrong!!");
              }
            });
         }

         $scope.updateComment=function(comment_id,comment)
         {
           var data={
             "id":$scope.id,
             "comment_id":comment_id,
             "comment":comment
           }
           apiFactory.updateComment(data)
            .then(function (response) {
            $scope.getUpvoteResponse = response.data;
            $scope.editComment=false;
            $scope.showcancel=false;
            $scope.articleGet();
          })
          .catch(function(response) {
              if(response.status==403)
              {
                console.log("session Expired, Login again");
                $location.search({});
                $location.path('/login');
                delete localStorage.session;
              }
                if(response.status==404)
              {
                $window.alert("Check your Internet Connection/page not found");
              }
              else if(response.status==500){
                $window.alert("Something went wrong!!");
              }
            });

       }


       $scope.deleteComment=function(comment_id)
         {
           var data={
             "id":$scope.id,
             "comment_id":comment_id
           }
           apiFactory.deleteComment(data)
            .then(function (response) {
            $scope.getDeleteCommentResponse = response.data;
            $scope.articleGet();
          })
          .catch(function(response) {
              if(response.status==403)
              {
                console.log("session Expired, Login again");
                $location.search({});
                $location.path('/login');
                delete localStorage.session;
              }
                if(response.status==404)
              {
                $window.alert("Check your Internet Connection/page not found");
              }
              else if(response.status==500){
                $window.alert("Something went wrong!!");
              }
            });
  
         }

         $scope.upvoteComment=function(comment_id,index)
         {
           console.log(comment_id);
           var data={
             "id":$scope.id,
             "comment_id":comment_id,
             "userId":$scope.userId
           }
          apiFactory.upvoteComment(data)
           .then(function (response) {
            $scope.getUpvoteCommentResponse = response.data;
            if($scope.upvotedComment[index]==false)
            {
              $scope.upvotedComment[index]=true;
            }
            else
            {
              $scope.upvotedComment[index]=false;
            }
            $scope.articleGet();
          })
          .catch(function(response) {
              if(response.status==403)
              {
                console.log("session Expired, Login again");
                $location.search({});
                $location.path('/login');
                delete localStorage.session;
              }
                if(response.status==404)
              {
                $window.alert("Check your Internet Connection/page not found");
              }
              else if(response.status==500){
                $window.alert("Something went wrong!!");
              }
            });


         }


  });