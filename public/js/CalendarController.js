'use strict';
/* global app, $, Spectra */

app.controller('CalendarController', function ($scope, socket, $timeout, $rootScope) {
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
  //   x
  
  $scope.initCalendar = function () {
    $('#lolcalendar').scrollTop($scope.model._app.calendarScrollTop);
    $('#lolcalendar').scroll(function() {
      $scope.model._app.calendarScrollTop = $('#lolcalendar').scrollTop();
      console.log($scope.model._app.calendarScrollTop);
    });
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
    return ( time /* midnightMillis(time) */ / 86400000 /* Milliseconds in a day */) * height >> 0;
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

  /**
   * Section being dragged.
   * @type {Section?? course_id, ssr_component} 
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

  var reg = /(^.*)-(.*)/;
  $rootScope.$on('ANGULAR_DRAG_START', function (event, sendChannel) {
      var matches = reg.exec(sendChannel);
      $scope.dragging_section = {course_id : matches[1], ssr_component: matches[2] };
      $scope.$apply();

  });

  $rootScope.$on('ANGULAR_DRAG_END', function (event, sendChannel) {
      $scope.$apply(function () {
        $scope.dragging_section = null;
      });
  });

  // Whenever a repeat is done applies popover goodness.
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    //applyPopovers();
  });



  // Custom events.
  // 
  
  $scope.newEvent = {};
  $scope.addEvent = function () {
    calendar.addEvent($scope.newEvent);
    $scope.newEvent = {};
  };



  // Pre-enroll
  // 
  
  $scope.showPreenroll = false;

});

app.directive('yoHomiePops', function() {
 return function(scope, element, attrs) {
  console.log(attrs);
  $(element).bind('click', function (e) {
      $(".willpop").popover('hide');
      e.stopPropagation();
  });

  $(document).bind('click', function (e) {
      $(".willpop").popover('hide');
  });

  $(element).popover({
        placement: attrs.popPlacement,
        html: 'true',
        trigger : 'click',
        content : attrs.popContent
    });
  }

})

app.directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      console.log('OFR', element);
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  };
})