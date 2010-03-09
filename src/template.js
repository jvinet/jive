/**
 * TEMPLATING
 *
 * Tips:
 *
 * 1. Use semicolons after function calls in <% %> blocks.
 * 2. Do not use semicolons after function calls in <%= %> blocks.
 * 3. Do not use // style comments, use /* style.
 * 4. Avoid using single quotes when you can - they can cause errors.
 *
 */
// John Resig - http://ejohn.org/ - MIT Licensed

(function(){
	var cache = {};

	Jive.template = function(str, vars) {
		var data = jQuery.extend({}, Jive.helpers || {}, vars || {});

		var fn = cache[str] = cache[str] || new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +

			// Introduce the data as local variables using with(){}
			"with(obj){p.push('" +

			// Convert the template into pure JavaScript

			// http://www.west-wind.com/weblog/posts/509108.aspx
			str.replace(/[\r\t\n]/g, " ")
				.replace(/'(?=[^%]*%>)/g, "\t")
				.split("'").join("\\'")
				.split("\t").join("'")
				.replace(/<%=(.+?)%>/g, "',$1,'")
				.split("<%").join("');")
				.split("%>").join("p.push('") + "');}return p.join('');");

			// http://ejohn.org/blog/javascript-micro-templating/
			/*str.replace(/[\r\t\n]/g, " ")
				.split("<%").join("\t")
				.replace(/((^|%>)[^\t]*)'/g, "$1\r")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("p.push('")
				.split("\r").join("\\'") + "');}return p.join('');");*/

		return fn(data);
	};
})();
