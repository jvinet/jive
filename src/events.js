/************************************************************************
 * EVENTS
 ************************************************************************/

(function(){

	Jive.listeners = {};

	Jive.listen = function(evt_name, cb, permanent) {
		// listeners are permanent by default
		var p = typeof permanent == 'undefined' ? true : permanent;
		Jive.listeners[evt_name] = Jive.listeners[evt_name] || [];
		Jive.listeners[evt_name].push([cb, p]);
	};

	Jive.trigger = function(evt_name, data) {
		Jive.listeners[evt_name] = Jive.listeners[evt_name] || [];
		// permanent listeners will be kept after the loop
		var perms = [];
		for(var i = 0; i < Jive.listeners[evt_name].length; i++) {
			var v = Jive.listeners[evt_name][i];
			v[0](data);
			if(v[1] == true) perms.push(v);
		}
		Jive.listeners[evt_name] = perms;
	};

})();
