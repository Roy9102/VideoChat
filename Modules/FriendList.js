//FriendList.js

var mongoose = require('mongoose');    //引用mongoose模块


var List = {
	hostId:String,
	list:[
		{
			userId:String,
			name: String,
			mood:String,
			userFace:{
				type:String,
				default:'/userLogo/user.png'
			},
		}
	]
}
var lists = mongoose.model('Friendlist',List);

module.exports = lists;