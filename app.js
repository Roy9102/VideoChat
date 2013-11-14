
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var dbsetting = require('./setting');
var partials = require('express-partials');
var mongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');
var dbDisconnect = require('./Modules/db');

var sio = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon(path.join(__dirname, 'public/images/icon.png')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

app.use(flash());
app.use(express.cookieParser());

app.use(express.session({
	secret: dbsetting.cookieSecret,
	store: new mongoStore({
		db: dbsetting.db
	},function(){
		console.log('connect mongodb success...');
	})
	})
);

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.on('close', function(err) {
    dbDisconnect();
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io=sio.listen(server);

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
    callback(null, true); // error first callback style 
  });
}); 



routes(app,io);