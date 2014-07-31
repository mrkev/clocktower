'use strict';
var Promise  = require('es6-promise').Promise;

// For searching
var objeq = require('objeq');
// Title, catalog_number, subject key, sections.foreach(sct.meeting.foreach(mtg.meeting.instructors))


/*
 * Could implement search on client?? hmmm.
 * https://docs.angularjs.org/api/ng/filter/filter
 */

var Server = (function () {



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


var CourseSrc = (function () {
	function LolCatz (db) {
		this.src = db;
	}

	LolCatz.prototype.loadup = function() {
		var self = this;

		return new Promise(function (resolve, reject) {
			
			self.src.getDB()

				.then(function () { resolve(self); }, 

					reject, console.log);

		});
		
	};

	LolCatz.prototype.search = function(query) {

		return this.src.getDB().then(function (data) {
			var squery = '\'' + query + '\'';

			var results = objeq(squery + ' =~ title || ' + 
								squery + ' =~ catalog_number || ' + 
								squery + ' =~ subject_key')(data);

			return results;
		});
	};

	LolCatz.prototype.getCourses = function(cids) {
		return new Promise(function (resolve, reject) {

			var results = new Array(cids.length)
			cids.forEach(function (cid, i) {
				var squery = '\'' + cid + '\'';

				// TODO: For the sake of simplicity, we will use the first
				// course we get. cids should be unique at some point in the
				// future though, classes with the same cid should be merged.
				results[i] = objeq(squery + ' == course_id')(data)[0]; 
			});

			resolve(results);
		});
	};

	return LolCatz;

})();

var Clockwork = (function () {
	
	/**
	 * Constructs the clockwork backend.
	 * @param {Server} server A server with io and an express app
	 */
	function TwoThirty (server) {
		this.server = server;
		this.server.app.use(server.express.static(__dirname + '/public'));
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


			var auser = io.of('/user-auth');
			auser.on('connection', function(socket){
			  console.log('someone connected'):
			});
			auser.emit('hi', 'everyone!');
		});

	};

	return TwoThirty;

})();



// run this madness.
						  
var srver = new Server();  
var cdbll = new CourseSrc(require('./searchdb'));
var clock = new Clockwork(srver);


cdbll

	// Make sure teh database is ready.
	.loadup()

	// Setup the app
	.then(function () {
		return clock.init(cdbll);
	})

	// Start the server.
	.then(function () {
		return srver.listen(process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1', 
					 process.env.OPENSHIFT_NODEJS_PORT || 3000);
	})

	// Trace any errors
	.catch(console.trace)


	// Partay
	.then(function () {
		console.log('Partay lalasdkfjla running dawg yo whatsup homie looool');
	});





// +      o     +              o   
//     +             o     +       +
// o          +
//     o  +           +        +
// +        o     o       +        o
// -_-_-_-_-_-_-_,------,      o 
// _-_-_-_-_-_-_-|   /\_/\  
// -_-_-_-_-_-_-~|__( ^ .^)  +     +  
// _-_-_-_-_-_-_-""  ""      
// +      o         o   +       o
//     +         +
// o        o         o      o     +
//     o           +
// +      +     o        o      +    







// // Create a data Array to be queried later
// var data = [
//   { name: 'Barbara', age: 25, gender: 'female' },
//   { name: 'Ronald', age: 62, gender: 'male' },
//   { name: 'Robert', age: 54, gender: 'male' },
//   { name: 'Jessica', age: 48, gender: 'female' }
// ];
// 
// // This will compile an objeq query that filters only those
// // Objects having a name property starting with 'Ro' and then
// // returns a string that combines name and age properties
// var query = objeq("'^Ro' =~ name");
// 
// // This performs the query against the 'data' Array and
// // returns the result in 'res'
// var res = query(data);
// 
// // --> res now contains:
// //  [ 'Ronald is 62 years old',
// //    'Robert is 54 years old' ]
// 
// console.log(res);
// 

