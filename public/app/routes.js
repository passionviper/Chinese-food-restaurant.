// app/routes.js

// load the todo model
var mongoose=require('mongoose');
var Todo = require('./models/todo');
var TodoDetails=require('./models/todoDetails');
var User=require('./models/user');
var jwt    = require('jsonwebtoken');
var session = require('express-session');
var blog=require('./models/blog')(mongoose);
const ObjectId = mongoose.Types.ObjectId;

// expose the routes to our app with module.exports
module.exports = function(app) {

    // api ---------------------------------------------------------------------
    
    //Register User
    app.post('/register', function(req, res) {

        
        User.findOne({email: req.body.email}, function(err, user) {

         if (err) throw err;

         if (user) {
            res.status(409).json({ success: false, message: 'Email already taken'});
         } 
         else
         {


            User.create({
                name : req.body.name,
                password:req.body.password,
                email:req.body.email,
                done : true
              }, function(err, userDetails) {
                  if (err) { 
                    // if(err.code==11000)
                    //     return res.status(409).json({ success: false, message: 'username or email already taken'})
                    // else {
                     return res.status(401).send(err);
                     // }
                  }
                  else
                    return res.json(userDetails);


                
                // res.json(userDetails);
                //console.log(userDetails);
                // get and return the user you create it
                    // User.find({'userId':userDetails.userId},function(err, user) {
                    //     if (err)
                    //         res.send(err);
                    //     res.json(user);
                    // });
                
            }); 
          }
      })   

    });

    //get Blogs
    app.get('/blog/get',auth,function(req,res){
        var regex = new RegExp(req.query.searchTerm,'i');
        if(req.query.userId!=undefined)
         {   var query={
                $and: [ 
                    { 
                        $or: [
                          {'title': regex},
                          {'body': regex}
                       ]
                    },
                    {    
                         'userId': req.query.userId 
                    }
                ]}
        }
        else
        {
           var query={
                $and: [ 
                    { 
                        $or: [
                          {'title': regex},
                          {'body': regex}
                       ]
                    }
                ]} 
        }
        var page,size;
        console.log(req.query.page);
        if(req.query.page==undefined||req.query.page==0)
            page=0;
        else
            page=req.query.page;
        if(req.query.size==undefined)
            size=10
        size=parseInt(req.query.size);

        blog.Blog.find(query)
        .limit(size)
        .skip(size*page)
        .sort([[ 'created_at', 'descending']])
        .exec(function(err, data) {
            if (err)
                res.send(err)
            var userId;
             if(req.query.userId!=undefined)
                 blog.Blog.find({userId:req.query.userId}).count(function(err, count){
                    console.log("Number of docs: ", count );
                    res.json({blogs:data,count:count});

                });
             else{
             blog.Blog.find().count(function(err, count){
                    console.log("Number of docs: ", count );
                    res.json({blogs:data,count:count});

                });
            }
        });

    });

    //get most upvoted blogs
    app.get('/blog/featured',auth,function(req,res){

        blog.Blog.find({})
        .limit(4)
        .skip(0)
        .sort([[ 'upvotes', 'descending']]).exec(function(err, data) {
            if (err)
                res.send(err)
            res.json(data);
        });

    });
    //get Blogs by Id
    app.get('/blog/get/:id',auth,function(req,res){
        blog.Blog.findById(req.params.id,function(err,blog){
            if(err)
                res.send(err);
            res.json(blog);
        })
    });
    //get blog by userId
    // app.get('/blog/getbyUserId/:userId',function(req,res){
    //     blog.Blog.find({ userId: req.params.userId },function(err,blogs){
    //         if(err)
    //             res.send(err);
    //         res.json(blogs);
    //     })
    // });
    
    //post blogs with particular useId
    
    app.post('/blog/add',auth, function(req, res) {

        blog.Blog.create({
            author : req.body.author,
            title : req.body.title,
            body:req.body.body,
            imageUrl:req.body.imageUrl,
            userId: req.body.userId
          }, function(err, blogDetails) {
            if (err)
                res.send(err);
            res.json(blogDetails);
            console.log(blogDetails);
        });    

    });  

    //update blog
    app.put('/blog/update/:id', auth,function(req, res, next) {
            //instead of req.body we can use $set for specific field updates  { "$set": { "name": name, "genre": genre, "author": author, "similar": similar}}
      blog.Blog.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) 
            res.send(err);
        console.log(post);
        res.json(req.body);
            
         });

    });
    //remove blog
    app.delete('/blog/delete/:id',auth,function(req,res){

         blog.Blog.remove({
            _id : req.params.id
        }, function(err, data) {
            if (err)
                res.send(err);
            res.json(data);
             
    });
       

    }); 
    //increment upvotes
    app.post('/blog/upvote/:id',auth,function(req,res){
        //id is _id
        var query={
                          '_id':req.params.id,   
                }
         var steps=[
                   
                    {"$unwind": "$upvoters"},
           
                   
                    {"$match": {
                    '_id':ObjectId(req.params.id)}
                    },
                    {"$match": 
                     
                    {"upvoters.userId":req.body.userId}


                    },
                    //Project the accoutns.cars object only
                     {"$project" : {"upvoters" : 1}},
                    // //Group and return only the car object
                     {"$group":{"_id":"$upvoters"}}
            ];
             blog.Blog.aggregate(steps, function (err, user) {
                //{'comments.upvoters': {$elemMatch: {userId: req.body.userId}}}
                if (err){
                    res.send(err);
                }    
                console.log(user);
                if (user.length!=0) {
                     blog.Blog.findOneAndUpdate(query,{$pull : {"upvoters": {userId: req.body.userId}}},
                      function(err,post){
                        if(err)
                            {
                                console.log(err);
                                res.send(err);
                            }
                            else
                            {
                                
                                blog.Blog.update(query,{'$inc':{'upvotes':-1}},function(err,post){

                                    if(err)
                                        res.send(err);
                                    post.upvotes=post.upvotes+1; //i have to increment it by one everytime
                                    //console.log(post);
                                    res.json({post:post,upvote:false});
                                    //to sort comments on basis of most upvotes
                                 
                                });
                            } 
                        });
                


                } else {
                   
                    blog.Blog.findOneAndUpdate(query,{$push : {"upvoters": {userId: req.body.userId}}},
                      function(err,post){
                        if(err)
                            {
                                console.log(err);
                                res.send(err);
                            }
                            else
                            {
                                
                                blog.Blog.update(query,{'$inc':{'upvotes':1}},function(err,post){

                                    if(err)
                                        res.send(err);
                                    post.upvotes=post.upvotes+1; //i have to increment it by one everytime
                                    //console.log(post);
                                    res.json({post:post,upvote:true});
                                    
                                });
                            } 
                        });
                


                }

            });

        /*New new new*/
        // blog.Blog.findOne({'upvoters': {$elemMatch: {userId: req.body.userId}}}, function (err, user) {

        //         if (err){
        //             return done(err);
        //         }    

        //         if (user) {
        //             res.status(410).json({ success: false, message: 'Already upvoted the post' });

        //         } else {
        //             blog.Blog.findByIdAndUpdate(req.params.id,{$push : {"upvoters": {userId: req.body.userId}}},
        //                 function(err,post){
        //             if(err)
        //                 {
        //                     console.log(err);
        //                     res.send(err);
        //                 }
        //                 else{
        //                     blog.Blog.findByIdAndUpdate(req.params.id,{$inc: {"upvotes":1}},function(err,post){
        //                         if(err)
        //                             res.send(err);
        //                         post.upvotes=post.upvotes+1; //I have to increment it by one everytime
        //                         res.json(post); 
        //                     });
        //                 } 
        //             });

        //         }

        //     });



       

    });
    // SearchBlog
    app.get('/blog/search',auth,function(req,res){
        var regex = new RegExp(req.query.searchTerm,'i');
        blog.Blog.find({ $or: [
              {'title': regex},
              {'body': regex}
           ] })
        .exec(function(err,results) {
             if(err)
                res.send(err);
            console.log(results);
            res.json(results);

        });

    });


    //add comments
    app.post('/blog/comments/add/:id',auth,function(req,res){

        var comment=[{person:req.body.person,comment:req.body.comment,userId:req.body.userId}];
        console.log(req.body);
        console.log(comment);
        // console.log(req.body.comments[0].person);
        blog.Blog.findByIdAndUpdate(req.params.id,
         {
            $push: {
                "comments": {
                    $each:comment,
                    $sort:{ "upvotes" : -1 }
                    } 
                }
         },
         {safe: true, upsert: true, new : true},function (err, post) {
            if (err)
                res.send(err);
            console.log(post);
            res.json(post);
        }); 
       

    }); 
    //update comment
    app.post('/blog/comments/update',auth,function(req,res){
        query={'_id':req.body.id,'comments._id':req.body.comment_id}
        blog.Blog.update(query, {'$set': {'comments.$.comment': req.body.comment}},
            function(err,post){
                     if(err)
                        res.send(err);
                    res.json(post);
        })

    });

    //increment comment upvotes
    app.post('/blog/comments/upvote',auth,function(req,res){
            var query={
                          '_id':req.body.id,
                          'comments._id':req.body.comment_id
                        }
            var steps=[
                   
                    {"$unwind": "$comments"},
                    //De-normalized the nested array of comments and upvoters
                    {"$unwind": "$comments.upvoters"},
                    //match id with params.id
                    {"$match": {
                    'comments._id':ObjectId(req.body.comment_id)}
                    },
                    {"$match": 
                     
                    {"comments.upvoters.userId":req.body.userId}


                    },
                    //Project the comments.upvoters object only
                     {"$project" : {"comments.upvoters" : 1}},
                    // //Group and return only the upvoters object
                     {"$group":{"_id":"$comments.upvoters"}}
            ];
             blog.Blog.aggregate(steps, function (err, user) {
                //{'comments.upvoters': {$elemMatch: {userId: req.body.userId}}}
                if (err){
                    res.send(err);
                }    
                
                if (user.length!=0) {
                     blog.Blog.findOneAndUpdate(query,{$pull : {"comments.$.upvoters": {userId: req.body.userId}}},
                      function(err,post){
                        if(err)
                            {
                                console.log(err);
                                res.send(err);
                            }
                            else
                            {
                                
                                blog.Blog.update(query,{'$inc':{'comments.$.upvotes':-1}},function(err,post){

                                    if(err)
                                        res.send(err);
                                    post.upvotes=post.upvotes+1; //i have to increment it by one everytime
                                    //console.log(post);

                                    //to sort comments on basis of most upvotes
                                    blog.Blog.findByIdAndUpdate(req.body.id, {$push : {"comments" :{$each  : [] , $sort : {"upvotes" : -1}}}},{safe: true, upsert: true, new : true},function(err,details){

                                        if(err)
                                            res.send(err);
                                        res.json(details);
                                    })
                                    
                                });
                            } 
                        });

                } else {
                   
                    blog.Blog.findOneAndUpdate(query,{$push : {"comments.$.upvoters": {userId: req.body.userId}}},
                      function(err,post){
                        if(err)
                            {
                                console.log(err);
                                res.send(err);
                            }
                            else
                            {
                                
                                blog.Blog.update(query,{'$inc':{'comments.$.upvotes':1}},function(err,post){

                                    if(err)
                                        res.send(err);
                                    post.upvotes=post.upvotes+1; //i have to increment it by one everytime
                                    //console.log(post);

                                    //to sort comments on basis of most upvotes
                                    blog.Blog.findByIdAndUpdate(req.body.id, {$push : {"comments" :{$each  : [] , $sort : {"upvotes" : -1}}}},{safe: true, upsert: true, new : true},function(err,details){

                                        if(err)
                                            res.send(err);
                                        res.json(details);
                                    })
                                    
                                });
                            } 
                        });
                


                }

            });

        //     blog.Blog.findByIdAndUpdate(req.params.id,{$push : {"upvoters": {userId: req.body.userId}}},
        //                 function(err,post){
        //             if(err)
        //                 {
        //                     console.log(err);
        //                     res.send(err);
        //                 }
        //                 else{
        //                     blog.Blog.findByIdAndUpdate(req.params.id,{$inc: {"upvotes":1}},function(err,post){
        //                         if(err)
        //                             res.send(err);
        //                         post.upvotes=post.upvotes+1; //I have to increment it by one everytime
        //                         res.json(post); 
        //                     });
        //                 } 
        //             });

        // query={
        //     '_id':req.params.id,
        //     'comments._id':req.params.comment_id
        //     }
        // blog.Blog.update(query,{'$inc':{'comments.$.upvotes':1}},function(err,post){

        //     if(err)
        //         res.send(err);
        //     post.upvotes=post.upvotes+1; //i have to increment it by one everytime
        //     //console.log(post);

        //     //to sort comments on basis of most upvotes
        //     blog.Blog.findByIdAndUpdate(req.params.id, {$push : {"comments" :{$each  : [] , $sort : {"upvotes" : -1}}}},{safe: true, upsert: true, new : true},function(err,details){

        //         if(err)
        //             res.send(err);
        //         res.json(details);
        //     })
            
        // });

    });


    //remove comments
    app.post('/blog/comments/delete',auth,function(req,res){

         var query={
                '_id':req.body.id,
                'comments._id':req.body.comment_id
                }
        // console.log(req.body.comments[0].person);
        blog.Blog.findOneAndUpdate(query, {$pull: { comments :{ _id:req.body.comment_id} }},{safe: true, upsert: true, new : true},function (err, post) {
            if (err)
                res.send(err);
            console.log(post);
            res.json(post);
        });
       

    }); 


    //authenticate
    app.post('/authenticate', function(req, res) {

    // find the user
        User.findOne({
            name: req.body.name
        }, function(err, user) {

            if (err) throw err;

            if (!user) {
                res.status(410).json({ success: false, message: 'Authentication failed. User not found.' });
            } else if (user) {

                // check if password matches
                if (user.password != req.body.password) {
                    res.status(411).json({ success: false, message: 'Authentication failed. Wrong password.' });
                } else {

                    // if user is found and password is right
                    // create a token
                    // var token = jwt.sign(user, 'superSecret', {
                    //     expiresIn: 86400 // expires in 24 hours
                    // });

                    req.session.user = req.body.name;
                    req.session.admin = true;
                    //res.send("login success!");

                    res.json({
                        success: true,
                        message: 'Enjoy your session!',
                        session: req.session.user,
                        data:{"name":user.name,"password":user.password,"email":user.email,"_id":user._id,"userId":user.userId}
                    });
                }       

            }

          });
    });
    app.get('/logout', function (req, res) {
      req.session.destroy();
      res.send("logout success!");
    });
    app.get('/verify',auth,function(req,res){
        
        res.json({islogin:true});
    })
    app.get('/content',auth, function (req, res) {
        res.send("You can only see this after you've logged in.");
    });

   //  function auth(req, res, next) {

   //      // check header or url parameters or post parameters for token
   //      var token = req.body.token || req.param('token') || req.headers['x-access-token'];

   //      // decode token
   //      if (token) {

   //          // verifies secret and checks exp
   //          jwt.verify(token, 'superSecret', function(err, decoded) {          
   //              if (err) {
   //                  return res.json({ success: false, message: 'Failed to authenticate token.' });      
   //              } else {
   //                  // if everything is good, save to request for use in other routes
   //                  req.decoded = decoded;  
   //                  next();
   //              }
   //          });

   //      } else {

   //          // if there is no token
   //          // return an error
   //          return res.status(403).send({ 
   //              success: false, 
   //              message: 'No token provided.'
   //          });
            
   //      }
        
   // };

   function auth(req, res, next) {
         var sessionValue = req.body.token || req.param('token') || req.headers['token'];
         if (req.session && req.session.user === sessionValue && req.session.admin)
            return next();
         else {
            // if there is no token
            // return an error
            return res.status(403).send({ 
                success: false, 
                message: 'No token provided.'
            });
            
        }
    };


    // get all todos
    app.get('/api/todos', function(req, res) {

        // use mongoose to get all todos in the database
        Todo.find(function(err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });
    });


    app.get('/api/todos/:id', function(req, res, next) {
      Todo.findById(req.params.id, function (err, todo) {
            if (err)
                res.send(err);
            console.log(todo);
            res.json(todo);
        });
    });
    //search todo
    app.get('/search',function(req,res){
         var regex = new RegExp('again', 'i');
        Todo.find({$text: {$search: "again"}},function(err,results){
             if(err)
                res.send(err);
            console.log(results);
            res.json(results);

        });
        
        // .sort({ score : { $meta : 'textScore' } })
        

    });
    // create todo and send back all todos after creation
    app.post('/api/todos', function(req, res) {

        // create a todo, information comes from AJAX request from Angular
        Todo.create({
            name : req.body.name,
            task:req.body.task,
            done : false
        }, function(err, todo) {
            if (err)
                res.send(err);

            console.log(todo);
            // get and return all the todos after you create another
            // Todo.find(function(err, todos) {
            //     if (err)
            //         res.send(err)
            //     res.json(todos);
            // });

        TodoDetails.create({
            name : req.body.name,
            task:req.body.task,
            myId:todo.myId,
            place:'',
            education:'',
            done : false
          }, function(err, todoDetails) {
            if (err)
                res.send(err);

            console.log(todoDetails);
            // get and return all the todos after you create another
            TodoDetails.find({ myId: todo.myId },function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });


        });

    });
    // //update todo
    // app.put('/api/todos/update/:id', function(req, res, next) {
    //   Todo.findByIdAndUpdate(req.params.id, req.body, function (err, todo) {
    //     if (err) 
    //         res.send(err);

        
    //         Todo.find(function(err, todos) {
    //             if (err)
    //                 res.send(err)
    //             res.json(todos);
    //             });
    //         });

    // });
    // delete a todo
    app.delete('/api/todos/delete/:todo_id', function(req, res) {
        Todo.remove({
            _id : req.params.todo_id
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you delete
            Todo.find(function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });
    });


  //  ----------------------------------------------------------------------------------------//
  //------------------------------------------------------------------------------------------//




  // app.post('/api/todoDetails/:myId', function(req, res) {

  //       // create a todo, information comes from AJAX request from Angular
  //       TodoDetails.create({
  //           name : req.body.name,
  //           task:req.body.task,
  //           place:req.body.place,
  //           education:req.body.education,
  //           myId:req.params.myId,
  //           done : false
  //       }, function(err, todo) {
  //           if (err)
  //               res.send(err);

  //           console.log(todo);
  //           // get and return all the todos after you create another
  //           TodoDetails.find({ myId: req.params.myId },function(err, todos) {
  //               if (err)
  //                   res.send(err)
  //               res.json(todos);
  //           });
  //       });

  //   });

  //update todoDetails
    app.put('/api/todoDetails/update/:myId', function(req, res, next) {
      TodoDetails.findOneAndUpdate({ myId: req.params.myId }, req.body, function (err, todo) {
        if (err) 
            res.send(err);

        
            TodoDetails.find(function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
                });
            });

    });


  //delete tododetails

  app.delete('/api/todoDetails/delete/:todoDetails_id', function(req, res) {
        TodoDetails.remove({
            _id : req.params.todoDetails_id
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you delete
            TodoDetails.find(function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });
    });

   app.get('/api/todoDetails/:id', function(req, res) {

        TodoDetails.find({ myId: req.params.id }, function (err, todo) {
            if (err)
                res.send(err);
            console.log(todo);
            res.json(todo);
        });
    });

};