

define('home/tools', function(require, exports, module){
	
	var $ = require('lib/zepto_pj');
	var tools = $('.tools');
	var tools_list = $('#tools_list');

	//显示隐藏工具集
	tools_list.on('click', function(){
		tools.css('overflow', 'hidden');

		var height = parseInt($('.tools').css('height'));
		if(height > 55){
			var hideHandle = setInterval(function(){
				height -= 50;
				if(height < 10){
					tools_list.css('border', '1px solid #0091FF');
					clearInterval(hideHandle);
				}else {
					tools.css('height', height + 'px');
				}
			}, 20);
		}else {
			var showHandle = setInterval(function(){
				height += 50;
				if(height > 360){
					clearInterval(showHandle);
					tools_list.css('border', '1px solid #A3A3A3');
				}else {
					tools.css('height', height + 'px');
				}
			}, 20);
		}
	});
	
	//加载iframe
	var common_div = $('#common_div_main');
	var common_div_iframe = $('#common_div_iframe');
	
	//计算屏幕宽高
	var width = document.body.clientWidth;
	var height = document.body.clientHeight;
	
	$('#tools_tucao').on('click', function(){
		common_div_iframe.attr('src', "http://vczero.github.io/meitu/toupiao/danmu.html");
		common_div_iframe.css('height', height);
		common_div_iframe.css('width', width);
		common_div.fadeIn();
	});
	
	$('#tools_huodong').on('click', function(){
		common_div_iframe.attr('src', "http://123.57.39.116:9797/toupiao/activity.html");
		common_div_iframe.css('height', height);
		common_div_iframe.css('width', width);
		common_div.fadeIn();
	});
	
	$('#tools_fenxiang').on('click', function(){
		common_div_iframe.attr('src', "http://123.57.39.116:9797/toupiao/histroy.html");
		common_div_iframe.css('height', height);
		common_div_iframe.css('width', width);
		common_div.fadeIn();
	});
	
	$('#tools_tou').on('click', function(){
		common_div_iframe.attr('src', "http://123.57.39.116:9797/toupiao/vote.html");
		common_div_iframe.css('height', height);
		common_div_iframe.css('width', width);
		common_div.fadeIn();
	});
	
	$('.common_close').on('click', function(){
		common_div_iframe.attr('src', '');
		common_div.fadeOut();
	});
	
	
	$('.shangbao_close').on('click', function(){
		$('.shangbao_div').fadeOut();
	});
	
	$('#tools_shangbao').on('click', function(){
		$('.shangbao_div').fadeIn();
	});

	
});