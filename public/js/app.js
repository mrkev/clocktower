'use strict';
/* global io, angular */

/* App */

var app = angular.module('Tower', ['LocalStorageModule', 'ui.bootstrap', 'ngDragDrop']);

// From: http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
// Wraps Socket.io on Anglular. Makes sure to check state and update on 
// socket.io events.


/* Configuration */

/**
 * Always append ui.bootstrap tooltips (and popovers) to body. Solves bug where
 * popovers weren't appearing at the correct left/right displacement relative
 * to the screen.
 */
app.config(['$tooltipProvider',function($tooltipProvider) {
  $tooltipProvider.appendToBody = true;
  console.log($tooltipProvider);
}])

/**
 * Filter for unsafe html.
 */
app.filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);

/**
 * Overrides ui.bootstrap's template to allow the use of html as the body or 
 * title.
 */
angular
  .module('template/popover/popover.html', [])
  .run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/popover/popover.html',
      '<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n' +
      '  <div class=\"arrow\"></div>\n' +
      '\n' +
      '  <div class=\"popover-inner\">\n' +
      '<button type="button" id="close" class="close"' +
      'onclick="$(&quot;#example&quot;).popover(&quot;hide&quot;);">&times;</button>' + 
      '      <h3 class=\"popover-title\" ng-bind-html=\"title | unsafe\" ng-show=\"title\"></h3>\n' +
      '      <div class=\"popover-content\"ng-bind-html=\"content | unsafe\"></div>\n' +
      '  </div>\n' +
      '</div>\n' +
      '');
}]);


/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
app.factory('socket', function ($rootScope) {
  var socket = io.connect();                          // Create a new socket for auth-user namespace.
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
})


// UNUSED. Eventually will be used for web authentication.
//
// Thanks to https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
// For the woderful insight on authentication with events/services/etc.
.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})


.factory('AuthService', function ($http, Session) {
  var authService = {};
 
  authService.login = function (credentials) {
    return $http
      .post('/login', credentials)
      .then(function (res) {
        Session.create(res.id, res.user.id, res.user.role);
        return res.user;
      });
  };

  authService.isAuthenticated = function () {
    return !!Session.userId;
  };

  return authService;
})

.service('Session', function () {
  this.create = function (sessionId, userId) {
    this.id = sessionId;
    this.userId = userId;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
  };
  return this;
});