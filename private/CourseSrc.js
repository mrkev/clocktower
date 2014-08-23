'use strict';
/* global module, require, console */
var Promise  = require('es6-promise').Promise;
var objeq = require('objeq');
// Title, catalog_number, subject key, sections.foreach(sct.meeting.foreach(mtg.meeting.instructors))

/**
 * The course source for our application. Contains methods for finding the 
 * courses we need.
 * @return {[type]} [description]
 */
module.exports = (function () {
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
								squery + ' =~ subject_key || ' +
								squery + ' =~ course_id || ' +
								squery + ' =~ class_description')(data);

			return results;
		});
	};

	LolCatz.prototype.getCourses = function(cids) {

		return new Promise(function (resolve) {

			var results = new Array(cids.length);

			cids.forEach(function (cid, i) {
				var squery = '\'' + cid + '\'';

				// TODO: For the sake of simplicity, we will use the first
				// course we get. cids should be unique at some point in the
				// future though, classes with the same cid should be merged.
				this.src.getDB().then(function (data) {
					results[i] = objeq(squery + ' == course_id')(data)[0]; 
				});
			});

			resolve(results);
		});
	};

	return LolCatz;
})();


/*
 * Could implement search on client?? hmmm.
 * https://docs.angularjs.org/api/ng/filter/filter
 */
