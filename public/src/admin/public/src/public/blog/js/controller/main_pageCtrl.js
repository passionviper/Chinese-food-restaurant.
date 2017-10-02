blogApp.controller('main_pageCtrl', function($scope,$rootScope,apiFactory,$anchorScroll, $http,$window,$location,$routeParams) {

       $rootScope.userName=localStorage.userName;
       $rootScope.userId=localStorage.userId;
       // $location.search({})  //clear all parameters at once
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
                  'size':'8',
                  'searchTerm':$scope.searchTerm
              }
          }
          
          // $scope.jack=parseInt($scope.pageno);
          // console.log($scope.jack);
          $location.search('page', $scope.pageno+1);
          apiFactory.getBlogs(config)
    	    .then(function (response) {
            $scope.getBlogs = response.data.blogs;
            $scope.countdown();
            if ($scope.getBlogs.length==0) {
              $scope.no_data_div=true;
              $scope.hidePagination=true;
            }
            $scope.blogCount=response.data.count;
            $scope.pages_with_content=Math.ceil($scope.blogCount/8);
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


         $scope.searchBlog=function(searchTerm)
              {
                $scope.searchTerm=searchTerm;
                // $scope.pageno=0;
                // sessionStorage.pageno=0;
                
                console.log(sessionStorage.pageno);
                if($scope.searchTerm!="")
                {
                 $scope.activeButton=0;
                 $scope.pageNew=parseInt(sessionStorage.page);//using this pageNew in below else statement only
                 $scope.pagenoNew=parseInt(sessionStorage.pageno);
                 $scope.page=0;
                 $scope.pageno=0;
                 
                }else{
                sessionStorage.pageno=$scope.pagenoNew;
                $scope.pageno=parseInt(sessionStorage.pageno);
                sessionStorage.page=$scope.pageNew;
                $scope.page=parseInt(sessionStorage.page);
                $scope.activeButton=$scope.pagenoNew;
                console.log('yo');
                 
                }

                $scope.getBlogFunction(($scope.page+$scope.pageno));
                //$scope.activeButton=0;
              };

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
          // $scope.pageno=0;  //initializes each page to first pageno
          // $scope.$evalAsync(function () {
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
          // });
    	    $scope.getpage=function(pageno)
          {
            $scope.pageno=pageno;
            console.log(pageno);
            if($scope.pageno<$scope.blogCount)
            {
               $scope.getBlogFunction(pageno);    
            }
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

          

  });
