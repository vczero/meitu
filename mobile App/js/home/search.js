
define('home/search', function(require, exports, module){
	
	var $ = require('lib/zepto_pj');
	var map = require('home/map');
	var events = require('home/events');
	var info = require('home/info');
	var routers = require('common/data').router;
	var input = $('#search_input_text');
	var btn = $('.search_btn');

	var tpl = $('#tpl_search').html();
	var container = $('#SEARCH_TPL');
	
	var data = {
		items:[
			{
				router: '上海到扬州',
				desc: '两日游'
			},
			{
				router: '上海到常州',
				desc: '一日游'
			},
			{
				router: '上海到衢州',
				desc: '两日游'
			},
			{
				router: '郑州到青岛',
				desc: '三日游'
			}
		]
	};

	
	//focus事件
	input.on('focus', function(){
		var html = _.template(tpl)(data);
		container.html(html);
		container.fadeIn();
	});
	
	//选择list列表
	container.on('click', function(e){
		var el = $(e.target);
		var index = el.attr('_index');
		//路线出现在输入框
		input.val(data.items[index].router);
		//隐藏结果列表
		container.fadeOut();	
		
		//搜索
		//路径规划
		events.set('router', routers[index]);
		events.trigger('mapRefresh');
		events.trigger('drawOriginDestination');
		events.trigger('getWayPoints');
		events.trigger('drawRouter');
		events.trigger('carRun');
		events.trigger('calcuSpeed');
		events.trigger('getWeather');
		
		//触发数据填充到推荐列表
		var infoHandle = setInterval(function(){
			if(events.get('hots').length && events.get('hots')[0].name){
				info.set('router', events.get('router'));
				info.set('list', events.get('hots'));
				info.trigger('refresh');
				clearInterval(infoHandle);
			}
		}, 1000);
		
	});
	
		
	btn.on('click', function(){
		var val = input.val();
		for(var i in data.items){
			if(data.items[i].router === val){
				return;
			}
		}
		//格式过滤
		if(val.split('到').length !== 2){
			return;
		}
		var sName = val.split('到')[0];
		var eName = val.split('到')[1];
		//进行两点搜索,获取两点经纬度
		AMap.service(["AMap.Geocoder"], function() {
			var geocoder = new AMap.Geocoder({
	            radius: 1000,
	            extensions: 'base'
	        });
	        geocoder.getLocation(sName, function(status, result){
	        		if(status === 'error') {
	                console.log('服务请求出错');
	            }
	            if(status === 'no_data') {
	                console.log('无数据返回，请换个关键字试试～～');
	            }
	            else {
	            		var geocodes = result.geocodes;
	                if(geocodes.length && result.info === 'OK'){
	                		var sLoc = geocodes[0].location;
	                		//解析第二个点
	                		geocoder.getLocation(eName, function(eStatus, eResult){
	                			if(eStatus === 'error') {
				                console.log('服务请求出错');
				            }
				            if(eStatus === 'no_data') {
				                console.log('无数据返回，请换个关键字试试～～');
				            }
				            else {				            		
				            		var eGeocodes = eResult.geocodes;
				                if(eGeocodes.length && eResult.info === 'OK'){
				                		var eLoc = eGeocodes[0].location;
				                		var seRouter = [
				                			{
				                				x: sLoc.lng,
				                				y: sLoc.lat,
				                				startTime: '6:00',
				                				content: sName
				                			},
				                			{
				                				x: eLoc.lng,
				                				y: eLoc.lat,
				                				content: eName
				                			}
				                		];
				                		//规划路线
				                		container.fadeOut();
				                		events.set('router', seRouter);
									events.trigger('mapRefresh');
									events.trigger('drawOriginDestination');
									events.trigger('getWayPoints');
									events.trigger('drawRouter');
									events.trigger('carRun');
									events.trigger('calcuSpeed');
									events.trigger('getWeather');
									
									//触发数据填充到推荐列表
									var infoHandle = setInterval(function(){
										if(events.get('hots').length && events.get('hots')[0].name){
											info.set('router', events.get('router'));
											info.set('list', events.get('hots'));
											info.trigger('refresh');
											clearInterval(infoHandle);
										}
									}, 1000);
				                		
				                }
				            }
	                			
	                			
	                		});
	                }
	            }
	        });
	        
		});
		
		
	});
	
});