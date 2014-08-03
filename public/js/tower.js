'use strict';
/* global Calendar, console, YDB */


/**
 * Model class.
 *
 * UGH. YAWG should be term aware... :/
 */

var latestTerm = 'FA14';

var TowerModel = (function () {

  var _searchResults = [];

  function Model (sm) {
    var self = this;

    // First try to initialize any saved model.
    //
    //
    
    if (typeof sm === 'string') sm = JSON.parse(sm);

    // Bring the calendar objects back to life.
    if (sm) {
      for (var t in sm.calendars) {
        console.log('Will try to init cal:', t);
        sm.calendars[t] = new Calendar(sm.calendars[t]);
      }
    }


    // Now set up everything.
    // 
    // 

    /**
     * Current term id. Defaults to latest term
     * @type {String}
     */
    self._term     = sm ? sm._term : latestTerm;

    /**
     * Calendar objects, one for each term.
     * @type {Calendar} A calendar object, representing all information 
     *                  necessary to re-create a calendar.
     */
    self.calendars = sm ? sm.calendars : (function () {
      var cndrs = {};
      cndrs[self._term] = new Calendar();
      return cndrs;
    })();

    /**
     * Database of course information. Calendar saves only ID's. We save all
     * info here.
     * @type {YDB}
     */
    self.ydb = sm ? new YDB(sm.ydb) : new YDB();


    /**
     * Database of all collidable sections and collisions, in format:
     * 
     * { class_number : [section, section, ...], ...}
     *
     * Here just for the sake of reference, because it gets rebuilt on setTerm.
     * @type {Object}
     */
    self._collisionDB = sm ? sm._collisionDB : {};

    Object.defineProperty(this, 'collisionDB', {
      get : function () {
        return self._collisionDB;
      }
    });

    Object.defineProperty(this, 'term', {
      get : function () { return self._term; },
      set : self.setTerm
    });
    
    Object.defineProperty(this, 'searchResults', {
      get : function () { return _searchResults; },
      set : self.setSearchResults
    });

    Object.defineProperty(this, 'savedata', { get : self.save });
  }

  /*
   * Search 
   */

  /**
   * Sets search results. Builds search result objects.
   * @param {[type]} course_array [description]
   */
  Model.prototype.setSearchResults = function(course_array) {

    _searchResults = course_array.map(function (course) {

      return {
        display_html :  course.subject_key + ' ' +
                            course.catalog_number + ' ' +
                            course.title,
        course : course,
      };
    });
  };



  //////////////////////////////// Courses /////////////////////////////////////
  
  /**
   * Adds course to current caledar and the Dawg.
   * @param {[type]} course [description]
   */
  Model.prototype.addCourse = function(course) {
    var self = this;

    self.ydb.pushCourse(course);
    self.calendars[self._term].addCourse(course);
  };

  /**
   * Remvoes coruse from current calendar and the Dawg. 
   * @param  {[type]} cid [description]
   * @return {[type]}     [description]
   */
  Model.prototype.removeCourse = function(cid) {
    var self = this;

    // Unselect it.
    self.unselectCourse(cid);
    
    // Remove from calendar
    self.calendars[self._term].removeCourse(cid);

    // Remove sections from collidable sections.
    self.ydb.courses[cid].sections.forEach(function (s1) {
      delete self._collisionDB[s1.class_number];
    });
  };


  /**
   * Selects course in the calendar. Tests collisions for all selected sections,
   * and adds them to found collisions. Adds all selected section to collidable
   * sections.
   * @param  {[type]} cid [description]
   * @return {[type]}     [description]
   */
  Model.prototype.selectCourse = function(cid) {
    var self = this;

    // Select course on calendar.
    self.calendars[self._term].selectCourse(cid);

    // Add to collision db.
    for (var ssr in self.calendars[self._term]
                        .selectedSections[cid]) {

      var scn1 = self.calendars[self._term]
                     .selectedSections[cid][ssr];

      self._collisionDB[scn1] = null;
    }

    // Remake collision db.
    this.checkCollisions();
  };

  /**
   * Unselects corse from the calendar. Remakes collision db.
   * @param  {[type]} cid [description]
   * @return {[type]}     [description]
   */
  Model.prototype.unselectCourse = function(cid) {
    var self = this;

    // Remove it from collision db.
    for (var ssr in self.calendars[self._term]
                        .selectedSections[cid]) {

      var scn1 = self.calendars[self._term]
                     .selectedSections[cid][ssr];

      delete self._collisionDB[scn1];
    }

    // Unselect from calendar.
    self.calendars[self._term].unselectCourse(cid);

    // Remake collision db.
    self.checkCollisions();
  };


  /////////////////////////// Section Collisions ///////////////////////////////

  Model.prototype.checkCollisions = function() {
    var self = this;

    var collidable = Object.keys(this._collisionDB)

      // Get the section for each class_number
      .map(function (scn) {
        return self.ydb.sections[scn];
      });

    // Test each section agaisnt the rest
    collidable.forEach(function (s1) {
      self._collisionDB[s1.class_number] = 
            testCollisionWithSections(s1, collidable);
    });
    

    console.log('CollisionDB', self._collisionDB);
  };

  /**
   * Returns an array of all the collidable sections a given section collides
   * with.
   * @param  {Section} s1       Section to test for collisions against all 
   *                            collidable sections 
   * @return {Array'Section}    Array of sections that collide with the given 
   *                            section.
   */
  var testCollisionWithSections = function (s1, collidable) {
    // throw new Error('YO');
    var results = [];
    collidable.forEach(function (s2) {
      if (s1.class_number === s2.class_number) return;
      
      console.log('   ', s1.class_number, 'vs', s2.class_number, '= collision?');
      if (collide(s1, s2)) {
        console.log('YES');
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

    var regexp = /(M?)(T?)(W?)(R?)(F?)(S?)/
    
    // Remove first element. Its the raw input. Keep only matched.
    var m1 = regexp.exec(s2.meeting.meeting_pattern).slice(1);
    var m2 = regexp.exec(s1.meeting.meeting_pattern).slice(1);

    var res = []
    for (var i = m1.length - 1; i >= 0; i--) {
      if (m1[i] !== '' && m2[i] !== '') res.push(m1[i]);
    };

    return res;
  };

  var midnightMillis = function (time) {
    return  Date.parse('July 26th, 2014, ' + time) - 
        Date.parse('July 26th, 2014, 12:00AM');
  };

  /////////////////////////// Section Selection ////////////////////////////////

  Model.prototype.selectSection = function(section) {
    var self = this;
    // Select new section and delete the previous one from collision db
    delete self._collisionDB[this.calendars[this._term].selectSection(section)];

    console.log('Now selected',
      this.calendars[this._term]
      .selectedSections[section.course_id][section.ssr_component]);

    // Just re-add all sections from the course to collisionDawglol.
    for (var ssr in self.calendars[self._term]
                        .selectedSections[section.course_id]) {

      var scn1 = self.calendars[self._term]
                     .selectedSections[section.course_id][ssr];

      self._collisionDB[scn1] = null;
    }

    // Remake collision db.
    this.checkCollisions();
  };

  Model.prototype.setTerm = function(term) {
    // Should also change some default calendar?
    this._term = term;


    // Reset colliding sections db. Add this term's selected courses

    this._collisionDB = {};
    for (var cid in this.calendars[this._term].selectedSections) {
      for (var ssr in this.calendars[this._term].selectedSections[cid]) {

        var scn1 = this.calendars[this._term]
                       .selectedSections[cid][ssr];

        this._collisionDB[scn1] = null;
      }
    }

    // Check collisions. 
    this.checkCollisions();
  };

  Model.prototype.units = function() {
    var self = this;

    var min = 0, max = 0;
    var units = Object.keys(this.calendars[this._term].selectedCourses)
        
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
  };

  /**
   * Who's gonna save the world tonight?
   * @return {Object} Funca loco.
   */
  Model.prototype.save = function() {

    // Call save on all calendars
    var clnds = {};
    for (var t in this.calendars) {
      clnds[t] = this.calendars[t].save();
    }

    // Save this madness
    return {
      _term : this._term,
      calendars : clnds,
      ydb : this.ydb.save(), // Will kill this once jit info fetching is supported
      _collisionDB : this._collisionDB
    };
  };

  return Model;
})();

// console.log('TowerModel', TowerModel);