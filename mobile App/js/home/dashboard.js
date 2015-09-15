define('home/dashboard', function(require, exports, module) {
	var zepto = require('lib/zepto_pj');
	var events = require('home/events');
	var charts = $('#charts');
	var charts_dash = $('#charts_dash');


	$('.e_charts_arrow')

	charts.on('click', function() {
		if(charts_dash.css('display') === 'none'){
			charts_dash.fadeIn();
			var opts = {
				lines: 12, 
				angle: 0, 
				lineWidth: 0.22, 
				pointer: {
					length: 0.9, 
					strokeWidth: 0.061, 
					color: '#E82D00' 
				},
				limitMax: 'false', 
				colorStart: '#00C348', 
				colorStop: '#00C348',
				strokeColor: '#E0E0E0',
				generateGradient: true
			};
			var target = document.getElementById('speed_dash'); 
			var gauge = new Gauge(target).setOptions(opts); 
			gauge.maxValue = 100; 
			gauge.animationSpeed = 10; 
			gauge.set(50);
			
			setInterval(function(){
				var val = parseInt(events.get('dashSpeed'));
				val = val + parseInt(Math.random() * 2);
				if(isNaN(val)){
					return;
				}
				gauge.set(val); 
			}, 1000);
			
		}else{
			charts_dash.fadeOut();
		}
		
	});

});