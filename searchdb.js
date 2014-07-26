'use strict';
var rp  	= require('request-promise');
var Getter  = require('./lib/urlgetter');
var _		= require('underscore');
var Q 		= require('q');
var ES6P 	= require('es6-promise').Promise;
var hash	= require('object-hash');
/**
 * Whomping Willow v0.0.0
 *
 * Cuz it's glue code. And glue is sticky, like the Whomping Williow.
 * git+https://github.com/mrkev/node-progress.git ?? 
 */
module.exports = (function () {

	/**
	 * Gets list of subjects. Scheldules a request to get the data from each
	 * one. 
	 * @param {String} home    [the JSON url where the links will be found]
	 */
	function Williow (home) {
		this.db = null;
		this.home = home;		
	}

	var extract = function (subj) { return subj.courses; };
	
	Williow.prototype.cache = function(data) {
		this.db = data;
		return this.db;
	};

	var addHash = function(data) {
		var total = data.length;
		console.log('Hashing', data.length, 'objects...')
		for (var n = 0; n < data.length; n++) {
			data[n].hash = hash.MD5(data[n]);
		};
		console.log('done.');

		return data;
	};

	var addIDs = function(data) {
		var total = data.length;
		console.log('ID-ing', data.length, 'objects...')
		for (var n = 0; n < data.length; n++) {

			var cid = data[n].subject_key + data[n].catalog_number; //+ '-' + data[n].sections[0].associated_class;

			// Add id's for courses
			if (data[n].sections.length > 1) console.log(data[n].subject_key, data[n].catalog_number, data[n].sections)
			data[n].course_id = cid;
			// and for sections
			
			data[n].sections.forEach(function (sct) {
				sct.course_id = cid;
			});
		};

		console.log('done.');
		return data;
	};


	Williow.prototype.clearCache = function() {
		this.db = null;
	};

	Williow.prototype.query = function() {
		var self = this;
		return rp(this.home).then(JSON.parse).then(function (data) {
	
				var urls = [];
				data.subjects.forEach(function (subj) {
					urls.push('http://api-mrkev.rhcloud.com/redapi/roster?' + subj.key);
				});
	
				var getter = new Getter(urls, [JSON.parse, extract]);
				return getter.get(800)
							 .then(_.flatten)
							 .then(addHash)
							 .then(addIDs)
							 .then(self.cache.bind(self));
	
			});
	};

	// d = require('./searchdb').getDB().then(function (data) { console.log(data.length); }, console.trace, console.log)

	Williow.prototype.getDB = function() {
		if (this.db === null) return this.query();
		return ES6P.resolve(this.db);
	};

	return new Williow('http://api-mrkev.rhcloud.com/redapi/roster');
})();

// module.exports.getDB().then(console.log, console.error, console.log)