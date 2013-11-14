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
				self.conversate=new Conversation(self.connection.socket.sessionid,msg.from,self.SendMsg);
				self.conversate.HandleMessage(message);
			}
		});
		this.connection.on('refreshList',function(message){
			$('#friendUl').empty();
			for(var i=0; i<message.length; i++){
				var h3=$('<h3></h3>').html(message[i].name);
				var p=$('<p><p>').html(message[i].mood);
				var img=($('<img  />').attr('src',message[i].userFace));
				img.attr('dest',message[i].userId);
				var li=$('<li></li>');
				li.append(h3);
				li.append(img);
				li.append(p);
				$('#friendUl').append(li);
			}
			$('#friendUl').dblclick(function(e){
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
					$('#chat_window').fadeIn().children('#chat_top').children('h2').html(name);
					var invitation={
						inviter:$('#user_face h3').html(),
						inviterId:$('#user_face img').attr('userId'),
						inviteeId: destination,
						}
						self.connection.emit("invite",invitation);
				});
		});
		this.connection.on('invite',function(message){
			self.accepted=window.confirm("来自用户"+message.inviter+"的邀请");
			if(self.accepted)
			{
				self.startVideoCall(message.inviterId);
			}else{
				var d={
					user:"<%=req.session.user%>",
					id: message.inviterId
				}
				self.connection.emit('reject',d);
			}
		});
		this.connection.on('reject',function(message){
			alert("用户"+message.user+"拒绝你的请求");
		});
		this.connection.on('unconnect',function(e){
			console.log('received a unconnect event',e);
			if(self.conversate)
			{
				self.conversate=null;
			}
		});
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
			self.conversate= new Conversation(self.connection.socket.sessionid,to,self.SendMsg);
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
