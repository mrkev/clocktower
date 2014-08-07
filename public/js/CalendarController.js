'use strict';
/* global app, $, Spectra */

app.controller('CalendarController', function ($scope, socket, $timeout) {
  var calendar = $scope.model.calendars[$scope.model.term];
  $scope.calendar = calendar;

  /**
   * Do we need information for this course? If so, queries. If not
   * @param  {course} course The so called coruse or whatever it may be
   * @return {boolean}       Whether information was queried or not
   */
  $scope.willQueryInfo = function (course) {
    //console.log('willqueryinfo-', typeof course !== 'object');

    if (typeof course === 'object') return false;
    socket.emit('get course info', course);
    return true;
  };

  $scope.isSelectedCourse = function (course) {
    return calendar.selectedCourses[course.course_id] !== undefined;
  };


  // Note: No unselectCourse becasue there must always be at least one section
  // of each type selected.
  $scope.selectSection = function (section) {
    calendar.selectSection(section);
  };

  $scope.isSelectedSection = function (section) {
    return calendar
      .selectedSections[section.course_id][section.ssr_component] == 
                                                          section.class_number;
  };

  /**
   * Returns number of sections with a given ssr component in a given course.
   * @param  {Course} course The course to look in
   * @param  {String} ssr    The ssr being looked for
   * @return {Number}        How many courses with the given ssr are in the 
   *                         course
   */
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
  
  $scope.initCalendar = function () {
    $('#lolcalendar').scrollTop(58 * 7);
  };

  var width = 721;
  var height = 1392;
  var margin = 6;

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
    return (table[weekday] * width / Object.keys(table).length + margin / 2) >> 0;
  };

  $scope.getTop  = function (time) {
    return (midnightMillis(time) / 86400000 /* Milliseconds in a day */) * height >> 0;
  };

  $scope.getHeight = function (start, end) {
    return $scope.getTop(end) - $scope.getTop(start);
  };

  $scope.getWidth = function (section) {
    
    var fw = width / Object.keys(table).length >> 0;
    if (calendar
              .selectedSections[section.course_id][section.ssr_component] === 
              section.class_number) fw = fw - margin;
    return fw;
  };

  $scope.isColliding = function (section) {
    return calendar.collisionsFor(section).length > 0;
  };



  $scope.getBackgroundColor = function (section) {

    if ($scope.isSelectedSection(section)) {
      if (calendar.collisionsFor(section).length > 0) return '#D11';

      return calendar.colorForCourse[section.course_id];
    } 
    return 'none';
  };

  $scope.getBorderColor = function (section) {
    return Spectra(calendar.colorForCourse[section.course_id])
                  .darken(26).rgbaString();
  };

  /**
   * Darkens a given color by a fixed amout (38%).
   * @param  {String} color The color to darken
   * @return {String}       The resulting RGBA color.
   */
  $scope.darken = function (color) {
    color = Spectra(color).darken(26);
    return color.rgbaString();
  };

  /**
   * Lightens a given color by a fixed amout (38%).
   * @param  {String} color The color to lighten
   * @return {String}       The resulting RGBA color.
   */
  $scope.lighten = function (color) {
    color = Spectra(color).lighten(26);
    return color.rgbaString();
  };


  // Drag, drop.
  // 

  /**
   * Section being dragged.
   * @type {Section}
   */
  $scope.dragging_section = null;

  /**
   * Returns true if section being dragged can be relpaced by a given section,
   * otherwise false.
   * @param  {[type]}  section [description]
   * @return {Boolean}         [description]
   */
  $scope.isDraggingCompatibleSection = function (section) {
    return $scope.dragging_section ? 
           ($scope.dragging_section.ssr_component === section.ssr_component &&
            $scope.dragging_section.course_id     === section.course_id) : false;
  };

  /**
   * Applies drag-drop from JQuery-UI to all pertinent classes.
   */
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

      stack : '.draggable',
      
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
          $scope.selectSection(section);
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



  // Custom events.
  // 
  
  $scope.addEvent = function () {
    
  }
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
  };
});
