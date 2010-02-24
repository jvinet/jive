/**
 * TEMPLATING
 */
// John Resig - http://ejohn.org/ - MIT Licensed
// Small changes from http://www.west-wind.com/weblog/posts/509108.aspx

(function(){
	var cache = {};

	Jive.template = function(str, vars) {
		var data = jQuery.extend({}, Jive.helpers || {}, vars || {});

		var fn = cache[str] = cache[str] || new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +

			// Introduce the data as local variables using with(){}
			"with(obj){p.push('" +

			// Convert the template into pure JavaScript
			str.replace(/[\r\t\n]/g, " ")
				.replace(/'(?=[^%]*%>)/g, "\t")
				.split("'").join("\\'")
				.split("\t").join("'")
				.replace(/<%=(.+?)%>/g, "',$1,'")
				.split("<%").join("');")
				.split("%>").join(";p.push('") + "');}return p.join('');");

		return fn(data);
	};
})();
