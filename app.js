var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;
         // mongoose for mongodb
var crypto = require('crypto');
var morgan   = require('morgan');                // log requests to the console (express4)
var bodyParser = require('body-parser');
var textSearch = require('mongoose-text-search');
var jwt    = require('jsonwebtoken');       // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// app.use(errorHandler());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000*60 }, //60 min
    rolling: true   //will refresh expiration period back to maxAge :D
}));
require('./public/app/routes.js')(app);
mongoose.connect('localhost:27017/restaurant');     // connect to mongoDB database on modulus.io
// app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;






// configuration ===============================================================

//mongoose.connect('mongodb://localhost/todoAppTest');

// routes ======================================================================


// app.get('/*', function(req, res){
//     res.sendfile(__dirname + '/public/index.html');
// });

// app.listen(port);
// console.log("App listening on port : " + port);
//
