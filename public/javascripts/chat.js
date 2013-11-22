//chat.js
$(function(){
	var chat = new WebRTC();
	chat.connection.emit('on-line',JSON.stringify({userId:$('#user_face img').attr('userId'), username:$('#user_face h3').html()}));
	chat.getLocalMedia({video:true});
	$('div#panel_top').mousedown(function(evt){
		var pageX = evt.pageX;
		var pageY = evt.pageY;
		var left =$('aside#panel').offset().left;
		var top =$('aside#panel').offset().top;
		var point = {
			x:pageX-left,
			y:pageY-top
		};
		$('div#panel_top').mousemove(function(evt){
			var descX = evt.pageX;
			var descY = evt.pageY;
			var distance = {
				x:Math.abs(descX-point.x)+'px',
				y:Math.abs(descY-point.y)+'px'
			}
			$('aside#panel').css({'left':distance.x,'top':distance.y})
		}); 
		$('div#panel_top').bind('mouseup',function(evt){
			var descX = evt.pageX;
			var descY = evt.pageY;
			var distance = {
				x:Math.abs(descX-point.x)+'px',
				y:Math.abs(descY-point.y)+'px'
			}
			$('div#panel_top').unbind('mousemove');
			$('div#panel_top').unbind('mouseup');
			$('div#panel_top').unbind('mouseout');
			$('aside#panel').css({'left':distance.x,'top':distance.y});
		}); 
		$('div#panel_top').bind('mouseout',function(evt){
			var descX = evt.pageX;
			var descY = evt.pageY; 
			var distance = {
				x:Math.abs(descX-point.x)+'px',
				y:Math.abs(descY-point.y)+'px'
			}
			$('div#panel_top').unbind('mousemove');
			$('div#panel_top').unbind('mouseup');
			$('div#panel_top').unbind('mouseout');
			$('aside#panel').css({'left':distance.x,'top':distance.y});
		}); 
		$(document).mouseup(function(){
			$('div#panel_top').unbind('mousemove');
			$('div#panel_top').unbind('mouseup');
			$('div#panel_top').unbind('mouseout');
		});
 	});
	$('#dropDown').click(function(){
		$('#dropMenu ul').slideToggle(300);
	});
	
	$('span#close').click(function(){
		//$(this).parents('#window').fadeOut();
		$(this).parents('#window').children('#videoCall').animate({webkitTransform:'rotateY(0deg)'});
	});
	
	$('#send').on('click',function(){
		if($('#message').val()){
			var msg = $('#message').val();
			var content = {
				msg:msg,
				destination:$('#chat_top h2').attr('dest'),
				from:$('#user_face img').attr('userId'),
				name:$('#user_face h3').html()
			}
			chat.connection.emit('text',JSON.stringify(content));
			$('#message').val('');	
			var div = chat.showContent($('#user_face h3').html(),msg);
			$('#chat_content').append(div);
		}else{
			$('#send_div div.tips').css('left','-150px').fadeIn();
			setTimeout(function(){
				$('#send_div div.tips').fadeOut().css('left','400px');
			},1600);
		}
		
	});
	
});
