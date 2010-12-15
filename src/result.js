/************************************************************************
 * CONTROLLER RESULT
 *
 * An object containing all data that will be sent to the template, as
 * well as various methods to render the templates themselves.
 *
 * NB: Don't use // style comments in templates, as some JS code may
 *     get folded into a single line.  Use /* style instead.
 ************************************************************************/

(function(){

	Jive_Result = function() {};

	/**
	 * Render some content into a DOM element.
	 *
	 * @param string Content, probably HTML
	 * @param mixed Either a jQuery object holding the DOM element to use,
	 *              or a callback function to call with the content to
	 *              render
	 * @param string mode jQuery function to use to add the content to the
	 *                    element.  eg, append, prepend, replaceWith, etc.
	 *                    Default is replace, which calls html().
	 */
	Jive_Result.prototype.render = function(content, el, mode) {
		var el = el || $('body');
		if(el instanceof jQuery) {
			var mode = mode || 'replace';
			mode = mode == 'replace' ? 'html' : mode;
			el[mode].call(el, content);
		} else if(typeof el == 'function') {
			el.call(this, content);
		}
		// templates may schedule code to run after the template has been
		// fully-rendered, so notify them that the template's ready
		Jive.trigger('templateReady');
		//Jive.ready('template');
	};

	/**
	 * Render a template located at a remote URL
	 *
	 * @param string URL
	 * @param mixed Either a jQuery object holding the DOM element to use,
	 *              or a callback function to call with the content to
	 *              render
	 * @param string mode jQuery function to use to add the content to the
	 *                    element.  eg, append, prepend, replaceWith, etc.
	 *                    Default is replace, which calls html().
	 * @param function cb Callback after content is rendered.
	 */
	Jive_Result.prototype.renderURL = function(url, el, mode, cb) {
		//Jive.wait('template');
		this.parseURL(url, function(str){
			this.render(str, el, mode);
			if(cb) cb.call(this);
		});
	};

	/**
	 * Render a template from the URL provided.
	 *
	 * @param string URL
	 * @param function Callback
	 */
	var queue = {};  // queue of callbacks waiting on each URL
	var cache = {};  // cache of unparsed templates

	Jive_Result.prototype.parseURL = function(url, cb) {
		if(cache[url]) {
			return cb.call(this, Jive.template(cache[url], this));
		}

		// create a clone of the object, as this result object will probably
		// change if it's being used for multiple renders within one action
		var a = [cb, $.extend(true, {}, this)];
		if(queue[url]) {
			queue[url].push(a);
		} else {
			queue[url] = [a];
			jQuery.get(url, function(str){
				cache[url] = str;
				jQuery.each(queue[url], function(){
					this[0].call(this[1], Jive.template(str, this[1]));
				});
				delete queue[url];
			}, 'text');
		}
	};

	/**
	 * Render a template string into a DOM element.
	 *
	 * @param string Template text
	 * @param mixed Either a jQuery object holding the DOM element to use,
	 *              or a callback function to call with the content to
	 *              render
	 * @param string mode jQuery function to use to add the content to the
	 *                    element.  eg, append, prepend, replaceWith, etc.
	 *                    Default is replace, which calls html().
	 */
	Jive_Result.prototype.renderText = function(str, el, mode) {
		//Jive.wait('template');
		this.render(this.parseText(str), el, mode);
	};

	/**
	 * Render a template from the string provided.
	 *
	 * @param string Template text
	 */
	Jive_Result.prototype.parseText = function(str) {
		return Jive.template(str, this);
	};

	/**
	 * Render a template from a DOM element into a DOM element.
	 *
	 * @param string DOM element ID
	 * @param string DOM element to populate with rendered template.  If not
	 *               specified, the body element will be used.
	 * @param string mode jQuery function to use to add the content to the
	 *                    element.  eg, append, prepend, replaceWith, etc.
	 *                    Default is replace, which calls html().
	 */
	Jive_Result.prototype.renderElement = function(id, $el, mode) {
		this.renderText($('#'+id).html(), $el || $('body'), mode || 'replace');
	};

})();
