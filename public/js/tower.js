'use strict';
/* global Calendar, $ */


/**
 * Model class.
 * @return {[type]} [description]
 */

var latestTerm = 'FA14';

var TowerModel = (function () {

  var _searchResults = [];


  function Model (sm) {
    var self = this;

    self.init(sm);

    Object.defineProperty(this, 'term', 
    {
      get : function () { return self._term; },
      set : self.setTerm
    });
    

    Object.defineProperty(this, 'searchResults', 
    {
      get : function () { return _searchResults; },
      set : self.setSearchResults
    });

    Object.defineProperty(this, 'savedata',
    {
      get : self.save,
      set : self.init
    });
  }

  Model.prototype.init = function() {
    // body...
  };

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


  Model.prototype.save = function() {

    
    var clnds = {};
    for (var t in this.calendars) {
      clnds[t] = this.calendars[t].save();
    }

    return {
      term : this._term,
      calendars : clnds
    };
    
  };

  Model.prototype.init = function(sm) {
    if (typeof sm === 'string') sm = JSON.parse(sm);


    // Bring the calendar objects back to life.
    if (sm) {
      for (var t in sm.calendars) {
        console.log('Will try to init cal:', t);
        sm.calendars[t] = new Calendar(sm.calendars[t]);
      }
    }


    var self = this;

    self._term     = sm ? sm.term : latestTerm;
    self.calendars = sm ? sm.calendars : (function () {
      var cndrs = {};
      cndrs[self._term] = new Calendar();
      return cndrs;
    })();

    /**
     * Currently selected calendar.
     *
     * TODO: I should make calendars term-aware (calendar.term)
     * @type {Calendar}
     */
    self.calendar = self.calendars[self._term];

  };

  return Model;
})();

console.log('TowerModel', TowerModel);


// var User = (function () {
//   
//   function User (sm) {
//     this.terms = {};
//   }
// 
//   return User;
// 
// })();
