/*绘制路线*/
define('home/router', function(require, exports, module) {

	var $ = require('lib/zepto');
	var Events = require('lib/events');
	var router = new Events();
	
	router.on('show', function(){
		$('.router').show();
		var rt = router.get('router');
		var wrapper = $('#ROUTER_TPL');
	  	var tpl = $('#tpl_router').html();
	  	
	  	var data = {
	  		items: rt
	  	};
	  	
	  	var html = _.template(tpl)(data);
	  	wrapper.html(html);
	});
	
	return router;
	
});