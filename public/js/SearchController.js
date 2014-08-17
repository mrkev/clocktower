'use strict';
/* global app */
/**
 * SearchController
 * 
 * Manages the the first card: searching.
 */

app.controller('SearchController', function ($scope, socket, $sce) {

  // Start with no search results
  $scope.model.searchResults = undefined;

  /**
   * Sends search query to the server. Response will come
   * with 'search results' message.
   */
  $scope.doSearch = function () {
    socket.emit('search query', 
      { query : $scope.searchText, 
        term  : $scope.model.term
      });

    // This will show the progress indicator.
    $scope.model.searchResults = null;
  };


  /**
   * Recieved search results.
   *
   * Set them on the model, highlight the search text and trust as HTML
   * so angular can display it. 
   */
  socket.on('search results', function (results) {

    $scope.model.searchResults = results;
    console.log('now the html part');
    $scope.model.searchResults.forEach(function (result) {
        
        result.display_html = $sce.trustAsHtml
                                  (result.display_html.replace
                                      ($scope.searchText, '<strong>$&</strong>'));

        result.course.class_description = $sce.trustAsHtml
                                  (result.body_html.replace
                                      ($scope.searchText, '<strong>$&</strong>'));
    });

    console.log('done');
  });

  // HMMMMMMMMMMMMMMMMMMM 

  /**
   * Add course to current term.
   * @param {[type]} course [description]
   */
  $scope.addCourse = function (course, $event) {
    $scope.model.calendars[$scope.model.term].addCourse(course);
    $event.stopPropagation();
  };
});
