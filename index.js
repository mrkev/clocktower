'use strict';
/* global require, console, process */



var Server 		= require('./Server');
var CourseSrc 	= require('./CourseSrc');
var Clockwork	= require('./Clockwork');
						  
var srver = new Server();  
var cdbll = new CourseSrc(require('./searchdb'));
var clock = new Clockwork(srver);

// run this madness.
// 

cdbll

	// Make sure the database is ready.
	.loadup()

	// Setup the app
	.then(function () {
		return clock.init(cdbll);
	})

	// Start the server.
	.then(function () {
		return srver.listen(process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1', 
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

