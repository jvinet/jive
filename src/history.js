/************************************************************************
 * HISTORY (SINGLETON)
 *
 * To mimic normal browser Forward/Back functionality, we basically just
 * cache every controller/action/request tuple and maintain a breadcrumb
 * trail.  To jump to another arbitrary breadcrumb, we call the same
 * controller/action pair with the same request object.
 *
 * The important thing to note here is the assumption we make: At any
 * point in your application's state, a breadcrumbed action should
 * _always_ perform the same operation given the same request object.
 *
 * In other words -- if your action's behavior varies based on other
 * state data not stored in the request object, then the user experience
 * will suffer.
 ************************************************************************/

(function(){
	Jive.history = {
		// Array of {controller, action, request_object}
		history: [],

		// current index into history buffer
		current: -1,

		lasthref: window.location.href,

		// internal flag, used to tell the watch() method to ignore the next
		// location.href change, since we're setting it ourselves
		ignore: false,

		go: function(idx) {
			// if negative, then the index must be relative
			var idx = idx < 0 ? Jive.history.current + idx : idx;
			var h = Jive.history.history[idx];
			if(h) {
				Jive.debug("[history] Executing history index "+idx);
				Jive.history.current = idx;
				Jive.exec(h.controller, h.action, h.req);
			}
		},

		/**
		 * Attach or retrieve state variables to/from this history point.
		 * - If an object literal is passed, it will be merged with any existing
		 *   state variables.
		 * - If no object is passed, all state variables are returned.
		 * - If we are not in a stateful history point, false is returned.
		 */
		state: function(o) {
			var o = o || {};
			return Jive.history.current >= 0
				? jQuery.extend(Jive.history.history[Jive.history.current].state, o)
				: false;
		},

		add: function(c, a, req, state) {
			Jive.history.ignore = true;
			Jive.history.history[++Jive.history.current] = {controller:c, action:a, req:req, state:{}};
			Jive.history.state(state);
			Jive.debug("[history] New history index: "+Jive.history.current);
			Jive.history.setloc();
		},

		setloc: function(href) {
			var state  = state || {};
			var href   = href || window.location.href;
			var base   = href.indexOf('#') > -1 ? href.substring(0, href.indexOf('#')) : href;
			var anchor = href.indexOf('#') > -1 ? href.substring(href.indexOf('#')+1) : '';
			// trim out the current history marker, if it exists
			anchor = anchor.replace(/^[0-9]+\|/, '');
			// assemble the new href
			var newhref = base + '#' + Jive.history.current + '|' + anchor;
			Jive.debug("[history] Setting new href: "+newhref);
			window.location.href = newhref;
		},

		watch: function() {
			if(Jive.history.lasthref != window.location.href) {
				Jive.trigger('locationChange', {href: window.location.href});
				Jive.history.lasthref = window.location.href;
				if(Jive.history.ignore) {
					//Jive.debug("[history] Ignoring location change: "+window.location.href);
					Jive.history.ignore = false;
					return;
				}
				Jive.debug("[history] Location changed: "+window.location.href);
				// look for the history index in the href anchor
				var href   = window.location.href;
				var anchor = href.indexOf('#') > -1 ? href.substring(href.indexOf('#')+1) : '';
				var m = /^([0-9]+)|/.exec(anchor);
				if(m[1]) Jive.history.go(m[1]);
			}
		}
	};

	setInterval(Jive.history.watch, 100);

})();
