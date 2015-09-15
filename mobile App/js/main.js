requirejs.config({
	baseUrl: 'js'
});


requirejs([ 
		'lib/fastclick',
		'lib/underscore',
		'home/map',
		'home/dashboard',
		'home/info',
		'home/tools',
		'home/search'
	], 
	function(fastclick) {
		var ua = window.navigator.userAgent.toLocaleLowerCase();
        var bIsIpad = ua.match(/ipad/i) == 'ipad';
        var bIsIphoneOs = ua.match(/iphone os/i) == "iphone os";
        var bIsMidp = ua.match(/midp/i) == "midp";
        var bIsUc7 = ua.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = ua.match(/ucweb/i) == "ucweb";
        var bIsAndroid = ua.match(/android/i) == "android";
        var bIsCE = ua.match(/windows ce/i) == "windows ce";
        var bIsWM = ua.match(/windows mobile/i) == "windows mobile";
        //iPad优先
        if(bIsIpad){
        		console.log('ipad');
          	fastclick(document.body);
        		return;
        }
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
          	fastclick(document.body);
        		console.log('mobile');
        } else {
           console.log('pc');
        }
		
});