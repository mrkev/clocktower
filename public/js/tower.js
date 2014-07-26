'use strict';
/* global Term */


/**
 * Model class.
 * @return {[type]} [description]
 */

var latestTerm = 'FA14';

var TowerModel = (function () {

  var _searchResults = [];


  function Model (sm) {
    var self = this;

    var _term;


    if (sm) {
      this.user = sm.user || new User();
      this.calendar = new Calendar(sm.user[latestTerm]);

      _term = sm.term;
    } else 


    {
      this.user = new User();
      this.calendar = new Calendar();
      _term = latestTerm;
    }    

    Object.defineProperty(this, 'term', 
    {
      get : function () { return _term; },
      set : self.setTerm
    });
    

    Object.defineProperty(this, 'searchResults', 
    {
      get : function () { return _searchResults; },
      set : self.setSearchResults
    });
  }

  // var isadded = ($scope.user.calendars[$scope._app.term])  // The array
  //               .map(getid).indexOf(results[i].id) > 1;   // Matches
  Model.prototype.setSearchResults = function(course_array) {

    _searchResults = course_array.map(function (course) {

      return {
        display_html :  course.subject_key + ' ' +
                            course.catalog_number + ' ' +
                            course.title,
            course : course,
            added : false
      };
    });
  };

  Model.prototype.setTerm = function(term) {
    // Will set term, which changes calendars.
  };

  return Model;
})();

console.log('TowerModel', TowerModel);









/**
 * Calendar class.
 * @return {[type]} [description]
 */
var Calendar = (function () {
  function Calendar (term) {
    var self = this;

    // Start with term.
    self.term = term || new Term();

    // No course information yet. Populate so.
    self.courses = {};
    self.term.course_ids.forEach(function (cid) {
      self.courses[cid] = null;
    });

    // Courses will be populated manually by outside objects.
    // 
    
    self._selectedCourses = [];
    Object.defineProperty(this, 'selectedCourses', {
      get : function () {

        // Collect only courses from selected courses
        var obj = {};
        self._selectedCourses.forEach(function (selcrs) {
          obj[selcrs] = self.courses[selcrs];
        });

        return obj;
      }
    });
  }

  Calendar.prototype.selectCourse = function(cid) {
    if (this.courses[cid] === undefined) return; // Should be impossible. User
                                                 // Should only be able to select
                                                 // courses already in self.courses.

    this._selectedCourses.push(cid); 
    console.log('Sel YO', this._selectedCourses);
  };

  Calendar.prototype.unselectCourse = function(cid) {
    if (this._selectedCourses.indexOf(cid) < 0) return; // Course wasn't selected so
                                                     // we'll do nothing. This should
                                                     // be impossible though

    var index = this._selectedCourses.indexOf(cid);
    this._selectedCourses.splice(index, 1);
  };

  Calendar.prototype.addCourse = function(course) { // Assume object, not id string
    this.term.addCourse(course);
    this.courses[course.course_id] = course;
  };

  Calendar.prototype.removeCourse = function(course_id) {
    this.term.removeCourse(course_id);
    delete this.courses[course_id];
  };

  Calendar.prototype.save = function() {
  	// body...
  };

  return Calendar;

})();

console.log('Calendar', Calendar);











var User = (function () {
  
  function User (sm) {
    
  }

  return User;

})();
