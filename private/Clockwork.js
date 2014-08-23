'use strict';
/* global require, console, __dirname, module */
var Promise  = require('es6-promise').Promise;
var jwtSecret = 'Lozidopes and capri shoes.';


/**
 * The backend. Contains all socket.io code and makes Server acutally useful lol.
 * @return {[type]} [description]
 */
module.exports = (function () {
	
	/**
	 * Constructs the clockwork backend.
	 * @param {Server} server A server with io and an express app
	 */
	function TwoThirty (server) {
		this.server = server;
		this.server.app.use(server.express.static(__dirname + './../public'));
		this.appinfo = require('./../package.json');
	}


	TwoThirty.prototype.init = function(csrc) {
		this.csrc = csrc;

		var self = this;
		var io 	 = this.server.io;

		var _id = 0;

		io.on('connection', function (socket) {

			var user = {id : _id++};
			console.log('user', user.id, 'connected');

			socket.emit('user info', user);
			socket.emit('app info', self.appinfo);

			/*
			 * Search the database
			 */
			socket.on('search query', function (search) {
				console.log('searching', search.query, 'in term', search.term);

				self.csrc.search(search.query)

				    // Return the results
				    .then(function (data) {
				    	io.emit('search results', data);
				    })

				    // Let tower know we're burning here
				    .catch(function (error) {
				    	io.emit('damnnit /:', error);
				    	console.trace(error);
				    });

			});


			/*
			 * Get course information
			 */
			socket.on('get courses', function (cids) {

				if (typeof cids === 'string') cids = [cids];
				
				self.csrc.getCourses(cids)

					.then(function (data) {

						io.emit('course info', data);
					})

					.catch(function (error) {
						io.emit('damnnit /:', error);
						console.trace(error);
					});
			});

			/*
			 * Disconnect
			 */
			socket.on('disconnect', function () { console.log('user', user, 'disconnected'); });



			var socketioJwt = require('socketio-jwt');

			var auser = io.of('/user-auth').use(function (socket, next) {
				var handshakeData = socket.request;
				console.log('HS Data', handshakeData);
				next();
			}).use(socketioJwt.authorize({
  				secret: jwtSecret,
  				handshake: true
			}));

			auser.on('connection', function(socket){
			  console.log('someone connected', socket, 'lol connection');
			});

			auser.emit('hi', 'everyone!');
		});

	};

	


	return TwoThirty;

})();