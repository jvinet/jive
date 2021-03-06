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
		// Array of {controller, action, request_object, state}
		history: [],

		// current index into history buffer
		current: -1,

		lasthref: window.location.href,

		// internal flag, used to tell the watch() method to ignore the next
		// location.href change, since we're setting it ourselves
		ignore: false,

		/**
		 * Move to another location in the history stack.
		 */
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

		/**
		 * Add a new history point to the stack.
		 */
		add: function(c, a, req, anchor) {
			Jive.history.ignore = true;
			Jive.history.history[++Jive.history.current] = {controller:c, action:a, req:req, state:{}};
			Jive.debug("[history] New history index: "+Jive.history.current+"; anchor: "+anchor);
			Jive.history.setloc(anchor);
		},

		/**
		 * Update the location.href with our special history anchor.
		 */
		setloc: function(anchor) {
			// assemble the new href
			var hash = Jive.history.current + '|' + anchor;
			Jive.debug("[history] Setting new hash: "+hash);
			window.location.hash = hash;
		},

		/**
		 * Watch location.href for changes. This function is called regularly
		 * from a timer.
		 */
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
				// look for the history index in the hash
				var m = /^([0-9]+)|/.exec(window.location.hash);
				if(m[1]) Jive.history.go(m[1]);
			}
		}
	};

	setInterval(Jive.history.watch, 100);

})();
