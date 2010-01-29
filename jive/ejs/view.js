/************************************************************************
 * TAG HELPERS
 ************************************************************************/
EjsView.prototype.tag = Jive.UI.tag;

EjsView.prototype.ready = function(cb) {
	Jive.waitFor('template', cb);
}
