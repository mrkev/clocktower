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
});