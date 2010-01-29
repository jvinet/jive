/**
 * Jive: A JavaScript client-side MVC Framework.
 *
 * @version 0.3
 * @author Judd Vinet <jvinet@zeroflux.org>
 * @copyright 2009 Judd Vinet <jvinet@zeroflux.org>
 */

Jive.UI = {};

/************************************************************************
 * FLASH (NOTIFICATION) MESSAGES
 *
 * Requires the jQuery Gritter plugin
 ************************************************************************/
Jive.UI.flash = function(message) {
	Jive.load_css('css/gritter.css');
	function a() {
		$.gritter.add({
			title: ' ',
			text: message,
			sticky: false,
			image: 'img/gritter/ico_check.png',
			time: 2000
		});
	}
	if(typeof $.gritter != 'object') {
		$.getScript('js/jquery.gritter.js', a);
	} else {
		a();
	}
}


/************************************************************************
 * FORM TAGS
 ************************************************************************/
Jive.UI.tag = {};

Jive.UI.tag.tag = function(name, htmlopts, inner_html) {
	var inner = inner_html || '';
	var opts = '';
	for(var o in htmlopts) {
		opts += ' '+o+'="'+htmlopts[o]+'"';
	}
	if(inner.length) {
		return '<'+name+opts+'>'+inner+'</'+name+'>';
	}
	return '<'+name+opts+' />';
}

Jive.UI.tag.input = function(type, name, value, htmlopts) {
	var htmlopts = htmlopts || {};
	htmlopts.type = type;
	htmlopts.name = name;
	htmlopts.value = value || '';
	return this.tag('input', htmlopts);
}

Jive.UI.tag.text = function(name, value, htmlopts) {
	return this.input('text', name, value, htmlopts);
}

Jive.UI.tag.password = function(name, value, htmlopts) {
	return this.input('password', name, value, htmlopts);
}

Jive.UI.tag.checkbox = function(name, value, htmlopts) {
	return this.input('checkbox', name, value, htmlopts);
}

Jive.UI.tag.textarea = function(name, value, htmlopts) {
	var htmlopts = htmlopts || {};
	htmlopts.name = name;
	return this.tag('textarea', htmlopts, value || '');
}

Jive.UI.tag.select = function(name, value, choices, htmlopts) {
	var htmlopts = htmlopts || {};
	var inner = '';
	var value = value || '';
	for(var k in choices) {
		var c = choices[k];
		if(typeof c == 'object') {
			var val = c.value;
			var lbl = c.label;
		} else {
			var val = c;
			var lbl = c;
		}
		inner += '<option value="'+val+'"';
		if(value == val) inner += ' selected="selected"';
		inner += '>'+lbl+'</option>';
	}
	htmlopts.name = name;
	return this.tag('select', htmlopts, inner);
}

