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

	Function.prototype.mixin = function(p) {
		jQuery.extend(this.prototype, p.prototype);
		return this;
	}
})();
