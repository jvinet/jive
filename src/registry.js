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

		get: function(key) {
			if(typeof this.data[key] !== 'undefined') return this.data[key];

			// look in storage
			if(!this.store._registry) this.store._registry = {};
			if(typeof this.store._registry[key] !== 'undefined') {
				// DOM storage can only support scalar types, so we use JSON
				this.data[key] = JSON.parse(this.store._registry[key]);
				return this.data[key];
			}
			return null;
		},

		set: function(key, val) {
			if(!this.store._registry) this.store._registry = {};
			this.data[key] = val;
			this.store._registry[key] = JSON.stringify(val);
			return val;
		},

		remove: function(key) {
			if(!this.store._registry) this.store._registry = {};
			delete this.data[key];
			delete this.store._registry[key];
		}
	};

})();
