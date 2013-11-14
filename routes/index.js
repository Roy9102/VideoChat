
/*
 * GET home page.
 */

var crypto = require('crypto');
var fs = require('fs');
var User = require('../Modules/User');
var FriendList = require('../Modules/FriendList');
 
 
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
		res.render('chat',{title:'Chat',user: req.session.user,error:req.flash('error').toString(),success:req.flash('success').toString()});
		var client = [];
		var users = [];
		io.of('/chat').on('connection',function(socket){
			socket.on('on-line',function(client){
				FriendList.findOne({hostId:client.userId},function(err,doc){
					var friends;
					if(doc === null){
						console.log(err);
						friends = [];
					}else{
						friends= doc.list;
					}
					socket.emit('refreshList',friends);
				});
			});
			socket.on('invite',function(data){
				console.log(data);
			});
		});
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