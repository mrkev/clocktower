'use strict';

/*global $*/

/**
 * Term class. Instance is a single term. Section information is saved. Course
 * information is not.
 * @return {[type]} [description]
 */
var Term = (function () {
	
	function Term (sm) {
		var self = this;

		// Model.

		/**
		 * Array of section objects. The entire objects are kept.
		 * @type {Array<Object>}
		 */
		this._sections = sm ? sm.term : [];



		// Dynamic Properties.

		Object.defineProperty(this, 'sections', {
			get : function () { return self._sections; }
		});

		Object.defineProperty(this, 'course_ids', {
			get : function () { return self.getCourseIDs(); }
		});
	}

						/// /// Courses /// ///

	/**
	 * Adds course object to this term. Saves the sections only.
	 * @param {Object} course Course object to save.
	 */
	Term.prototype.addCourse = function(course) {
		var self = this;

		course.sections.forEach(function (sct) {
			console.log('inserting section section');
			self._sections.push(sct);
		});
	};

	/**
	 * Removes course from the term, by removing all sections asociated with
	 * its id.
	 * @param  {Object | String} course Course object or course id of course to 
	 *                   				remove
	 */
	Term.prototype.removeCourse = function(course) {
		var cid = (typeof course === 'object') ? course.course_id : course; 

		for (var i = this._sections.length - 1; i >= 0; i--) {
			if (this._sections[i].course_id === cid) {
			    this._sections.splice(i, 1);
			}
		}
	};

	Term.prototype.updateCourse = function(cobj) {
		
		course.sections.forEach(function (sct) {
			
		});
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


						/// /// Persistence /// /// 
	
	/**
	 * Returns all data necessary to rebuild term. Term can be rebuilt by 
	 * calling new Term(x) where x is the return value of this function.
	 * @return {Object} Term save object.
	 */
	Term.prototype.save = function() {
		return { term : this._sections };
	};




	//////////////////////////// For internal use //////////////////////////////

	/**
	 * Adds section if not already present. Returns true if section was added,
	 * else false. Should only be used internally. Only courses should be added,
	 * so all sections are added.
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

	return Term;

})();

console.log('Term', Term);