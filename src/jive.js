/**
 * Jive: A JavaScript client-side MVC Framework.
 *
 * This is in a very-alpha stage and is riddled with bugs.  It is also
 * falsely-advertised, as there is no M in this MVC.  Eventually, it will
 * have a very thin M layer that basically talks to APIs to push/pull
 * data.
 *
 * @version 0.4
 * @author Judd Vinet <jvinet@zeroflux.org>
 * @copyright 2009 Judd Vinet <jvinet@zeroflux.org>
 */

/**
 * NOTES/IDEAS:
 *
 * Concurrency: http://beatniksoftware.com/erjs/  (JavaScript 1.7+)
 */

(function(){

	Jive = {};         // the Jive singleton, do not instantiate

	Jive.appname = 'Jive';     // SETME: name of your application
	Jive.webroot = '';         // SETME: top-level directory of your application
	Jive.controller = '';      // SETME: default/current controller to use if none specified

	Jive.version = '0.4.3';
	Jive.ctrl = {};           // a map of all active controller objects

	Jive.DEBUG = false;
	Jive.debug = function(s) {
		if(typeof console != 'object' || !Jive.DEBUG) return;
		if(arguments.length > 1) {
			for(var i = 0; i < arguments.length; i++) console.log(i+': '+arguments[i]);
		} else {
			console.log(s);
		}
	};


	/************************************************************************
	 * DISPATCH
	 ************************************************************************/

	/**
	 * Execute the specified action
	 */
	Jive.exec = function(controller, action, req, $trig) {
		var req = req || {};
		var res = new Jive_Result();

		// don't let the framework's controller be default
		// TODO: this is kind of a hack, let's be honest
		if(controller != 'Jive') Jive.controller = controller;

		if(Jive.ctrl[controller]) {
			var c = Jive.ctrl[controller];
		} else {
			eval("var c = new "+controller+"Controller();");
			Jive.ctrl[controller] = c;
		}

		// the context object holds the controller/action requested,
		// not necessarily the controller/action that's actually executed
		Jive.ctx = {controller: controller, action: action};

		// fallback to the "index" action
		if(typeof c[action] != 'function') action = 'index';
		if(typeof c[action] != 'function') {
			// this is our "404"
			Jive.debug("[exec] 404! c="+controller+" a="+action);
			return false;
		}
		Jive.debug("[exec] c="+controller+" a="+action);
		return c[action].call(c, req, res, $trig);
	};

	/**
	 * Execute a local.  A "local" is a controller function that
	 * is not called directly from a web browser, but called internally
	 * by another part of the application.
	 */
	Jive.local = function(controller, action, args) {
		var args = args instanceof Array ? args : [args];
		if(Jive.ctrl[controller]) {
			var c = Jive.ctrl[controller];
		} else {
			//var c = new window[controller + "Controller"];
			eval("var c = new "+controller+"Controller();");
			Jive.ctrl[controller] = c;
		}
		if(typeof c[action] != 'function') return;

		Jive.ctx = {controller: controller, action: action};
		Jive.debug("[local] c="+controller+" a="+action);
		c[action].apply(c, args);
	};

	/**
	 * Parse request URL to find the controller/action/parameters and
	 * execute the correct action.
	 *
	 * @param string Request URL.  Either the full URL from location.href,
	 *               or just the part after the '#' symbol.
	 * @param object Request variables.
	 * @param object jQuery element that triggered this dispatch.
	 */
	Jive.run = function(url, req, $trigger) {
		var qs = url || '', req = req || {}, hist = false;
		var $trigger = $trigger || undefined;
		var href = $trigger ? $trigger.attr('href') : '';

		// If no URL was passed, use the anchor portion of location.href (if it's there)
		if(!qs) {
			var loc = window.location.href;
			// always add history breadcrumb if we're dispatching off of location.href
			hist = true;
			// leave the # symbol in the string for now
			qs = href = loc.indexOf('#') > -1 ? loc.substring(loc.indexOf('#')) : '';
		}

		// Trim off the anchor portion, and figure out what we want to be displayed
		// in the history breadcrumb.  We use the following rules:
		//   1. If no # symbol present, use the "url" passed to Jive.run()
		//   2. If the # symbol is present, but nothing following it, then use nothing
		//   3. If we have text following the # symbol, then use that
		var anchor = qs;
		if(href) {
			if(href.indexOf('#') > -1) {
				anchor = href.substring(href.indexOf('#') + 1);
			}
		}

		// trim off everything up to (and including) the '#' if it still exists
		qs = qs.indexOf('#') > -1 ? qs.substring(qs.indexOf('#')+1) : qs;
		// if the first character is a '@' then we should add a history breadcrumb
		if(qs.charAt(0) == '@') {
			hist = true;
			qs = qs.substring(1);
		}

		// trim off the history identifier if it's present
		var m = /^[0-9]+\|/.exec(qs);
		if(m) qs = qs.substring(m[0].length);

		// do the same for anchor (TODO: can these be merged?)
		anchor = anchor.charAt(0) == '@' ? anchor.substring(1) : anchor;
		var m = /^[0-9]*\|/.exec(anchor);
		if(m) anchor = anchor.substring(m[0].length);

		// everything before the '?' is the controller/action designation
		// everything after the '?' is query-string tuples
		var p = qs.split('?');
		var tuple = p[0], parms = p[1] || '';
		p = tuple.split('/');
		var controller = typeof p[1] == 'string' ? p[0] : Jive.controller;
		var action     = typeof p[1] == 'string' ? p[1] : p[0];
		p = parms.split('&');
		for(var i = 0; i < p.length; i++) {
			var qv = p[i].split('=');
			if(!qv[0].length) continue;
			// this allows query vars that have keys only, eg, /stuff?go
			req[qv[0]] = qv[1] == undefined ? true : qv[1];
		}
		if(!Jive.runHooks(controller, action, Jive.hooks.before)) {
			Jive.debug("[run] hook aborted execution (c:"+controller+" a:"+action+")");
			return false;
		}
		Jive.debug("[run] url:"+url+" qs:"+qs+" c:"+controller+" a:"+action);
		if(hist) {
			Jive.debug("[run] adding history breadcrumb: "+anchor);
			Jive.history.add(controller, action, req, anchor);
		}
		var ret = Jive.exec(controller, action, req, $trigger);
		Jive.runHooks(controller, action, Jive.hooks.after);
		// if this is a history-tracked state change, then we return false to
		// override the default action, which may try to change the href itself;
		// we also don't change the href if the trigger simply used href="#"
		return hist || href == '#' ? false : ret;
	};

	/**
	 * Convert form data into a key/value object
	 */
	Jive.form = function($form) {
		var data = {};
		var fd = $form.serializeArray();
		for(var i = 0; i < fd.length; i++) data[fd[i].name] = fd[i].value;
		return data;
	};

	/************************************************************************
	 * OVERRIDE DEFAULT LINK/FORM BEHAVIOR
	 *   We operate on the "run" attribute (not W3C-compliant) which is
	 *   our internal action designator.
	 ************************************************************************/
	jQuery(function(){
		var $ = jQuery;
		var run = function(e){
			var $e = $(this);
			$e.blur();
			$e['event'] = e;
			return Jive.run($(this).attr('run'), {}, $e);
		};
		// use a 'return' so the default event doesn't fire
		$('a[run]').livequery('click', function(e){ return run.call(this, e) });
		// for some reason, live() doesn't work on this selector but livequery() does...
		$('input:not(:checked)[run][type=radio]').livequery('click', run);
		$('input[run][type=checkbox]').live('click', run);
		$('button[run]').livequery('click', run);
		$('input[run][type=button]').live('click', run);
		$('input[run][type=submit]').live('click', run);
		// live() doesn't work on this (in IE) selector but livequery() does...
		$('form[run]').livequery('submit', function(e){
			var $e = $(this);
			$e['event'] = e;
			Jive.run($(this).attr('run'), Jive.form($e), $e);
			return false;
		});
	});


	/************************************************************************
	 * DEFAULT CONTROLLER (adds a few conveniences)
	 *
	 * TODO: Make this better.  Its name is dangerously close to Jive_Controller,
	 * and if "echo" is the only convenience, then there's probably a better
	 * place to put it.
	 ************************************************************************/
	JiveController = function(){
		this.content = false;

		/**
		 * When you have your initial content written directly in the HTML (ie,
		 * not from a template) then you may want to use Jive's history tracking.
		 * Since you're not Jive.run()ing an action right away, there's no chance
		 * to add a history token.  This function collects your initial content
		 * and routes it through a Jive action so history tracking can take effect.
		 */
		this.echo = function(req, res) {
			if(!this.content) {
				this.content = req.content ? req.content : $('body').html();
			}
			res.renderText(this.content);
		}
	};

})();
