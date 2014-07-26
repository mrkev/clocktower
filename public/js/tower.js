'use strict';
/* global Term, $ */


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


    // Section selection.

    // We will use the acutal section object here. It should be there already,
    // because sections come with the course information (we don't want to keep
    // them because they might change).

    // This will 'course_id : { LEC: #, DIS: #, etc }' only, which should be 
    // enough to quickly retrive selected courses. 
    self._selectedSections = {};
    Object.defineProperty(this, 'selectedSections', {
      get : function () {
        return self._selectedSections;
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

    // Don't add duplicates
    if ($.inArray(course.course_id, Object.keys(this.courses)) > 0) return;

    // Add the course.
    this.term.addCourse(course);
    this.courses[course.course_id] = course;

    // Select sections for each component.
    var selsect = {};
    course.sections.forEach(function (sect) {
      if (selsect[sect.ssr_component]) return;
      selsect[sect.ssr_component] = sect.class_number;
    });

    this._selectedSections[course.course_id] = selsect;

  };

  Calendar.prototype.removeCourse = function(course_id) {
    this.unselectCourse(course_id);
    this.term.removeCourse(course_id);
    delete this.courses[course_id];

    // Remove selected selections for that course.
    delete this._selectedSections[course_id];
  };




  // Section selection.

  Calendar.prototype.selectSection = function(section) {
    var self = this;

    var csects = self._selectedSections[section.course_id];

    // If section is already selected do nothing.
    if (csects[section.ssr_component] === section.class_number) return;

    // Mark that section for its given ssr_component.
    csects[section.ssr_component] = section.class_number;

  };

  Calendar.prototype.unselectSection = function(section) {
    delete this._selectedSections[section.course_id][section.ssr_component];
  };




  // Save

  Calendar.prototype.save = function() {
  	// body...
  };

  return Calendar;

})();

console.log('Calendar', Calendar);




var TakenCourse = (function () {
  
  function TakenCourse (cobj) {
    // Should cancel construction and return string.
    // http://stackoverflow.com/questions/1978049/what-values-can-a-constructor-return-to-avoid-returning-this
    if (typeof cobj !== 'object' || cobj === null) return cobj;
    if (cobj === undefined) return null;

    var self = this;
    $.extend(this, cobj);

    // Select some sections to take. One per type. Types could be defned by 
    // class_section's first digit (class_section / 100 >> 0) or by 
    // ssr_component.
    // 
    // Let's use ssr_component.
    
    self._selectedSections = {};

    this.sections.forEach(function (sect) {

      // There's already one. Return.
      if (self._selectedSections[sect.ssr_component]) return;

      // Set it.
      self._selectedSections[sect.ssr_component] = sect;

    });

    Object.defineProperty(this, 'selectedSections', {
      get : self.getSelectedSections,
      set : self.setSelectedSections
    });
  }

  TakenCourse.prototype.getSelectedSections = function() {
    var self = this;
    return Object.keys(self._selectedSections)
      .map(function (x) { return self._selectedSections[x]; });
  };

  TakenCourse.prototype.setSelectedSections = function(sctarr) {
    
  };

  return TakenCourse;

})();

console.log('TakenCourse', TakenCourse);







var User = (function () {
  
  function User (sm) {
    
  }

  return User;

})();
