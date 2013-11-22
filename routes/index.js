
/*
 * GET home page.
 */

var crypto = require('crypto');
var fs = require('fs');
var User = require('../Modules/User');
var FriendList = require('../Modules/FriendList');
var users = {};
 
 
module.exports = function(app,io){
	app.get('/',function(req, res){
		res.render('index', { title: 'Express',error:req.flash('error').toString(),success:req.flash('success').toString() });
	});
	app.get('/login',checkNotLogin);	
	app.get('/login',function(req,res){
		res.render('login', {title:'Login',error:req.flash('error').toString(),success:req.flash('success').toString()});
	});

	app.post('/login',function(req,res){
		User.findOne({userId:req.body.userId},function(err,person){
			if(!person){
				req.flash('error',"用户名不存在");
				return res.redirect('/login');
			}else{
				if(person.password === req.body.password){
					req.session.user = person;
					return res.redirect('/chat');
				}
				else{
					req.flash('error','	密码错误~');
					return res.redirect('/login')
				}
				
			}
		});
	});
	app.get('/logout',function(req,res){
		if(req.session.user){
			req.session.user=null;
			delete users;
			return res.redirect('/login');
		}else{
			return res.redirect('/login');
		}
	});
	app.get('/registe',checkNotLogin);
	app.get('/registe',function(req,res){
		res.render('registe',{title:'Registe'})
	});	
	app.get('/chat',checkLogin);
	app.get('/chat',function(req, res){
		io.of('/chat').on('connection',function(socket){
			socket.on('on-line',function(client){
				var clienter = JSON.parse(client);
				if(!users[clienter.userId]){
					console.log(clienter.userId+'上线了~~');
					users[clienter.userId] = {socket:socket};
					FriendList.findOne({hostId:clienter.userId},function(err,doc){
						var friends;
						if(doc === null){
							console.log(err);
							friends = [];
						}else{
							friends= doc.list;
						}
						users[clienter.userId].socket.emit('refreshList',friends);
					});
				}
			});
			
			socket.on('invite',function(invitation){
				var ivt = JSON.parse(invitation);
				users[ivt.inviteeId].socket.emit('invite', invitation);
			});
			
			socket.on('reject',function(message){
				var msg = JSON.parse(message);
				users[msg.id].socket.emit('reject', message);
			});
			socket.on('message',function(msg){
				var message = JSON.parse(msg);
				users[message.destination].socket.emit('message',msg);
			});
			socket.on('text',function(text){
				var txt = JSON.parse(text);
				users[txt.destination].socket.emit('text',text);
			});
			socket.on('disconnect',function(){
				var socketUser;
				for(var i in users){
					if(users[i]===socket){
						socketUser = i;
						break;
					}
				}
				console.log(socketUser+'下线了~');
				delete users[socketUser];
				socket.broadcast.emit('off-line',socketUser);
			});
		});
		res.render('chat',{title:'Chat',user: req.session.user,error:req.flash('error').toString(),success:req.flash('success').toString()});
	});
	
	function checkLogin(req, res, next){ 
		if (!req.session.user) { 
			req.flash('error', '未登录!');       
			return res.redirect('/login');    
		}   
		next();  
	}  
	function checkNotLogin(req, res, next) {    
		if (req.session.user) {   
			req.flash('error', '已登录!');       
			return res.redirect('back');   
		}   
	next(); 
	}
}