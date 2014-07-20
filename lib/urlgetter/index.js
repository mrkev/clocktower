'use strict';

module.exports = (function () {
	var rp  = require('request-promise');
	var Ugh = require('ugh');
	var Q 	= require('q');

	function URLGetter (urlarr, chain) {
		var self 	 	 = this;
			self.total 	 = urlarr.length;
			self.prog    = 0;
			self.urlarr  = urlarr;
			self.results = [];
			self.chain	 = chain;

			self.getter  = new Ugh(0);

		for (var n = 0; n < urlarr.length; n++) {
			self.getter.addFunction(this.getone.bind(this), urlarr[n]);
		}
	}

	URLGetter.prototype.get = function(delay) {
		var self = this;

		self.getter.delay = delay;

		self.chain.push(
			function (data) {
				
				self.results.push(data);
		
				self.prog += 1;
				self.promise.notify(self.prog / self.total);
		
				if (self.prog === self.total) self.promise.resolve(self.results);
			}
		);


		this.promise = Q.defer();

		this.getter.start();
		return this.promise.promise;
	};

	URLGetter.prototype.getone = function(url) {
		var self = this;

	 	var req = rp(url);

	 	for (var n = 0; n < self.chain.length; n++) {
	 		req = req.then(self.chain[n]);
	 	}
	};

	return URLGetter;
})();