//DB.js

var setting = require('../setting');
var mongoose = require('mongoose');    //引用mongoose模块

var db = mongoose.connect('mongodb://'+setting.host+':'+setting.port + '/' + setting.db,{server:{poolSize:10}}); //创建一个数据库连接

var connection = mongoose.connection;

connection.on('connecting',function(){
	console.log('DB Connecting');
});

connection.on('connected',function(){
	console.log('DB Connected');
});

connection.on('open',function(){
	console.log('DB opened');
});

connection.on('disconnected',function(){
	console.log('DB disconnected');
});

connection.on('close',function(){
	console.log('DB closed');
});

connection.on('reconnected',function(){
	console.log('DB reconnected');
});

connection.on('error',function(){
	console.log('DB error');
});

connection.on('fullsetup',function(){
	console.log('DB fullsetup');
});




module.exports = function(){
	mongoose.disconnect(function(err){
		console.log('all the Connection closed.');
	});
};