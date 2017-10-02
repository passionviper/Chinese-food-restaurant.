blogApp.controller('user_profileCtrl', function($scope,$rootScope,apiFactory,$anchorScroll, $http,$window,$location,$routeParams,$window,$timeout,$route) {

    $scope.userBlogs=true;
	  $scope.userName=localStorage.userName;
    $scope.userId=$routeParams.id;  
        $scope.hidePagination=false;

        // console.log(location.search);
        $scope.objPageno=$location.search();
        $location.search({});
        if($scope.objPageno=={}||$scope.objPageno.page=="NaN"||$scope.objPageno.page==undefined||$scope.objPageno.page==NaN||$scope.objPageno.page==""){
          sessionStorage.pageno=$scope.pageno=0;
        }
        else
        sessionStorage.pageno=$scope.pageno=parseInt($scope.objPageno.page-1);
        sessionStorage.page=$scope.page=Math.floor(parseInt(sessionStorage.pageno)/10);
         
               
        $scope.activeButton=$scope.pageno;
        //$scope.pageno=10*($scope.page)+$scope.pageno;//no idea why 10*$scope.page+$scope.pageno nnot working    //P.S:- update: because sessionStorage was storing it as string :) :p
        $scope.searchTerm="";
        $scope.category="";

       
        $scope.getBlogFunction=function(pageno)
        {
          // $(window).on('beforeunload', function() {
          //    $(window).scrollTop(0);
          //     });
          // $location.hash('blog_loaderId');

          $anchorScroll();
          $scope.pageno=pageno;
          $scope.hidePagination=false;
          $scope.moredataleft=false;
          $scope.no_data_div=false;
          $scope.blog_loader=true;
          var config={
                params:{
                  'page':$scope.pageno,
                  'size':'10',
                  'searchTerm':$scope.searchTerm,
                  'userId':$scope.userId
              }
          }
          
          // $scope.jack=parseInt($scope.pageno);
          // console.log($scope.jack);
          $location.search('page', $scope.pageno+1);
          apiFactory.getBlogs(config)
    	    .then(function (response) {
            $scope.getBlogs = response.data.blogs;
            console.log($scope.getBlogs);
            if ($scope.getBlogs.length==0) {
              $scope.no_data_div=true;
              $scope.hidePagination=true;
            }
            $scope.blogCount=response.data.count;
            $scope.pages_with_content=Math.ceil($scope.blogCount/10);
            $scope.blog_loader=false;
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
        $scope.getBlogFunction($scope.pageno);


       

            $scope.pagingNext=function(page)
            {
                $scope.page=page;
                console.log(page);
                $scope.page=$scope.page+1;
                sessionStorage.page=$scope.page;
                $scope.pageno=10*$scope.page;
                $scope.getpage($scope.pageno);
                if($scope.page<1||parseInt(sessionStorage.page)<1)
                 {
                   $scope.value=true;
                 }
                else{
                   $scope.value=false;
                   }

            }
            $scope.pagingPrev=function(page)
            {
              if(page>0)
              {
                page=page-1;
                $scope.page=page;
                console.log($scope.page);
                sessionStorage.page=page;
                $scope.pageno=$scope.page*10;
                $scope.getBlogFunction(page);
                if($scope.page<1 || parseInt(sessionStorage.page)<1)
                {
                  $scope.value=true;
                }
                else{
                $scope.value=false;
                }

              }
            }

            $scope.pagination=function(pageno)
            {
                $scope.pageno=pageno;
                console.log($scope.pageno);
                sessionStorage.pageno=$scope.pageno;
                $scope.total=10*$scope.page + $scope.pageno;
               
                $scope.getpage($scope.total);
            }

              $scope.disable=function(index)
              {
                $scope.pageno=$scope.page*10+index;
                // $scope.pageno=$scope.page*10
                 if($scope.pageno<1)
                  {
                    $scope.value=true;
                  }
                if($scope.page<1)
                  {
                    $scope.value=true;
                  }
                if($scope.pages_with_content<=$scope.pageno)
                {
                  return true;
                }

                return false;
              }
    	    $scope.getpage=function(pageno)
          {
            $scope.pageno=pageno;
            console.log(pageno);
            if($scope.pageno<$scope.blogCount)
            {
               $scope.getBlogFunction(pageno);    
            }
          }

            // Blog editor

        $scope.adminId=localStorage.adminId;
        if($rootScope.editBlogObject!=null)
        {
          $scope.getBlog=$rootScope.editBlogObject;
          //console.log($rootScope.editBlogObject);
          $scope.content=$scope.getBlog.article;
          $scope.title=$scope.getBlog.title;
          $scope.category=$scope.getBlog.category;
          $scope.id=$scope.getBlog.id;
          $scope.postBy=$scope.getBlog.postBy;
          $scope.titleImage=$scope.getBlog.titleImage;
          $scope.metaKeyword=$scope.getBlog.metaKeyword;
          $scope.metaDesc=$scope.getBlog.metaDesc;
          $scope.slugURL=$scope.getBlog.slugURL;
          $scope.shortDesc=$scope.getBlog.shortDesc;
        }
        $rootScope.editBlogObject=[];

         $scope.options = {
            language: 'en',
            allowedContent: true,
            entities: false
          };

       
          $scope.addBlog = function(){
            var  data=
              {
                  'title': $scope.title,
                  'author':$scope.userName,    
                  'body': $scope.body,
                  'userId': $scope.userId,          
                  'imageUrl': $scope.imageUrl
              };
              console.log(data);
            
            apiFactory.postBlog(data)
            .success(function(data,status){
              $scope.body="";
              $scope.BlogPostFlashMessage = true;
                  $timeout(function () {
                      $scope.BlogPostFlashMessage = false;
                    },3000);
              console.log("Success in post method");
                $scope.getBlogFunction(0);
                  $scope.userBlogs=true;
              // $window.location.href='#/blog/allBlogs';

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
         
         $scope.clearScope=function()
         {
            $scope.blogId="";
            $scope.title="";
            $scope.imageUrl="";
            $scope.body="";
         }
         
         $scope.getBlogId=function(id,title,imageUrl,body)
          {
            $scope.blogId=id;
            $scope.title=title;
            $scope.imageUrl=imageUrl;
            $scope.body=body;
            $scope.userBlogs=false;
            $scope.addBlogButton=false;
          }

            $scope.updateBlog = function(title,imageUrl,body){
             
             var data=
                {
                    'title': title,    
                    'imageUrl':imageUrl,   
                    'body':body
                };
               console.log($scope.blogId);
             apiFactory.updateBlog(data,$scope.blogId)
              .success(function(data,status){
                $scope.BlogPostFlashMessage = true;
                  $timeout(function () {
                      $scope.BlogPostFlashMessage = false;
                    },3000);
                  $scope.getBlogFunction(0);
                  $scope.userBlogs=true;
                console.log("Success in put method");

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

            $scope.deleteBlog=function(id)
            {
              apiFactory.deleteBlog(id)
              .success(function(data,status){
                $scope.BlogPostFlashMessage = true;
                  $timeout(function () {
                      $scope.BlogPostFlashMessage = false;
                    },3000);
                  $scope.getBlogFunction(0);
                  $scope.userBlogs=true;
                console.log("Success in put method");

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










});