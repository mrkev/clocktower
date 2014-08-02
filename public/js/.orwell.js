'use strict';
/* global $, console*/
var YoCal = (function () {

	function Orwell () {
		this.width = 20;
	}

	var midnightMillis = function (time) {
		return 	Date.parse('July 26th, 2014, ' + time) - 
				Date.parse('July 26th, 2014, 12:00AM');
	}

	var table = 
	{   'M'	: 0,
		'T'	: 1,
		'W'	: 2,
		'R'	: 3,
		'F'	: 4,
		'S'	: 5 
	}


	var getLeft = function (weekday) { return table[weekday] * this.width; }
	var getTop  = function (time) {
		return (midnightMillis(time) / 86400000 /* Milliseconds in a day */) * this.height >> 0;
	}

	Orwell.prototype.gatherify = function(section) {

		var results = new Array(section.meeting.meeting_pattern.length);
		
		var i = meeting.meeting_pattern.length;
		while (i--) {
		  console.log(meeting.meeting_pattern.charAt(i));
		}

	};

	return Orwell;
})();

console.log('YoCal', YoCal);


//  {
// 	    building_code: "URH",
// 	    room: "262",
// 	    start_time: "11:40AM",
// 	    end_time: "12:55PM",
// 	    start_date: "08/26/2014",
// 	    end_date: "12/05/2014",
// 	    instructors: [
// 	        "Lau,C (cyl58)"
// 	    ],
// 	    facility_description: "Uris Hall 262",
// 	    meeting_pattern: "TR"
// 	}

