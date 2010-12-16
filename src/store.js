/************************************************************************
 * DATA STORE
 *
 * Use this like so:   Jive.store().key = val;
 * Since we return false on failure (missing HTML5 support), you should
 * test for this in init code before relying on it.
 ************************************************************************/

(function(){

	Jive.store = function() {
		if(typeof window.localStorage != 'object') return false;
		var s = window.localStorage;
		s[Jive.appname] = s[Jive.appname] || {};
		return s;
	};

})();
