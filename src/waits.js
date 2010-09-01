/************************************************************************
 * WAITS
 * Dependency queueing mechanism.  Basically, any "process" can wait
 * for another process to complete before executing.  Processes that
 * know they are dependencies of other processes can issue a "wait" to
 * the global wait hash.  The depending process schedules a callback
 * to be fired once the wait has been removed.
 *
 * A process can also delay execution until all wait keys are gone.
 *
 * NOTE: Waits are no longer included in a default Jive build. They've
 *       been deprecated in favour of Events (simpler, more versatile).
 ************************************************************************/

(function(){

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

})();
