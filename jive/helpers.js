/************************************************************************
 * TAG HELPERS
 ************************************************************************/

(function(){

	Jive.helpers = {};

	Jive.helpers.tag = Jive.UI.tag;

	Jive.helpers.ready = function(cb) {
		Jive.waitFor('template', cb);
	};

})();
