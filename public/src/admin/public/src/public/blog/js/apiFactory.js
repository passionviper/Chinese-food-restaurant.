angular.module('blogApp')
    .factory('apiFactory', function($http) {

    var urlBase = '/getBlogs';
    var apiFactory = {};

    apiFactory.getBlogs = function (config) {
        
        return $http.get('/blog/get',config);
    };

    apiFactory.getBlogArticle = function(id){
        return $http.get('/blog/get/'+id);
    };
    apiFactory.registerUser=function(data)
    {
        return $http.post('/register',data);
    }
   
    apiFactory.userLogin = function (data) {
        return $http.post('/authenticate',data);
    };
    apiFactory.logout=function()
    {
        return $http.get('/logout');
    }
    apiFactory.featuredBlogs=function(){
        return $http.get('/blog/featured');
    }
    apiFactory.postBlog=function(data){
        return $http.post('/blog/add',data);
    }
    apiFactory.updateBlog=function(data,id){
        return $http.put('/blog/update/'+id,data)
    }
    apiFactory.deleteBlog=function(id){
        return $http.delete('/blog/delete/'+id);
    }
    apiFactory.upvoteBlog=function(data,id){
        return $http.post('/blog/upvote/'+id,data);
    }
    apiFactory.commentBlog=function(data,id)
    {
        return $http.post('/blog/comments/add/'+id,data);
    }
    apiFactory.updateComment=function(data)
    {
        return $http.post('/blog/comments/update',data);
    }
     apiFactory.deleteComment=function(data)
    {
        return $http.post('/blog/comments/delete',data);
    }
     apiFactory.upvoteComment=function(data)
    {
        return $http.post('/blog/comments/upvote',data);
    }

    // dataFactory.updateCustomer = function (cust) {
    //     return $http.put(urlBase + '/' + cust.ID, cust)
    // };

    // dataFactory.deleteCustomer = function (id) {
    //     return $http.delete(urlBase + '/' + id);
    // };

    // dataFactory.getOrders = function (id) {
    //     return $http.get(urlBase + '/' + id + '/orders');
    // };

    return apiFactory;
});
