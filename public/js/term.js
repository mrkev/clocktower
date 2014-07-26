'use strict';

/*global $*/

/**
 * Term class. Instance is a single term. Section information is saved. Course
 * information is not.
 * @return {[type]} [description]
 */
var Term = (function () {
	
	function Term () {
		var self = this;
		this._sections = [];

		Object.defineProperty(this, 'sections', {
			get : function () { return self._sections; }
		});

		Object.defineProperty(this, 'course_ids', {
			get : function () { return self.getCourseIDs(); }
		});
	}

	Term.prototype.addCourse = function(course) {
		var self = this;

		course.sections.forEach(function (sct) {
			console.log('inserting section section');
			self._sections.push(sct);
		});
	};

	Term.prototype.removeCourse = function(course) {
		var cid = (typeof course === 'object') ? course.course_id : course; 

		for (var i = this._sections.length - 1; i >= 0; i--) {
			if (this._sections[i].course_id === cid) {
			    this._sections.splice(i, 1);
			}
		}
	};

	/**
	 * Adds section if not already present. Returns true if section was added,
	 * else false.
	 *
	 * Saves all the section info because it's what the user cares about. This 
	 * is enough information for pre-enroll. To update get sections, and replace
	 * with updated section with same class_number;
	 * 
	 * @param {Boolean} section Wether the section was added or not.
	 */
	Term.prototype.addSection = function(section) {
		var ids = this._sections.map(function (x) { return x.class_number; });
		
		if (ids.find(this.section.class_number) > -1) return false;

		this._sections.push(section);
		return true;
	};

	/**
	 * Returns course IDs for all sections added.
	 * @return {Array[String]} Array of all course IDs for all sections added.
	 */
	Term.prototype.getCourseIDs = function() {
		console.log('getting dem ids');
		// Remove duplicates
		return  $.unique

			// of the array of all sections' course id's
			(this._sections.map(function (x) 
				{ return x.course_id; }));
	};

	return Term;

})();

console.log('Term:', Term);