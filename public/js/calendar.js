'use strict';
/* global $, console */

/**
 * Calendar class. Instance represents a single calendar as built by the user.
 *
 * Courses will be populated manually by outside objects.
 */
var Calendar = (function () {
  
  function Calendar (sm) {
    var self = this;

    console.log('Initing calenddar to', sm);



    // Course selection // 
    
    /**
     * Courses in this calendar. In format:
     *
     * { course_id : course_object }
     *
     * @type {Object}
     */
    self.courses = sm ? sm.courses : {};

    /**
     * Selected Courses, as an array of course_ids.
     * @type {Array<String>}
     */
    self._selectedCourses = sm ? sm._selectedCourses : [];

    /**
     * Selected sections, in format:
     *
     * { course_id : { LEC: #, DIS: #, SSR: #}, ...}
     *
     * Where # is the class_number for the selected section.
     * 
     * @type {Object}
     */
    self._selectedSections = sm ? sm._selectedSections : {};

    if (sm) {
      console.log('Loaded calendar from sm.');
      console.dir(this);
    }


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

    Object.defineProperty(this, 'selectedSections', {
      get : function () {
        return self._selectedSections;
      }
    });

  }



  /////////////////////////// Course Management ////////////////////////////////

  /**
   * Marks a course as selected. Will only mark courses which are in 
   * this.courses. Users should only be able to select courses already available
   * in the calendar.
   *
   * TODO: Should check for duplicates?
   * 
   * @param  {String}   cid Id of course to mark as selected.
   * @return {Boolean}      True if course was selected. False otherwise.
   */
  Calendar.prototype.selectCourse = function(cid) {
    if (this.courses[cid] === undefined) return false; 
                                         // Should be impossible. User
                                         // Should only be able to select
                                         // courses already in self.courses.

    this._selectedCourses.push(cid); 
    console.log('Sel YO', this._selectedCourses);
    return true;
  };

  /**
   * Removes the selected mark from a coruse.
   * 
   * @param  {String} cid   Id of course to mark as unselected
   * @return {Boolean}      True if course was selected before, but is now 
   *                        unselected. False otherwise.
   */
  Calendar.prototype.unselectCourse = function(cid) {
    if (this._selectedCourses.indexOf(cid) < 0) return false; 
                                                // Course wasn't selected so
                                                // we'll do nothing. This should
                                                // be impossible though

    var index = this._selectedCourses.indexOf(cid);
    this._selectedCourses.splice(index, 1);
    return true;
  };

  /**
   * Adds course to calendar. By default it will be unselected. Selects one
   * section of each SSR component and leaves the rest unselected.
   * 
   * @param  {Object 'Course'} course   The course to add.
   * @return {Boolean}                  True if course was added. False 
   *                                    otherwise.
   */
  Calendar.prototype.addCourse = function(course) {

    // Don't add duplicates
    if ($.inArray(course.course_id, 
        Object.keys(this.courses)) > 0) return false;

    this.courses[course.course_id] = course;


    // Select sections for each component.
    var selsect = {};
    course.sections.forEach(function (sect) {
      if (selsect[sect.ssr_component]) return;
      selsect[sect.ssr_component] = sect.class_number;
    });

    this._selectedSections[course.course_id] = selsect;

    return true;
  };

  /**
   * Removes course from calendar. Removes all course selection and section
   * selection associated with this course, too.
   * @param  {String} course_id The ID of the course to remove.
   */
  Calendar.prototype.removeCourse = function(course_id) {
    
            this.unselectCourse(course_id);
    delete  this._selectedSections[course_id];

    delete this.courses[course_id];
  };


  ////////////////////////// Section Management ////////////////////////////////

  // We will use the acutal section object here. It should be there already,
  // because sections come with the course information (we don't want to keep
  // them because they might change).

  /**
   * Selects a section, and unselects any other selected section with the same
   * course_id and ssr_component.
   * @param  {Object'Section} section The section to select.
   * @return {Boolean}        False if section wasn't selected. True otherwise.
   */
  Calendar.prototype.selectSection = function(section) {
    var self = this;

    // If section is for a course not on this calendar, do nothing;
    if (this.courses[section.course_id] === undefined) return false;

    var csects = self._selectedSections[section.course_id];

    // If section is already selected do nothing.
    if (csects[section.ssr_component] === section.class_number) return false;

    // Mark that section for its given ssr_component.
    csects[section.ssr_component] = section.class_number;

  };

  /**
   * No unselect section becasue there should be at least one section selected
   * at all times.
   *
   * Calendar.prototype.unselectSection = function(section) {
   *   delete this._selectedSections[section.course_id][section.ssr_component];
   * };
   */
  


  //////////////////////// Persistance Management //////////////////////////////

  /**
   * Returns all data necessary to rebuild Calendar. Calendar can be rebuilt by 
   * calling new Calendar(x) where x is the return value of this function.
   * @return {Object} Calendar save object.
   */
  Calendar.prototype.save = function() {
    var nulled_courses = {};

    Object.keys(this.courses).forEach(function (cid) {
      nulled_courses[cid] = null;
    }); 

    // ^ After I solve the duplicate cids issue I'll use this, so courses have
    // to be fetched each time and updates are applied. ATM I guess we don't 
    // want the user to loose the specific version of the course it chose, so 
    // lets just keep the information in the saved user object.

  	return {
      courses : this.courses,
      _selectedCourses  : this._selectedCourses,
      _selectedSections : this._selectedSections
    };
  };

  return Calendar;

})();

console.log('Calendar', Calendar);