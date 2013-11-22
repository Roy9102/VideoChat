//webRTC.js
//chat.js
$(function(){
	var broswer;
	var webRTCsupport;
	var RTCPeerConnection;
	var getUserMedia;
	var localStream;
	if(navigator.mozGetUserMedia)
	{
		console.log("the Browser is firefox");
		browser="firefox";
		RTCPeerConnection=mozRTCPeerConnection;
		RTCSessionDescription=mozRTCSessionDescription;
		RTCIceCandidate=mozRTCIceCandidate;
		getUserMedia=navigator.mozGetUserMedia.bind(navigator);
		webRTCsupport=true;
	}else if(navigator.webkitGetUserMedia)
	{
		console.log("the browser is Chrome");
		browser="chrome";
		RTCPeerConnection=webkitRTCPeerConnection;
		getUserMedia=navigator.webkitGetUserMedia.bind(navigator);
		webRTCsupport=true;
	}else{
		webRTCsupport=false;
		alert("Your Browser Can not Support webRTC, Please intall Chrome or Firefox Browser~~");
	}
	var Conversation=function(from,to,fn)
	{
		var config;
		var self=this;
		if(broswer==="firefox")
		{
			var config={"iceServer":[{"url":"stun:124.124.124.2"}]};
		}else if(broswer==="chrome")
		{
			var config={"iceServer":[{"url": "stun:stun.l.google.com:19302"}]};;
		}
		Conversation.prototype.getRemoteStream=function(e){
			var src=window.URL.createObjectURL(e.stream);
			$('#remote').attr("src",src);
			$('#remote').attr("autoplay",true);
			
		}
		Conversation.prototype.onIceCandidate=function(msg){
			if(msg.candidate)
			{
				self.SendMsg('candidate',msg.candidate,self.from,self.destination);
				console.log("On Candidate~~");
			}else{
				console.log("End Candidate~");
			}
		}
		this.RemoveMedia=function(stream){
			$('#remote').attr('display','none').fadeOut();
		}
		this.SendMsg=function (type,cont,from,to){
			fn(type,cont,from,to);
		}
		this.from=from;
		this.destination=to;
		this.pc=new RTCPeerConnection(config);
		this.pc.addStream(localStream);
		this.pc.onaddstream=this.getRemoteStream.bind(this);
		this.pc.onicecandidate=this.onIceCandidate.bind(this);
		this.pc.onremovestream=this.RemoveMedia.bind(this);
		Conversation.prototype.HandleMessage=function(message){
			var msg=JSON.parse(message);
			if(msg.type==="offer")
			{
				console.log("set remote description");
				this.pc.setRemoteDescription(new RTCSessionDescription(msg.content));
				this.answer();
			}else if(msg.type==="answer"){
				console.log("create an answer");
				this.pc.setRemoteDescription(new RTCSessionDescription(msg.content));
			}else if(msg.type==="candidate"){
				console.log("received an candidate");
				try{
					if(typeof msg.content=="object")
					{
						var candidate=new RTCIceCandidate(msg.content);
						this.pc.addIceCandidate(candidate);
					}
				}catch(e){
					console.log("candidate error",e);
				}
			}
		}
	
		Conversation.prototype.start=function(){
			console.log("create an Offer");
			this.pc.createOffer(function(desc){
				console.log("set a session description");
				self.pc.setLocalDescription(desc);
				self.SendMsg("offer",desc,self.from,self.destination);
			},self.errorCallback);
		}
		Conversation.prototype.answer=function(){
			console.log("answer called");
			this.pc.createAnswer(function(desc){
				console.log("set a session description ");
				self.pc.setLocalDescription(desc);
				self.SendMsg("answer",desc,self.from,self.destination);
			},this.errorCallback);
		}
	
	}
	var webRTC=function(){
		this.connection=io.connect('http://172.27.33.9/chat');
		this.conversate;
		this.accepted=false;
		var self=this;
		this.connection.on('message',function(message){
			var msg=JSON.parse(message);
			if(self.conversate)
			{
				self.conversate.HandleMessage(message);
			}else{
				self.conversate=new Conversation($('#user_face img').attr('userId'),msg.from,self.SendMsg);
				self.conversate.HandleMessage(message);
			}
		});
		this.connection.on('refreshList',function(message){
			$('#friendUl').empty();
			for(var i=0; i<message.length; i++){
				var h3=$('<h3></h3>').html(message[i].name);
				var p=$('<p></p>').html(message[i].mood);
				var img=($('<img  />').attr('src',message[i].userFace));
				img.attr('dest',message[i].userId);
				var li=$('<li></li>');
				li.append(h3);
				li.append(img);
				li.append(p);
				$('#friendUl').append(li);
			}
			$('#friendUl').on('dblclick',function(e){
					var target = e.target;
					var name,destination;
					if(target.tagName ==='H3'){
						name = $(target).html();
						destination = $(target).next('img').attr('dest');
					}else if(target.tagName ==='LI'){
						name = $(target).children('h3').html();
						destination  = $(target).children('img').attr('dest');
					}else{
						if(target.tagName ==='IMG'){
							destination = $(target).attr('dest');
						}else{
							destination = $(target).prevAll('img').attr('dest');
						}
						name = $(target).prevAll('h3').html();
					}
					 $('#window').fadeIn().children('#chat_window').children('#chat_top').children('h2').html(name).attr('dest',destination);
					var invitation={
						inviter:$('#user_face h3').html(),
						inviterId:$('#user_face img').attr('userId'),
						inviteeId: destination,
					}
					console.log('emit invite');
					//self.connection.emit("invite",JSON.stringify(invitation));
				});
		});
		this.connection.on('invite',function(message){
			var msg = JSON.parse(message);
			self.accepted=window.confirm("来自用户"+message.inviter+"的邀请");
			if(self.accepted)
			{
				self.startVideoCall(message.inviterId);
			}else{
				var d={
					user:$('#user_face h3').html(),
					id: message.inviterId
				}
				self.connection.emit('reject',JSON.stringify(d));
			}
		});
		this.connection.on('reject',function(message){
			var msg = JSON.parse(message);
			alert("用户"+msg.user+"拒绝你的请求");
		});
		this.connection.on('off-line',function(user){
			console.log('received a off-line event',user);
			if(self.conversate &&　self.conversate.destination === user)
			{
				$('#remote').stop();
				$('#remote').attr('src','');	
				delete self.conversate;
			}
			var hint = $('#msg_hint');
			var li = $('<li></li>');
			var p = $('<p></p>').html('<strong>'+user+'</strong>'+' 下线了~');
			li.append(p);
			
		});
		
		/*text chat*/
		this.connection.on('text',function(content){
			var cont = JSON.parse(content);
			console.log(cont);
			var ring = $('<audio></audio>').attr('src','/sounds/message_ring.mp3').attr('autoplay',true);
			var hint = $('#msg_hint');
			if($('#chat_window').css('display')==='block'){
				var div = self.showContent(cont.name,cont.msg);
				$('#chat_content').append(div);
			}else{
				var s = $('#hint_list li p strong');
				if(s.length){
					for(var i=0; i<s.length;i++){
						if(s.html()===cont.name){
							var  n = parseInt(s.parents('li').children('span').html());
							n++; 
							s.parents('li').children('span').html(n);
							break;
						}
					}
				}else{;
					var li = $('<li></li>');
					var p = $('<p></p>').html('<strong>'+cont.name+'</strong>'+' send you a message').css('display','inline-block');
					var span=$('<span></span>').html(1).addClass('pop');
					li.append(p);
					li.append(span); 
					$('#hint_list').append(li);
					hint.fadeIn().css('right','0');
				}
			}
			hint.on('click',function(e){
				var target = e.target;
				hint.fadeOut().css('right','-280px');
				$('#chat_window').fadeIn().children('#chat_top').children('h2').html(cont.name).attr('dest',cont.from);
				var div = self.showContent(cont.name,cont.msg);
				$('#chat_content').append(div);
				if(target.tagName ==='P'){
					$(target).parent('li').remove();
				}else{
					$(target).remove();
				}
			});
			
		});
		
		this.showContent = function(name,msg){
			var date = new Date();
			var time = date.getHours()+':' + date.getMinutes() + ':' + date.getSeconds();
			var h2 = $('<h2></h2>').html(name+'    '+time).css('color','lightblue');
			var p = $('<p></p>').html(msg);
			var div = $('<div></div>').append(h2);
			div.append(p);
			return div;
		}
		/*text chat*/
		this.getLocalMedia=function(option){
			try{
				getUserMedia(option,function(stream){
					localStream=stream;
					var src=window.URL.createObjectURL(stream);
					$('#local').attr('src',src);
					$('#local').attr('autoplay',true);
				},this.errorCallback);
			}catch(e){
				console.log("there were some problem when you try to get the local-Media-Stream",e);
			}
		}
		this.errorCallback=function(err){
			console.log("errorCallback called",err);
		}
		this.startVideoCall=function(to){
			self.conversate= new Conversation($('#user_face img').attr('userId'),to,self.SendMsg);
			self.conversate.start();
		}
		webRTC.prototype.SendMsg=function(type,cont,from,to){
			var data={
				type:type,
				content:cont,
				from:from,
				destination:to
			}
			self.connection.emit('message',JSON.stringify(data));
		}
	}
	window.WebRTC=webRTC;
});
