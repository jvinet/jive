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

	Jive.version = '0.4';
	Jive.ctrl = {};           // a map of all active controller objects

	Jive.DEBUG = false;
	Jive.debug = function(s) {
		if(typeof console == 'object' && Jive.DEBUG) console.log(s);
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
			// TODO: I think this will obviate the need for the eval()
			//var cn = controller + "Controller";
			//var c  = cn.call(this);
			eval("var c = new "+controller+"Controller();");
			Jive.ctrl[controller] = c;
		}

		// the context object holds the controller/action requested,
		// not necessarily the controller/action that's actually executed
		Jive.ctx = {controller: controller, action: action};

		//Jive.waitAll(function(){
			// fallback to the "index" action
			if(typeof c[action] != 'function') action = 'index';
			if(typeof c[action] != 'function') {
				// this is our "404"
				Jive.debug("[exec] 404! c="+controller+" a="+action);
				return;
			}
			Jive.debug("[exec] c="+controller+" a="+action);
			c[action].call(c, req, res, $trig);
		//});
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
		if(!qs) {
			// no url passed; use the anchor portion of location.href if it's there
			var loc = window.location.href;
			// always add history breadcrumb if we're dispatching off of location.href
			hist = true;
			qs = loc.indexOf('#') > -1 ? loc.substring(loc.indexOf('#') + 1) : '';
		}
		// trim off everything up to the '#' if it exists (TODO: necessary?)
		qs = qs.indexOf('#') > -1 ? qs.substring(qs.indexOf('#')+1) : qs;
		// if the first character is a '@' then we should add a history breadcrumb
		if(qs.charAt(0) == '@') {
			hist = true;
			qs = qs.substring(1);
		}

		// trim off the history identifier if it's present
		var m = /^[0-9]+\|/.exec(qs);
		if(m) qs = qs.substring(m[0].length);

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
			Jive.debug("[run] adding history breadcrumb");
			Jive.history.add(controller, action, req, href);
		}
		Jive.exec(controller, action, req, $trigger);
		Jive.runHooks(controller, action, Jive.hooks.after);
		// if this is a history-tracked state change, then we return false to
		// override the default action, which may try to change the href itself;
		// we also don't change the href if the trigger simply used href="#"
		return hist || href == '#' ? false : true;
	};


	/************************************************************************
	 * OVERRIDE DEFAULT LINK/FORM BEHAVIOR
	 *   We operate on the "run" attribute (not W3C-compliant) which is
	 *   our internal action designator.
	 ************************************************************************/
	jQuery(function(){
		var $ = jQuery;
		var run = function(){ $(this).blur(); return Jive.run($(this).attr('run'), {}, $(this)) };
		$('a[run]').live('click', function(){ return run.call(this) });
		// for some reason, live() doesn't work on this selector but livequery() does...
		$('input:not(:checked)[run][type=radio]').livequery('click', run);
		$('input[run][type=checkbox]').live('click', run);
		$('button[run]').live('click', run);
		$('input[run][type=button]').live('click', run);
		$('input[run][type=submit]').live('click', run);
		$('form[run]').live('submit', function(){
			// convert form data into an object
			var data = {};
			var fd = $(this).serializeArray();
			for(var i = 0; i < fd.length; i++) data[fd[i].name] = fd[i].value;
			Jive.run($(this).attr('run'), data, $(this));
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
				this.content = req.content;
			}
			res.renderText(this.content);
		}
	};

})();
