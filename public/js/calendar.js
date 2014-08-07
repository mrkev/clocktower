'use strict';
/* global $, console, Spectra, YDB */

/**
 * Calendar class. Instance represents a single calendar as built by the user.
 * Contains all information necessary to build a calendar.
 *
 */
var Calendar = (function () {
  
  function Calendar (sm) {
    var self = this;

    console.log('Initing calendar to', sm);

    // Persistent // 
    
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


    /**
     * Colors for each course, in format:
     *
     * { course_id : 'rgba'}
     * 
     * @type {Object}
     */
    self.colorForCourse = sm ? sm.colorForCourse : {};


    /**
     * Custom sections (aka. custom events). For these we will store all
     * the information here. They will be under the custom_events "course".
     * 
     */

    self.custom_events = sm ? sm.custom_events : {};

    // Non-persistent //
    
    /**
     * Database of course information. Calendar saves only ID's. We save all
     * info here.
     *
     * Note. Information from here wont be deleted. However, this wont be
     * persisted, and will be reloaded every time the user re-opens the 
     * application, to only the courses acutally saved in the calendar.
     * 
     * @type {YDB}
     */
    self.ydb = sm ? new YDB(sm.ydb) : new YDB();

    /*
     * Database of all collidable sections and collisions, in format:
     * 
     * { class_number : [#, #, ...], ...}
     * 
     * Gets rebuilt every time a term/course selection is changed.
     * 
     * @type {Object}
     */
    self._collisionDB = {};




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

    /**
     * Will deprecate selectedSections. Returns all section information for all
     * selected sections for selected courses.
     * @return {Array'Section}   All selected sections.
     */
    Object.defineProperty(this, 'selSections', {
      get : function () {

        var results = [];
        for (var cid in self._selectedSections) {
          if (self._selectedCourses.indexOf(cid) < 0) continue;
          for (var ssr in self._selectedSections[cid]) {
            var s1 = self.ydb.sections[self.selectedSections[cid][ssr]];
            console.log(s1.class_number);

            results.push(s1);
          }
        }

        return results;
      }
    });

    Object.defineProperty(this, 'selCourses', {
      get : function () {
        var results = [];
        for (var i = 0; i < self._selectedCourses.length; i++) {
          results.push(self.ydb.courses[self._selectedCourses[i]]);
        }

        return results;
      }
    });

    Object.defineProperty(this, 'units', {
      get : function() {
                
        var min = 0, max = 0;

        self._selectedCourses
            
            // Get unit ranges.
            .map(function (x) {
              var units = self.ydb.courses[x].units;
              var dash  = units.indexOf('-');
              return dash < 0 ? 
                parseInt(units) : 
                [parseInt(units.substr(0, dash)), parseInt(units.substr(dash + 1))];
            })
        
            // Add them up
            .forEach(function (x) {
        
              if (typeof x === 'number') {
                min += x; max += x; return; }
        
              min += x[0];
              max += x[1];
        
            });
        
        return min === max ? min : min + '-' + max;
      }

    });


    if (sm) {
      self.checkCollisions();
      console.log('Loaded calendar from sm.');
      console.dir(this);
    }
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

    // Add to selected courses
    this._selectedCourses.push(cid);

    // Check collisions
    this.checkCollisions();

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

    // Remove from selected courses
    var index = this._selectedCourses.indexOf(cid);
    this._selectedCourses.splice(index, 1);

    // Check collisions
    this.checkCollisions();
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

    // Add course information to ydb.
    this.ydb.pushCourse(course);

    // Might be deprecated by YDB.
    this.courses[course.course_id] = course;

    // Select sections for each component.
    var selsect = {};
    course.sections.forEach(function (sect) {
      if (selsect[sect.ssr_component]) return;
      selsect[sect.ssr_component] = sect.class_number;
    });

    this._selectedSections[course.course_id] = selsect;


    // Assign a color to the course
    if (!this.colorForCourse[course.course_id]) {
      var color = Spectra({ 
        h: Math.random() * 360 >> 0, 
        s: 0.42, 
        v: 0.75 + Math.random() / 14.28      // 0.75 -> ~.82
      });

      this.colorForCourse[course.course_id] = color.fadeOut(10).rgbaString();
    }

    return true;
  };

  /**
   * Removes course from calendar. Removes course selection, section
   * selection, and colour associated with this course, too.
   * @param  {String} course_id The ID of the course to remove.
   */
  Calendar.prototype.removeCourse = function(cid) {

    // Unselect course
    this.unselectCourse(cid);

    // Remove from selected sections database.
    delete  this._selectedSections[cid];

    // Remove from course database.
    delete this.courses[cid];

    // Remove from colours database.
    delete this.colorForCourse[cid];
  };


  ////////////////////////// Section Management ////////////////////////////////

  // We will use the acutal section object here to set things up, because it 
  // should be there already,but we wont save it; just it's class_number
  // (we don't want to keep them because they might change).

  /**
   * Selects a section, and unselects any other selected section with the same
   * course_id and ssr_component. Checks for collisions if changes did happen.
   * @param  {Object'Section} section The section to select.
   * @return {String}                 Id of section previously selected, or 
   *                                  false if no changes were made.
   */
  Calendar.prototype.selectSection = function(section) {
    var self = this;

    // If section is for a course not on this calendar, do nothing;
    if (this.courses[section.course_id] === undefined) return false;

    var csects = self._selectedSections[section.course_id];

    // If section is already selected do nothing.
    if (csects[section.ssr_component] === section.class_number) return false;

    // Mark that section for its given ssr_component.
    var prev = csects[section.ssr_component];
    csects[section.ssr_component] = section.class_number;

    // Collision
    // 
    
    // Delete the previously selected section one from collision db
    delete self._collisionDB[prev];

    // Check for collisions.
    this.checkCollisions();

    return prev;
  };

  /**
   * No unselect section becasue there should be at least one section selected
   * at all times.
   *
   * Calendar.prototype.unselectSection = function(section) {
   *   delete this._selectedSections[section.course_id][section.ssr_component];
   * };
   */

  /////////////////////////// Section Collisions ///////////////////////////////
  
  // * Could probably use performance tweaks, but should do for now //

  /**
   * Checks collisions between all selected sections for selected courses.
   */
  Calendar.prototype.checkCollisions = function() {
    var self = this;

    var selsect = self.selSections;
    var selcrs  = self.selectedCourses;
    // Test each selected section agaisnt the rest
    self.selSections.forEach(function (s1) {
     console.log(s1.course_id, 'LOL', self._selectedCourses, 
       self._selectedCourses.indexOf(s1.course_id) < 0);
     
      if (self._selectedCourses.indexOf(s1.course_id) < 0) return;
      self._collisionDB[s1.class_number] = testCollision(s1, selsect);
    
    });

    console.log('CollisionDB', self._collisionDB);
  };

  /**
   * Returns an array of all the collidable sections a given section collides
   * with.
   * @param  {Section} s1       Section to test for collisions against all 
   *                            collidable sections 
   * @return {Section | Array'Section}    
   *                            Section or array array of sections to test for
   *                            collision with s1.
   */
  var testCollision = function (s1, ss) {
    if (Object.prototype.toString.call(ss) !== '[object Array]') ss = [ss];
    
    var results = [];
    ss.forEach(function (s2) {

      if (s1.class_number === s2.class_number) return;
      
      // console.log('   ', s1.class_number, 'vs', s2.class_number, '= collision?');
      if (collide(s1, s2)) {
        // console.log('YES');
        results.push(s2);
      }
    });

    return results;
  };

  /**
   * Returns true if two given sections collide. False otherwise.
   * @param  {Section} s1 Section to compare
   * @param  {Section} s2 Section to compare
   * @return {Boolean}    True if sections meetings collide. False otherwise.
   */
  var collide = function (s1, s2) {
    
    var match = matchingMeetingPattern(s1, s2);
    if (match.length === 0) return false;

    console.log('   Weedays match. Now times.');

    var s1s = midnightMillis(s1.meeting.start_time);
    var s1e = midnightMillis(s1.meeting.end_time);

    var s2s = midnightMillis(s2.meeting.start_time);
    var s2e = midnightMillis(s2.meeting.end_time);

    return (s1s <= s2s && s2s <= s1e) || (s2s <= s1s && s1s <= s2e);
  };

  /**
   * Returns the days at which meeting patterns for given sections match, or an 
   * empty array if they dont.
   * @param  {Section} s1     First section to compare
   * @param  {Section} s2     Second section to compare
   * @return {Array'String}   Array containing meeting pattern days at which 
   *                          meeting patterns match
   */
  var matchingMeetingPattern = function (s1, s2) {

     if (s1.meeting.meeting_pattern === s2.meeting.meeting_pattern) 
         return s1.meeting.meeting_pattern.split('');

     var regexp = /(M?)(T?)(W?)(R?)(F?)(S?)/;
     
     // Remove first element. Its the raw input. Keep only matched.
     var m1 = regexp.exec(s2.meeting.meeting_pattern).slice(1);
     var m2 = regexp.exec(s1.meeting.meeting_pattern).slice(1);

     var res = [];
     for (var i = m1.length - 1; i >= 0; i--) {
       if (m1[i] !== '' && m2[i] !== '') res.push(m1[i]);
     }

     return res;
  };

  /**
   * Converts string time representation to milliseconds since midnight.
   * @param  {String} time Time to convert
   * @return {Number}      Milliseconds since midnight represented by the given 
   *                       time.
   */
  var midnightMillis = function (time) {
    return  Date.parse('July 26th, 2014, ' + time) - 
        Date.parse('July 26th, 2014, 12:00AM');
  };

  /**
   * Returns all the class_numbers a given section is known to collide with
   * @param  {Section | String} sctn The section or class number to return
   *                                 collisions for
   * @return {array}                 Array of class_numbers of sections known
   *                                 to collide with the given section
   */
  Calendar.prototype.collisionsFor = function(sctn) {
    if (typeof sctn === 'object') sctn = sctn.class_number;
    if (this._collisionDB[sctn] === undefined) return [];
    return this._collisionDB[sctn];
  };

  /////////////////////////////// Cusstom Events ///////////////////////////////
  
  Calendar.prototype.addEvent = function(nevnt) {
    var self = this;

    self.custom_events.push(nevnt);
  };

  /////////////////////////////// Persistance //////////////////////////////////

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
      courses           : this.courses,
      _selectedCourses  : this._selectedCourses,
      _selectedSections : this._selectedSections,
      colorForCourse    : this.colorForCourse,
      custom_events     : this.custom_events,

      // Will save it for now, but it should be loaded on-the fly, IMO.
      ydb               : this.ydb.save()
    };
  };

  //////////////////////////////// Yo FRANKIE //////////////////////////////////
  
  return Calendar;

})();

// console.log('Calendar', Calendar);