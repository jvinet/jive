/************************************************************************
 * UTILITIES
 ************************************************************************/

(function(){
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

	Function.prototype.extend = function(p) {
		// handle constructor functions or objects
		if(typeof p == "object") {
			jQuery.extend(this.prototype, p);
		} else {
			jQuery.extend(this.prototype, new p);
		}
		return this;
	}
	// backwards compat
	Function.prototype.mixin = Function.prototype.extend;
})();
