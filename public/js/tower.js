'use strict';
/* global Calendar, console */


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

    /*
     * Try to initialized saved model
     */

    if (typeof sm === 'string') sm = JSON.parse(sm);

    // Bring the calendar objects back to life.
    if (sm) {
      for (var t in sm.calendars) {
        console.log('Will try to init cal:', t);
        sm.calendars[t] = new Calendar(sm.calendars[t]);
      }
    }

    /*
     * Set up everything.
     */

    /**
     * Current term id. Defaults to latest term
     * @type {String}
     */
    self._term = sm ? sm._term : latestTerm;


    /**
     * Information about the state of the app and user preferences
     * @type {[type]}
     */
    self._app = sm ? sm._app : {
      editCalendar  : false,
      saveToText    : false,
      saveToBrowser : true,
      saveToLogin   : false,
    };

    /**
     * Calendar objects, one for each term.
     * 
     * @type {Calendar}
     */
    self.calendars = sm ? sm.calendars : (function () {
      var cndrs = {};
      cndrs[self._term] = new Calendar();
      return cndrs;
    })();


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

  /**
   * Sets search results. Builds search result objects.
   * @param {Array | Null | undefined} course_array 
   *                 Array of result objects. Null flag means search in progress.
   *                 Undefined flag means blank (nothing to display).
   */
  Model.prototype.setSearchResults = function(course_array) {
    if (course_array === null) {
      _searchResults = null;
      return;
    }

    if (course_array === undefined) {
      _searchResults = undefined;
      return;
    }

    _searchResults = course_array.map(function (course) {

      return {
        display_html :  course.subject_key + ' ' +
                            course.catalog_number + ' ' +
                            course.title,
        course : course,
      };
    });
  };

  Model.prototype.setTerm = function(term) {
    // Should also change some default calendar?
    this._term = term;
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
      _app : this._app
    };
  };

  return Model;
})();

// console.log('TowerModel', TowerModel);