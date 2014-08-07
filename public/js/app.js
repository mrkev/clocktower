'use strict';
/* global io, angular */

/* App */

var app = angular.module('Tower', ['LocalStorageModule']);

// From: http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
// Wraps Socket.io on Anglular. Makes sure to check state and update on 
// socket.io events.

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