/************************************************************************
 * HOOKS
 ************************************************************************/

(function(){

	Jive.hooks = {before:[], after:[]};
	Jive.hookBefore = function(filter, cb, permanent, context) {
		Jive.hooks.before.push({filter:filter, cb:cb, permanent:permanent || true, context:context || false});
	};
	Jive.hookAfter = function(filter, cb, permanent, context) {
		Jive.hooks.after.push({filter:filter, cb:cb, permanent:permanent || true, context:context || false});
	};
	Jive.runHooks = function(controller, action, hooks) {
		for(var i = 0; i < hooks.length; i++) {
			var tuple = controller+'/'+action;
			// accept a regex or a string
			// NB: typeof isn't very reliable for regexps
			//   FF:     typeof /regex/ == 'object'
			//   Safari: typeof /regex/ == 'function'
			if( (typeof hooks[i].filter == 'string' && hooks[i].filter == tuple)
				|| (typeof hooks[i].filter == 'object' && hooks[i].filter.test(tuple)) ) {
				// callbacks can return false to halt execution of further hooks or actions
				var res = hooks[i].cb.call(hooks[i].context || window, controller, action);
				if(!hooks[i].permanent) delete hooks[i];
				if(!res) return false;
			}
		}
		return true;
	};

})();
