'use strict';
/* global console */

var YDB = (function () {

	function YoDawgBased (sm) {
		var self = this;

		if (sm) console.log('Initing the dawg to', sm);
		/**
		 * All sections, in format:
		 *
		 * { class_number : section, ...}
		 * 
		 * @type {Object}
		 */
		self._sections = sm ? sm._sections : {};

		/**
		 * All courses, in format:
		 *
		 * { course_id : course, ...}
		 * 
		 * @type {Object}
		 */
		self._courses  = sm ? sm._courses : {};

		Object.defineProperty(this, 'sections', {
			get : function () {
				return self._sections;
			}
		});		
	}

	YoDawgBased.prototype.pushCourse = function(course) {
		var self = this;

		course.sections.forEach(function (sctn) {
			self._sections[sctn.class_number] = sctn;
		});

		self._courses[course.course_id] = course;
	};

	YoDawgBased.prototype.pushSection = function(section) {
		this._sections[section.class_number] = section;
	};

	YoDawgBased.prototype.save = function() {
		return {
			_sections : this._sections,
			_courses : this._courses
		};
	};
	
	return YoDawgBased;
})();

// console.log('YDB', YDB);