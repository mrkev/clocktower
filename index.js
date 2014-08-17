'use strict';
/* global require, console, process */

var Server 		= require('./Server');
var CourseSrc 	= require('./CourseSrc');
var Clockwork	= require('./Clockwork');

var config = require('./config.js');
						  
var srver = new Server();  
var cdbll = new CourseSrc(require('./searchdb'));
var clock = new Clockwork(srver);

// run this madness.
// 

console.log('What time is it?');

cdbll

	// Make sure the database is ready.
	.loadup()

	// Setup the app
	.then(function () {
		return clock.init(cdbll);
	})

	// Start the server.
	.then(function () {
		return srver.listen(config.server_ip, 
							config.server_port);
	})

	// Trace any errors
	.catch(console.trace)


	// Partay
	.then(function () {
		console.log('Adventure time.');
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

