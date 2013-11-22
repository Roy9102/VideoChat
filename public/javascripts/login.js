//login.js
$(function(){
	if($('input#userId').val() && $('input#password').val()){
		$('input:text,input:password').prev('label').hide();
		$('.btn').removeClass('disable').addClass('able');
	}
	if(window.localStorage && localStorage.length){
		var keyword = localStorage.key(0);
		var user = JSON.parse(localStorage.getItem(keyword));
		$('input:text,input:password').prev('label').hide();
		$('input#userId').val(user.userId);
		$('input#password').val(user.password);
		$('.btn').removeClass('disable').addClass('able');
	}
	$('input:text,input:password').focus(function(){
		$(this).prev('label').fadeOut();
	});
	$('input:text,input:password').blur(function(){
		if($(this).val()===''){
			$(this).prev('label').fadeIn();
		}
		if($('input#userId').val()!=''&& $('input#password').val()!=''){
			$('.btn').removeClass('disable').addClass('able');
		}
		if($('input#userId').val()=='' || $('input#password').val()==''){
			$('.btn').removeClass('able').addClass('disable');
		}
	});
	
	$('.autoFade').fadeToggle(3000);		
	$('#login').click(function(){
		 if($('#savePwd').is(':checked')){
			if(window.localStorage){
				var user ={
					userId :$('input#userId').val(),
					password :$('input#password').val()
				}
				localStorage.setItem($('input#userId').val(),JSON.stringify(user));
			}
		}; 
	});
});