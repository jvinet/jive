/**
 * Jive: A JavaScript client-side MVC Framework.
 *
 * @version 0.3
 * @author Judd Vinet <jvinet@zeroflux.org>
 * @copyright 2009 Judd Vinet <jvinet@zeroflux.org>
 *
 * Suggested base classes for a Jive application.
 */

(function(){

	Jive_Model = function() {
		var self = this;

		var api_url = '';  // URL of backend data API

		this.state = {};   // any internal state data you may need to store
		this.data = {};    // data to be passed to backend

		/**
		 * Find all form fields in the $cnt element and validate them
		 * based on the content of the 'valid' attribute.
		 */
		this.validate = function($cnt, show_msg) {
			var errs     = false;
			var msg      = false;
			var show_msg = show_msg || false;

			$('*', $cnt).removeClass('field-error');
			$('input[type=checkbox][valid=req], input[type=radio][valid=req]', $cnt).each(function(){
				if(!$('input:checked[name='+$(this).attr('name')+']', $cnt).length) {
					$(this).addClass('field-error');
					errs = true;
				}
			});
			$('input[valid], textarea[valid], select[valid]', $cnt).each(function(){
				var val = $(this).val();
				var v = $(this).attr('valid');
				var valid = true;

				var m = /^#?fn:(.*)$/.exec(v);
				if(m) {
					// validation callbacks are stored in window.v for easy access
					if(window.v && typeof window.v[m[1]] == 'function') {
						Jive.debug("[Jive.model] Calling validation callback window.v."+m[1]+" with val: "+val);
						valid = window.v[m[1]].call(self, val);
					}
				} else {
					switch(v) {
						case '':
						case '*':     valid = true; break;
						case 'ne':
						case 'req':   valid = !!val.length; break;
						case 'int':   valid = /^[0-9]+$/.test(val); break;
						case 'float': valid = /^[0-9]*\.?[0-9]+$/.test(val); break;
						case 'email': valid = /^([a-zA-Z0-9_.\+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(val); break;
						default:
							Jive.debug("Unsupported validation type: "+v);
							return;
					}
				}
				if(!valid || typeof valid == 'string') {
					if(typeof valid == 'string') msg = valid;
					$(this).addClass('field-error');
					errs = true;
				}
			});
			if(errs && (show_msg || msg)) {
				alert(msg ? msg : "One or more fields are missing or incorrect. Please fix the highlighted fields.");
			}
			return !errs;
		}
	};

	Jive_Controller = function() {
		var self = this;

		this.state = {};   // any internal state data you may need to store

		console.log("state: "); console.log(this.state);
	};

})();
