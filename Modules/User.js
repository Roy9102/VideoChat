//User.js


var mongoose = require('mongoose');    //引用mongoose模块

var User = new mongoose.Schema({
	userId :String,
	name: String,
	age:{
		type:Number,
		default:18,
		min:1,
		max:100
	},
	mood : {
		type:String,
		default:'Fresh Man, Welcome Here!'
	},
	userFace:{
		type:String,
		default:'/userLogo/user.png'
	},
	password:String,
});

var Person = mongoose.model('Person',User)


module.exports = Person;

