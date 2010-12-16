/************************************************************************
 * REGISTRY
 *
 * Use this to store any data for the application.  The data is held
 * in memory, but is backed by DOM storage via Jive.store().
 *
 * Example usage:
 *
 *   Jive.registry.set('user', {username:'Judd', access:'admin'});
 *   var user = Jive.registry.get('user');
 *   Jive.registry.remove('user');
 *
 ************************************************************************/

(function(){

	Jive.registry = {
		data: {},

		store: Jive.store() || {},

		// use a prefix in DOM store keys to try and avoid clobbering
		// any other data there (use a function so we can late-bind Jive.appname)
		prefix: function() {
			return Jive.appname + ':reg:';
		},

		get: function(key) {
			if(typeof this.data[key] !== 'undefined') return this.data[key];

			// look in storage
			if(typeof this.store[this.prefix() + key] !== 'undefined') {
				// DOM storage can only support scalar types, so we use JSON
				this.data[key] = JSON.parse(this.store[this.prefix() + key]);
				return this.data[key];
			}
			return null;
		},

		set: function(key, val) {
			this.data[key] = val;
			this.store[this.prefix() + key] = JSON.stringify(val);
			return val;
		},

		remove: function(key) {
			delete this.data[key];
			delete this.store[this.prefix() + key];
		}
	};

})();
