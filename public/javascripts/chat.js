//chat.js
$(function(){
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
		$('div#panel_top').mouseup(function(evt){
			var descX = evt.pageX;
			var descY = evt.pageY;
			var distance = {
				x:Math.abs(descX-point.x)+'px',
				y:Math.abs(descY-point.y)+'px'
			}
			$('div#panel_top').unbind('mousemove');
			$('div#panel_top').unbind('mouseup');
			$('aside#panel').css({'left':distance.x,'top':distance.y});
		}); 
		$(document).mouseup(function(){
			$('div#panel_top').unbind('mousemove');
			$('div#panel_top').unbind('mouseup');
		});
 	});
	
	$('#dropDown').click(function(){
		$('#dropMenu ul').slideToggle(300);
	});
	
	$('span#close').click(function(){
		$(this).parents('#chat_window').fadeOut();
	});
});
