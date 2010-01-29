/**
 * Jive: A JavaScript client-side MVC Framework.
 *
 * This is in a very-alpha stage and is riddled with bugs.  It is also
 * falsely-advertised, as there is no M in this MVC.  Eventually, it will
 * have a very thin M layer that basically talks to APIs to push/pull
 * data.
 *
 * @version 0.3
 * @author Judd Vinet <jvinet@zeroflux.org>
 * @copyright 2009 Judd Vinet <jvinet@zeroflux.org>
 */

/**
 * NOTES/IDEAS:
 *
 * Concurrency: http://beatniksoftware.com/erjs/  (JavaScript 1.7+)
 */

Jive = {};          // the Jive singleton, do not instantiate

Jive.appname = 'Jive';     // SETME: name of your application
Jive.webroot = '';         // SETME: top-level directory of your application
Jive.controller = '';      // SETME: default/current controller to use if none specified

Jive.version = '0.3';
Jive.ctrl = {};           // a map of all active controller objects

Jive.DEBUG = false;
Jive.debug = function(s) {
	if(typeof console == 'object' && Jive.DEBUG) console.log(s);
};

/************************************************************************
 * WAITS
 * Dependency queueing mechanism.  Basically, any "process" can wait
 * for another process to complete before executing.  Processes that
 * know they are dependencies of other processes can issue a "wait" to
 * the global wait hash.  The depending process schedules a callback
 * to be fired once the wait has been removed.
 *
 * A process can also delay execution until all wait keys are gone.
 ************************************************************************/
Jive.waits = {};

/**
 * Add a wait.
 */
Jive.wait = function(key) {
	Jive.waits[key] = true;
};
/**
 * Remove a wait (ie, "I'm done, go ahead")
 */
Jive.ready = function(key) {
	delete Jive.waits[key];
};
/**
 * Delay execution until a specific wait is ready.
 */
Jive.waitFor = function(key, fn) {
	if(!Jive.waits[key]) return fn.call();
	var t = setInterval(function(){
		if(Jive.waits[key]) return;
		clearInterval(t);
		fn.call();
	}, 100);
};
/**
 * Delay execution until all waits are ready.
 */
Jive.waitAll = function(fn) {
	len = 0; for(var x in Jive.waits) len++;
	if(!len) return fn.call();
	var t = setInterval(function(){
		for(var x in Jive.waits) return;
		clearInterval(t);
		fn.call();
	}, 100);
};

/************************************************************************
 * HOOKS
 ************************************************************************/
Jive.hooks = {before:[], after:[]};
Jive.hookBefore = function(filter, cb, permanent, thisvar) {
	Jive.hooks.before.push({filter:filter, cb:cb, permanent:permanent || true, thisvar:thisvar || false});
};
Jive.hookAfter = function(filter, cb, permanent, thisvar) {
	Jive.hooks.after.push({filter:filter, cb:cb, permanent:permanent || true, thisvar:thisvar || false});
};
Jive.runHooks = function(controller, action, hooks) {
	for(var i in hooks) {
		var tuple = controller+'/'+action;
		// accept a regex or a string
		// NB: typeof isn't very reliable for regexps
		//   FF:     typeof /regex/ == 'object'
		//   Safari: typeof /regex/ == 'function'
		if((typeof hooks[i].filter == 'string' && hooks[i].filter == tuple) || hooks[i].filter.test(tuple)) {
			// callbacks can return false to halt execution of further hooks or actions
			var res = hooks[i].cb.call(hooks[i].thisvar || window, controller, action);
			if(!hooks[i].permanent) delete hooks[i];
			if(!res) return false;
		}
	}
	return true;
};

/************************************************************************
 * DATA STORE
 *
 * Use this like so:   Jive.store().key = val;
 * Since we return false on failure (missing HTML5 support), you should
 * test for this in init code before relying on it.
 ************************************************************************/
Jive.store = function() {
	// try localStorage first, fallback to globalStorage
	var s = null;
	if(typeof window.globalStorage == 'object') s = window.globalStorage[window.location.host];
	if(typeof window.localStorage == 'object') s = window.localStorage;
	if(!s) return false;
	s[Jive.appname || 'Jive'] = s[Jive.appname || 'Jive'] || {};
	return s;
};

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
Jive.history = {
	// Array of {controller, action, request_object}
	history: [],

	// current index into history buffer
	current: -1,

	lasthref: window.location.href,

	// internal flag, used to tell the watch() method to ignore the next
	// location.href change, since we're setting it ourselves
	ignore: false,

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

	add: function(c, a, req, href) {
		Jive.history.ignore = true;
		Jive.history.history[++Jive.history.current] = {controller:c, action:a, req:req};
		Jive.debug("[history] New history index: "+Jive.history.current);
		Jive.history.setloc(href);
	},

	setloc: function(href) {
		var href   = href || window.location.href;
		var base   = href.indexOf('#') > -1 ? href.substring(0, href.indexOf('#')) : href;
		var anchor = href.indexOf('#') > -1 ? href.substring(href.indexOf('#')+1) : '';
		// trim out the current history marker, if it exists
		anchor = anchor.replace(/^[0-9]+\|/, '');
		// assemble the new href
		var newhref = base + '#' + Jive.history.current + '|' + anchor;
		Jive.debug("[history] Setting new href: "+newhref);
		window.location.href = newhref;
	},

	watch: function() {
		if(Jive.history.lasthref != window.location.href) {
			Jive.history.lasthref = window.location.href;
			if(Jive.history.ignore) {
				//Jive.debug("[history] Ignoring location change: "+window.location.href);
				Jive.history.ignore = false;
				return;
			}
			Jive.debug("[history] Location changed: "+window.location.href);
			// look for the history index in the href anchor
			var href   = window.location.href;
			var anchor = href.indexOf('#') > -1 ? href.substring(href.indexOf('#')+1) : '';
			var m = /^([0-9]+)|/.exec(anchor);
			if(m[1]) Jive.history.go(m[1]);
		}
	},
};
setInterval(Jive.history.watch, 100);

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
		return;
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
 * CONTROLLER RESULT
 *
 * An object containing all data that will be sent to the template, as
 * well as various methods to render the templates themselves.
 ************************************************************************/

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
	Jive.ready('template');
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
 */
Jive_Result.prototype.renderURL = function(url, el, mode) {
	Jive.wait('template');
	this.render(this.parseURL(url), el, mode);
};

/**
 * Render a template from the URL provided.
 *
 * @param string URL
 */
Jive_Result.prototype.parseURL = function(url) {
	var tpl = new EJS({url: url});
	return tpl.render(this);
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
	Jive.wait('template');
	this.render(this.parseText(str), el, mode);
};

/**
 * Render a template from the string provided.
 *
 * @param string Template text
 */
Jive_Result.prototype.parseText = function(str) {
	var tpl = new EJS({text: str});
	return tpl.render(this);
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

/**
 * Internal redirect to another controller/action
 *
 * @param string Controller
 * @param string Action
 * @param object Request object (key: val)
 */
Jive_Result.prototype.redirectToAction = function(controller, action, req) {
	if(!action) {
		action = controller;
		controller = Jive.controller;
	}
	Jive.exec(controller, action, req || {});
};

/**
 * External redirect to another URL
 *
 * @param string URL to redirect to.
 */
Jive_Result.prototype.redirectToURL = function(url) {
	window.location.href = url;
};

/************************************************************************
 * UTILITIES
 ************************************************************************/

Jive.load_css = function(href) {
	var f = document.createElement("link");
	f.setAttribute("rel", "stylesheet");
	f.setAttribute("type", "text/css");
	f.setAttribute("href", href);
	document.getElementsByTagName("head").item(0).appendChild(f);
}

Jive.set_cookie = function(name, value, expires) {
	var d = false;
	if(expires) {
		switch(typeof expires) {
			case 'string': d = new Date(Date.parse(expires)); break;
			case 'number': d = new Date(expires*1000); break;
			case 'object': break;
		}
	}
	var ck = name + "="  + escape(value);
	if(d) ck += ";expires=" + d.toGMTString();
	document.cookie = ck;
}


/************************************************************************
 * OVERRIDE DEFAULT LINK/FORM BEHAVIOR
 *   We operate on the "run" attribute (not W3C-compliant) which is
 *   our internal action designator.
 ************************************************************************/
$(function(){
	var run = function(){ $(this).blur(); return Jive.run($(this).attr('run'), {}, $(this)) };
	$('a[run]').livequery('click', function(){ run.call(this) });
	// for some reason, live() doesn't work on this selector but livequery() does...
	$('input:not(:checked)[run][type=radio]').livequery('click', run);
	$('input[run][type=checkbox]').livequery('click', run);
	$('button[run]').livequery('click', run);
	$('input[run][type=button]').livequery('click', run);
	$('input[run][type=submit]').livequery('click', run);
	$('form[run]').livequery('submit', function(){
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
}
