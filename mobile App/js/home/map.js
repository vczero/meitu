
define('home/map', function(require, exports, module){

	var $ = require('lib/zepto_pj');
	
	//初始化地图
	var map = new AMap.Map('map', {
		mapStyle: 'fresh',
		resizeEnable: true,
	});
	map.setZoom(10);
	
	AMap.event.addListener(map, 'click', function(){
		$('#SEARCH_TPL').fadeOut();
	});
	
	
	return map;

});