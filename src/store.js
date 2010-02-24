/************************************************************************
 * DATA STORE
 *
 * Use this like so:   Jive.store().key = val;
 * Since we return false on failure (missing HTML5 support), you should
 * test for this in init code before relying on it.
 ************************************************************************/

(function(){

	Jive.store = function() {
		// try localStorage first, fallback to globalStorage
		var s = null;
		if(typeof window.globalStorage == 'object') s = window.globalStorage[window.location.host];
		if(typeof window.localStorage == 'object') s = window.localStorage;
		if(!s) return false;
		s[Jive.appname || 'Jive'] = s[Jive.appname || 'Jive'] || {};
		return s;
	};

})();
