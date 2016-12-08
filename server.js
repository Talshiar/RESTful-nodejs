var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var configDB = require('./config/database.js');
var connection = mongoose.connect(configDB.url);

autoIncrement.initialize(connection);

require('./config/passport')(passport);

//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
app.use(bodyParser());
app.use(cookieParser());

app.set('view engine', 'ejs');


app.use(session({ secret: '1234567890'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ROUTES
require('./app/routes.js')(app, passport);

// START SERVER
app.listen(port);
console.log('Magic happens on port ' + port);