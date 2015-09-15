

define('home/driving', function(){
	
	function driving(origin, destination){
		var driving = new AMap.Driving({
			extensions: 'base',
			policy: AMap.DrivingPolicy.REAL_TRAFFIC 
		});
		driving.search(origin, destination, function(status, result){
			if(status === 'complete' && result.info === 'OK'){
	        		//绘制驾车路线
	        		map.setZoom(9);
	        		var polyline = new AMap.Polyline({
	        			map: map,
	        			strokeColor: '#E30078',
	        			strokeWeight: 5
	        		});
	        		var paths = [];
	        		if(result.routes.length){
	        			var route = result.routes[0];
	        			var steps = route.steps;
	        			var time = 0;
	        			var distance = 0;
	        			for(var i = 0; i < steps.length; i++){
	        				var path = steps[i].path;
	        				time += steps[i].time;
	        				distance += steps[i].distance;
	        				for(var j in path){
	        					paths.push(path[j]);
	        				}
	        			}
	        			
	        			disTime.push({
	        				time: Math.ceil(time/60),
	        				distance: (distance/1000).toFixed(2),
	        				speed: ((distance/1000) / (time/60/60)).toFixed(2)
	        			});
	        			
	        		}
	        		polyline.setPath(paths);
	        		
	        	}
		});
	}
	return driving;
});