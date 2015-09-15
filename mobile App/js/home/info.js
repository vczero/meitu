define('home/info', function(require, exports, module) {
	var _ = require('lib/underscore');
	var $ = require('lib/zepto_pj');
	var router = require('common/data').router[1];
	var Events = require('lib/events');
	var info = new Events();
	var wrapper = $('#SN_TPL');
	var tpl = $('#tpl').html();
	//隐藏和显示
	var SN_info_btn = $('#SN_info_btn');
	var SN_info = $('.SN_info');
	var SN_info_item = $('.SN_info_item');
	SN_info_btn.on('click', function() {
		if (parseInt(SN_info.css('height')) > 100) {
			SN_info.css('height', '25px');
			$('.SN_info_btn_icon').css('fontSize', '20px');
			SN_info_item.hide();
		} else {
			SN_info.css('height', '130px');
			SN_info_item.show();
			$('.SN_info_btn_icon').css('fontSize', '17px');
		}
	});
	
	//外部触发
	info.on('refresh', function(){
		var width = document.body.clientWidth;
		var items = info.get('list');
		var router = info.get('router');
		
		var data = {
			width: width - 20,
			tui_width: width - 140,
			list: router,
			data: items
		};
		var html = _.template(tpl)(data);
		wrapper.html(html);
		
		//使用动画
		var wrapperContent = $('.SN_info_wrapper');
		var wholeLength = width * data.list.length;
		wrapper.css('width', wholeLength);
		
		//默认隐藏在底部
		SN_info.fadeIn();//加载
		SN_info.css('height', '25px');
		$('.SN_info_btn_icon').css('fontSize', '20px');
		SN_info_item.hide();
		
		//记录初始位置
		var startX = 0;
		wrapperContent.on('touchstart', function(e) {
			startX = e.changedTouches[0].clientX;
		});
		wrapperContent.on('touchend', endTouch);
		
		//动画
		function endTouch(e) {
			var dis = e.changedTouches[0].clientX - startX;
			//获取当前translate3d的位置
			var transform = wrapperContent.css('transform') || wrapperContent.css('-webkit-transform');
			var currentPos = parseInt(transform.split(',')[0].split('(')[1]);
			
			//移动
			if (Math.abs(dis) > 20) {
				//左移
				if (dis < -20) {
					var w = 0;
					var handle = setInterval(function() {
						w += width / 8;
						if (w <= width && Math.abs(currentPos) < (wholeLength - width - 10)) {
							var newX = (currentPos - w);
							wrapperContent.css('transform', 'translate3d(' + newX + 'px, 0px, 0px)');
							wrapperContent.css('-webkit-transform', 'translate3d(' + newX + 'px, 0px, 0px)');
						} else {
							clearInterval(handle);
						}
	
					}, 30);
				}
	
				//右移
				if (dis > 20) {
					var w = 0;
					var handle = setInterval(function() {
						w += width / 8;
						if (w <= width && Math.abs(currentPos) > 10) {
							var newX = (currentPos + w);
							wrapperContent.css('transform', 'translate3d(' + newX + 'px, 0px, 0px)');
							wrapperContent.css('-webkit-transform', 'translate3d(' + newX + 'px, 0px, 0px)');
						} else {
							clearInterval(handle);
						}
					}, 30);
				}
			}
		}

		
	});
	return info;

});