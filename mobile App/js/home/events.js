//全局事件
define('home/events', function(require, exports, module) {
	var $ = require('lib/zepto_pj');
	var rt = require('home/router');
	var Events = require('lib/events');
	//全局事件对象
	var events = new Events();
	//地图
	var map = require('home/map');
	//获取路线数据
	var router = require('common/data').router[0];
	
	events.on('mapRefresh', function(){
		map.clearMap();
		if(events.get('carWatchHandle')){
			clearInterval(events.get('carWatchHandle'));
		}
		if(events.get('realSpeedHandle')){
			clearInterval(events.get('realSpeedHandle'));
		}
		//查看用户是否设置router
		var rt = events.get('router') || router;
		//地图对象
		events.set('map', map);
		//默认路线
		events.set('router', rt);
		//起点
		events.set('origin', new AMap.LngLat(rt[0].x, rt[0].y));
		//终点
		events.set('destination', new AMap.LngLat(rt[rt.length - 1].x, rt[rt.length - 1].y));
		//途经点
		events.set('wayPoints', []);
		//采集数据
		events.set('disTime', []);
		//所有点集合
		events.set('allPoints', []);
		//汽车点
		events.set('carMarker', null);
		//实时车的位置
		events.set('realCarIndex', 0);
		//仪表盘车速
		events.set('dashSpeed', 0);
		//计时器
		events.set('realSpeedHandle', null);
		events.set('carWatchHandle', null);
		//热门推荐
		events.set('hots', []);
	});
	

	//获取途经点
	events.on('getWayPoints', function() {
		var router = events.get('router');
		var wayPoints = {
			points: [],
			contents: []
		};
		for (var i in router) {
			if (i > 0 && i < router.length - 1) {
				wayPoints.points.push(new AMap.LngLat(router[i].x, router[i].y));
				wayPoints.contents.push(router[i].content);
			}
		}
		rt.set('router', events.get('router'));
		rt.trigger('show');
		events.set('wayPoints', wayPoints);
	});

	//绘制线路
	events.on('drawRouter', function() {
		var wayPoints = events.get('wayPoints');
		var router = events.get('router');
		var map = events.get('map');
		//绘制途径点marker
		for (var i in wayPoints.points) {
			var content = '<div index=' + i + ' style="background-color:#00C248;color:#fff;width:40px;height:20px';
			content += ';text-align:center;line-height:20px;">' + wayPoints.contents[i] + '</div>';
			var marker = new AMap.Marker({
				map: map,
				position: wayPoints.points[i],
				content: content
			});
		}

		//绘制各段路程
		AMap.service(['AMap.Driving'], function() {
			for (var k = 0; k < router.length - 1; k++) {
				var sp = new AMap.LngLat(router[k].x, router[k].y);
				var ep = new AMap.LngLat(router[k + 1].x, router[k + 1].y);
				driving(sp, ep);
			}
		});
		
		//拿到地点数据
		AMap.service(['AMap.PlaceSearch'], function(){
			var search = new AMap.PlaceSearch({
				type: '餐饮服务|购物服务|生活服务|住宿服务|风景名胜|餐饮|酒店',
				extensions: 'base'
			});
			var router = events.get('router');
			router.forEach(function(data){
				var center = new AMap.LngLat(data.x, data.y);
				search.searchNearBy('酒店|景点', center, 50000, function(status, result){
					if(result.info === 'OK'){
						var hots = events.get('hots');
						var pois = result.poiList.pois;
						var len = pois.length > 5 ? 5: pois.length;
						for(var n = 0; n < len; n++){
							hots.push(pois[n]);
						}
						events.set('hots', hots);
					}else{
						console.log('服务出错');
					}
				});
			});
		});
	});

	//绘制起点和终点
	events.on('drawOriginDestination', function() {
		var map = events.get('map');
		var origin = events.get('origin');
		var destination = events.get('destination');

		var aIcon = new AMap.Icon({
			image: "http://cache.amap.com/lbs/static/jsdemo002.png",
			size: new AMap.Size(44, 44),
			imageOffset: new AMap.Pixel(-334, -180)
		});
		var bIcon = new AMap.Icon({
			image: "http://cache.amap.com/lbs/static/jsdemo002.png",
			size: new AMap.Size(44, 44),
			imageOffset: new AMap.Pixel(-334, -134)
		});

		new AMap.Marker({
			map: map,
			position: origin,
			icon: aIcon
		});
		new AMap.Marker({
			map: map,
			position: destination,
			icon: bIcon
		});
	});


	//汽车运动
	events.on('carRun', function() {
		var map = events.get('map');
		var origin = events.get('origin');
		var destination = events.get('destination');
		var wayPoints = events.get('wayPoints');

		var Car = new AMap.Icon({
			image: "img/car.png",
			size: new AMap.Size(100, 100)
		});
		var carMarker = new AMap.Marker({
			map: map,
			position: origin,
			icon: Car,
			autoRotation: true,
			offset: new AMap.Pixel(-26, -10),
			zIndex: 10000,
		});

		events.set('carMarker', carMarker);

		AMap.service(['AMap.Driving'], function() {
			var driving = new AMap.Driving({
				extensions: 'base',
				policy: AMap.DrivingPolicy.REAL_TRAFFIC
			});
			driving.search(origin, destination, {
				waypoints: wayPoints.points
			}, function(status, result) {
				if (status === 'complete' && result.info === 'OK') {
					//绘制驾车路线
					var paths = [];
					if (result.routes.length) {
						var route = result.routes[0];
						var steps = route.steps;
						for (var i = 0; i < steps.length; i++) {
							var path = steps[i].path;
							for (var j in path) {
								paths.push(path[j]);
							}
						}
					}

					carMarker.moveAlong(paths, 50 * 1000);
					events.trigger('carWatch');
				}
			});
		});
	});


	//汽车追踪
	events.on('carWatch', function() {
		var carMarker = events.get('carMarker');
		var router = events.get('router');
		$('#router_circle_0').css('background-color', '#ccc');
		$('#router_circle_1').css('background-color', 'red');
		$('#router_circle_1').addClass('firebug_flash');
		var carWatchHandle = setInterval(function() {
			if (!carMarker) {
				return;
			}
			var carPos = carMarker.getPosition();
			//为了更好的演示
			var _x = parseFloat(carPos.lat) - 0.005;
			var justifyCenter = new AMap.LngLat(carPos.lng, _x);
			var pan = new AMap.LngLat(carPos.lng, parseFloat(carPos.lat));
			map.setZoomAndCenter(12, justifyCenter);

			//设置路线的颜色
			for (var i in router) {
				if (i < (router.length) && i > 0 && Math.abs(carPos.lng - router[i].x) < 0.05 && Math.abs(carPos.lat - router[i].y) < 0.05) {
					var index = parseInt(i - 1);
					events.set('realCarIndex', index);
					events.set('realIndex', i);
					$('#router_circle_' + (parseInt(i) + 1)).css('background-color', 'red');
					$('#router_circle_' + (parseInt(i) + 1)).addClass('firebug_flash');
					$('#router_circle_' + i).css('background-color', '#ccc');
					$('#router_circle_' + i).removeClass('firebug_flash');					
				}
			}
			
			if (Math.abs(carPos.lng - router[router.length - 1].x) < 0.01 && Math.abs(carPos.lat - router[router.length - 1].y) < 0.01) {
				clearInterval(carWatchHandle);
			}

		}, 500);
		events.set('carWatchHandle', carWatchHandle);
	});
	
	events.on('getWeather', function(){
		var router = events.get('router');
		AMap.service(['AMap.Weather'], function(){
	    		var we = new AMap.Weather();
	    		we.getLive(router[router.length - 1].content, function(err, status){
	    			if(status.weather.indexOf('雨') > -1){
	    				$('#weather_png').attr('src', 'img/rain.png');
	    			}
	    			if(status.weather.indexOf('晴') > -1){
	    				$('#weather_png').attr('src', 'img/sun.png');
	    			}
	    			if(status.weather.indexOf('云') > -1){
	    				$('#weather_png').attr('src', 'img/cloud.png');
	    			}
	    			$('#weather_du').text(status.temperature + '°');
	    			$('#weather_feng').text(status.windDirection + '风');
	    		});
	    });
	});

	//计算时速
	events.on('calcuSpeed', function() {
		var realCarIndex = events.get('realCarIndex');
		var realSpeedHandle = setInterval(function() {
			var disTime = events.get('disTime');
			var carMarker = events.get('carMarker');
			realCarIndex = events.get('realCarIndex');
			if (disTime[realCarIndex]) {
				var speed = (disTime[realCarIndex].speed - Math.random() * 5).toFixed(2);
				var rmin = Math.ceil(Math.random() * 10);
				$('#speed_real').text(speed + 'km');
				$('#ar_time').text(getRandomTime(getTime(disTime.length - 1), rmin));
				$('#total_time').text(getHour(disTime.length - 1));
				$('#total_dis').text(getAllDistance() + 'km');
				
				events.set('dashSpeed', speed);

				if (carMarker) {
					var pos = carMarker.getPosition();
					AMap.service(['AMap.Geocoder'], function() {
						var geocoder = new AMap.Geocoder();
						geocoder.getAddress(pos, function(status, result) {
							if (status === 'error' || status === 'no_data') {
								console.log("geocoder error");
							} else {
								var address = result.regeocode.formattedAddress;
								$('#real_loc').text(address);
							}
						});
					});
				}
			}
		}, 1000);
		events.set('realSpeedHandle', realSpeedHandle);
		events.trigger('wayTui');
	});
	
	//查询路途中景点
	events.on('wayTui', function(){
		var old = null;
		var realCarIndex = null;
		setInterval(function(){
			realIndex = events.get('realIndex');
			var router = events.get('router');			
			if(realIndex !== old){
				old = realIndex;
				var n = (parseInt(old));
				console.log(realIndex);
				if(!router[n] || !router[n].x || !router[n].y){
					return;
				}
				var loc = new AMap.LngLat(router[n].x, router[n].y);
				var city = router[n].content;
				AMap.service(['AMap.PlaceSearch'], function(){
					var search = new AMap.PlaceSearch({
						type: '风景名胜',
						extensions: 'base'
					});
					search.searchNearBy('景点', loc, 50000, function(status, result){
						if(result.info === 'OK'){
							var pois = result.poiList.pois;
							if(pois.length >= 3){
								$('#alert_info_text1').text(pois[0].name);
								$('#alert_info_text2').text(pois[1].name);
								$('#alert_info_text3').text(pois[2].name);
								$('.alert_info').fadeIn();
								setTimeout(function(){
									$('.alert_info').fadeOut();
								}, 5000);
							}
							
						}else{
							console.log('服务出错');
						}
					});
				});
			}
		}, 1000);
	});

	//绘制两点间路线
	function driving(origin, destination) {
		var map = events.get('map');
		var driving = new AMap.Driving({
			extensions: 'base',
			policy: AMap.DrivingPolicy.REAL_TRAFFIC
		});
		driving.search(origin, destination, function(status, result) {
			if (status === 'complete' && result.info === 'OK') {
				//绘制驾车路线
				map.setZoom(9);
				var polyline = new AMap.Polyline({
					map: map,
					strokeColor: '#E30078',
					strokeWeight: 3
				});
				var paths = [];
				if (result.routes.length) {
					var route = result.routes[0];
					var steps = route.steps;
					var time = 0;
					var distance = 0;
					for (var i = 0; i < steps.length; i++) {
						var path = steps[i].path;
						time += steps[i].time;
						distance += steps[i].distance;
						for (var j in path) {
							paths.push(path[j]);
						}
					}
					var disTime = events.get('disTime');
					disTime.push({
						time: Math.ceil(time / 60),
						distance: (distance / 1000).toFixed(2),
						speed: ((distance / 1000) / (time / 60 / 60)).toFixed(2)
					});
					events.set('disTime', disTime);

				}
				polyline.setPath(paths);

			}
		});
	}


	function getTime(index) {
		var disTime = events.get('disTime');
		var routes = events.get('router');
		var endTime = 0;
		var startTime = parseInt(routes[0].startTime.split(':')[1]);
		for (var n = index; n >= 0; n--) {
			endTime += disTime[n].time;
		}
		endTime += startTime;
		//进行时间换算
		var min = endTime % 60; //分钟
		var hour = Math.floor(endTime / 60); //小时
		var arTime = parseInt(routes[0].startTime.split(':')[0]) + hour;
		if (arTime > 23) {
			arTime = arTime - 24; //次日
			arTime = '次日 ' + arTime;
		}
		if (min < 10) {
			min = '0' + min;
		}
		arTime += ':' + min;
		return arTime;
	}

	//获取random值时间
	function getRandomTime(time, addmin) {
		var strs = time.split(':');
		var min = parseInt(strs[1]);
		var hour = parseInt(strs[0]);

		min = min + addmin;
		if (min >= 60) {
			hour += 1;
			min = min - addmin
		}

		if (min < 10) {
			min = '0' + min.toString();
		}

		if (hour >= 24) {
			hour = '次日' + hour - 24;
		}
		return hour + ':' + min;
	}

	//获取路上所花时间
	function getHour(index) {
		var disTime = events.get('disTime');
		var endTime = 0;
		for (var n = index; n >= 0; n--) {
			endTime += disTime[n].time;
		}
		var rmin = Math.ceil(Math.random() * 10);
		var str = Math.floor(endTime / 60) + ':' + Math.ceil(endTime % 60);
		var realTime = getRandomTime(str, rmin);
		var strs = realTime.split(':');
		return strs[0] + 'h' + strs[1] + 'min';
	}

	//获取所有距离
	function getAllDistance() {
		var disTime = events.get('disTime');
		var dis = 0;
		for (var i in disTime) {
			dis += parseInt(disTime[i].distance);
		}
		return dis;
	}
	
	return events;

});