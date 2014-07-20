
// Set up the server
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// For querying.
var rp  = require('request-promise');
var src = require('./searchdb');


// Title, catalog_number, subject key, sections.foreach(sct.meeting.foreach(mtg.meeting.instructors))
var objeq = require('objeq');



// Should block the rest until this is done. Will do later.
src.getDB().then(null, console.trace, console.log)


app.get('/', function (req, res) { res.sendfile('public/index.html'); });


var _id = 0;
io.on('connection', function (socket) {

	socket.emit('user info', {id : _id++});
	console.log('a user connected');


	socket.on('search query', function (search) {
		console.log('searching', search.query, 'in term', search.term);

		src.getDB()
		    .then(function (data) {
		    	console.log('yo');
		    	var squery = "'" + search.query + "'";

		    	var results = objeq(squery + " =~ title || " + 
		    						squery + " =~ catalog_number || " + 
		    						squery + " =~ subject_key")(data);
		    	io.emit('search results', results)
		    })
		    .catch(console.trace);

		//io.emit('chat message', msg)
	});

	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
});

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;
http.listen(port, ipaddress, function () { console.log('listening on *:3000'); });


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

