'use strict';
/* global app, TowerModel*/

/* Controllers */

app.controller('AppController', function ($scope, socket) {

  $scope.model = new TowerModel();


  $scope._app = {
    editCalendar : false
  };

  // Utility function
  $scope.contains = function (element, array) {
    return array.find(element) > -1;
  };


  //$scope.calendarCourse = function (object, add) {
  //  console.log('calendarCourse');
  //  var calarr = $scope.user.calendars[$scope._app.term];
  //  if (add) {
  //    object.awiwi = true;
  //    calarr.push(object); 
  //    return;
  //  }
  //
  //  var delIndex = calarr.map(function(x) {return x.id; }).indexOf(object.id);
  //  if (delIndex > -1) calarr.splice(delIndex, 1);
  //};

  socket.on('connect',   function (skt)  { console.log('connected', skt);});
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
    console.log('Added', course.course_id);
    $scope.model.calendar.addCourse(course);
  };
});




app.controller('CalendarController', function ($scope, socket) {

  $scope.ccourses = $scope.model.calendar.courses;

  /**
   * Query the courses we need.
   */
  $scope.queryNeededCourses = function () {

    var needed = 
    Object.keys($scope.model.calendar.courses).reduce
    (function (prev, curr) {
        if ($scope.model.calendar.courses[curr] === null) return prev.push(curr);
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
      if ($scope.ccourses[result.course_id] === null) {
        $scope.ccourses[result.course_id] = result;
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
    $scope.model.calendar.removeCourse(course.course_id);
  };

  /**
   * Marks course as selected.
   * @param  {Course} course course to select.
   */
  $scope.selectCourse = function (course) {
    $scope.model.calendar.selectCourse(course.course_id);
  };

  /**
   * Removes course's selection mark.
   * @param  {Course} course course to unselect.
   */
  $scope.unselectCourse = function (course) {
    $scope.model.calendar.unselectCourse(course.course_id);
  };

  $scope.isSelectedCourse = function (course) {
    console.log('Selcourses, yo', $scope.model.calendar.selectedCourses)
    return $scope.model.calendar.selectedCourses[course.course_id] !== undefined;
  };



  // $scope.$watch('term.course_ids', function (newval, oldval) {
  //     $scope.ccourses = $scope.model.term.course_ids;
  // });

});
