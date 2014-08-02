'use strict';
/* global module, require */
var Promise  = require('es6-promise').Promise;

/**
 * Utility class for the code needed to set up and then run a 
 * socket.io + express server. No special functionality here, just the code
 * that would be written for any project.
 */
module.exports = (function () {

	// Set up the server
	function Server () {
		this.express = require('express');
		this.app = this.express();
		this.http = require('http').Server(this.app);
		this.io = require('socket.io')(this.http);
	}

	Server.prototype.listen = function(ip, port) {
		var self = this;

		return new Promise(function (resolve, reject) {
			self.http.listen(port, ip, function (err) {
				if (err) reject(err);

			 	resolve(self.http);
			});
		});
	};

	return Server;
})();
