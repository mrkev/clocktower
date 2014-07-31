'use strict';
/* global app, TowerModel, $, console*/

/* Controllers */

app.controller('AppController', function ($scope, socket) {

  $scope.model = new TowerModel();

  $scope.loadData = function (txt) {
    var newmodel = new TowerModel(txt);
    $scope.model = newmodel;
    $scope.currentCalendar = $scope.model.calendars[$scope.model.term];
  };

  $scope.$watch('model.savedata', function(newVal) {
      $scope.savedata = JSON.stringify(newVal);
  }, true);


  $scope.currentCalendar = $scope.model.calendars[$scope.model.term];

  $scope._app = {
    editCalendar  : false,
    saveToText    : true,
    saveToBroswer : false,
    saveToLogin   : false,
  };

  // Utility function
  $scope.contains = function (element, array) {
    return array.find(element) > -1;
  };

  socket.on('connect',   function ()  {});
  socket.on('user info', function (info) { this.user = info; });

});





app.controller('SearchController', function ($scope, socket, $sce) {

  // Start with no search results
  $scope.model.searchResults = [];

  /**
   * Sends search query to the server. Response will come
   * with 'search results' message.
   */
  $scope.doSearch = function () {
    socket.emit('search query', 
      { query : $scope.searchText, 
        term  : $scope.model.term
      });
  };


  /**
   * Recieved search results.
   *
   * Set them on the model, highlight the search text and trust as HTML
   * so angular can display it. 
   */
  socket.on('search results', function (results) {

    $scope.model.searchResults = results;
    $scope.model.searchResults.forEach(function (result) {
        
        result.display_html = $sce.trustAsHtml
                                  (result.display_html.replace
                                      ($scope.searchText, '<strong>$&</strong>'));
    });
  });



// HMMMMMMMMMMMMMMMMMMM 

  /**
   * Add course to current term.
   * @param {[type]} course [description]
   */
  $scope.addCourse = function (course) {
    $scope.currentCalendar.addCourse(course);
  };
});




app.controller('CalendarController', function ($scope, socket, $timeout) {

  /**
   * Query the courses we need.
   */
  $scope.queryNeededCourses = function () {

    var needed = 
    Object.keys($scope.currentCalendar.courses).reduce
    (function (prev, curr) {
        if ($scope.currentCalendar.courses[curr] === null) return prev.push(curr);
        return prev;
      }, []);

    socket.emit('get course info', needed);
  };


  /**
   * When we get course information, we plug it in directly
   * on to the calendar's courses.
   */
  socket.on('course info', function (results) {

    results.forEach(function (result) {
      if ($scope.currentCalendar.courses[result.course_id] === null) {
        $scope.currentCalendar.courses[result.course_id] = result;
      }
    });
  });





  /**
   * Do we need information for this course? If so, queries. If not
   * @param  {course} course The so called coruse or whatever it may be
   * @return {boolean}       Whether information was queried or not
   */
  $scope.willQueryInfo = function (course) {
    console.log('willqueryinfo-', typeof course !== 'object');

    if (typeof course === 'object') return false;
    socket.emit('get course info', course);
    return true;
  };


  // Glue. Will they work when courses are not loaded? TODO. 

  /**
   * Removes course from current term.
   * @param  {Course} course the course to remove. (Compares using course.course_id)
   */
  $scope.removeCourse = function (course) {
    $scope.currentCalendar.removeCourse(course.course_id);
  };

  /**
   * Marks course as selected.
   * @param  {Course} course course to select.
   */
  $scope.selectCourse = function (course) {
    $scope.currentCalendar.selectCourse(course.course_id);
  };

  /**
   * Removes course's selection mark.
   * @param  {Course} course course to unselect.
   */
  $scope.unselectCourse = function (course) {
    $scope.currentCalendar.unselectCourse(course.course_id);
  };

  $scope.isSelectedCourse = function (course) {
    return $scope.currentCalendar.selectedCourses[course.course_id] !== undefined;
  };


  // Note: No unselectCourse becasue there must always be at least one section
  // of each type selected.
  $scope.selectSection = function (section) {
    $scope.currentCalendar.selectSection(section);
  };

  $scope.isSelectedSection = function (section) {
    return $scope.currentCalendar
      .selectedSections[section.course_id][section.ssr_component] 
              == section.class_number;
  };

  $scope.ssrCompenentsOfType = function (course, ssr) {
    return course.sections.map(function (x) {
      return x.ssr_component;
    }).reduce(function (prev, curr) {
      return prev + (curr === ssr ? 1 : 0);
    }, 0);
  };



  /////////////////////////////////
  //
  // Calendar drawing n stuff.
  // 

  // Drawing.
  //   
  
  $scope.initCalendar = function () { console.log('init'); };

  var width = 721;
  var height = 1392;

  var midnightMillis = function (time) {
    return  Date.parse('July 26th, 2014, ' + time) - 
        Date.parse('July 26th, 2014, 12:00AM');
  };
  
  var table = 
  { 'M' : 0,
    'T' : 1,
    'W' : 2,
    'R' : 3,
    'F' : 4,
    'S' : 5  };

  
  $scope.getLeft = function (weekday) { 
    return table[weekday] * $scope.getWidth(); 
  };

  $scope.getTop  = function (time) {
    //console.log(midnightMillis(time));
    return (midnightMillis(time) / 86400000 /* Milliseconds in a day */) * height >> 0;
  };

  $scope.getHeight = function (start, end) {
    return $scope.getTop(end) - $scope.getTop(start);
  };

  $scope.getWidth = function () {
    return width / Object.keys(table).length >> 0;
  };


  // Drag, drop.
  // 


  $scope.dragging_section = null;

  var applyJQueryDrag = function () {
    $('.draggable').draggable({

      /**
       * Items go back to original position when released.
       * @type {Boolean}
       */
      revert : true,

      /**
       * No animation when items go back to original position.
       * @type {Number}
       */
      revertDuration : 0,
      
      /**
       * Show non-selected courses with the same ssr_component. This is done
       * by setting $scope.dragging_ssr to the ssr of the section of the
       * gathering being dragged.
       * @param  {[type]} event [description]
       * @param  {[type]} ui    [description]
       * @return {[type]}       [description]
       */
      start : function (event, ui) {
        // Show sections with same SSR.
        console.log('Event?', event, 'UI', ui);
        $scope.dragging_section = JSON.parse(event.target.dataset.section);
        $scope.$apply();
      },

      /**
       * [end description]
       * @return {[type]} [description]
       */
      stop : function () {
        $scope.dragging_section = null;
        $scope.$apply();
      }
    });



    $('.droppable').droppable({ 

      /**
       * Triggered when a draggable is dropped on top of this droppable. Selects
       * this droppable's section. Updates angular and re-applies jquery 
       * dragging.
       *
       * ui.draggable[0] = html element being dragged. Why is it an array?
       * event.target    = element on which drop was recieved.
       */
      drop : function (event, ui) {

        // Select the section
        var section = JSON.parse(event.target.dataset.section);
        
        
        // Update angular.
        $scope.$apply(function () {
          $scope.currentCalendar.selectSection(section);
        });
    
        // Reapply draggable and droppable after digest cycle.
        $timeout(function(){
          applyJQueryDrag(); 
        }); 
      } 
    });
  };


  // Whenever a repeat is done applies jquery dragging goodness.
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    applyJQueryDrag();
  });

  
});


app.directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  }
});
