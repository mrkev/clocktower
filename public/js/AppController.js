'use strict';
/* global app, TowerModel, console */

/* Controllers */

app.controller('AppController', function ($scope, socket, localStorageService, $modal) {
  // Load browser savedata.
  var savedata = localStorageService.get('clocktower-savedata');
  $scope.model = savedata ? new TowerModel(savedata) : new TowerModel();
  
  $scope.currentCalendar = $scope.model.calendars[$scope.model.term];

  $scope.loadData = function (txt) {
    var newmodel = new TowerModel(txt);
    $scope.model = newmodel;
    $scope.currentCalendar = $scope.model.calendars[$scope.model.term];
  };

  $scope.$watch('model.savedata', function (newVal) {
      $scope.savedata = JSON.stringify(newVal);
      if ($scope._app.saveToBrowser) {
        localStorageService.set('clocktower-savedata', $scope.savedata);
        console.dir('Saved', savedata);
      } 
    }, true);

  $scope._app = $scope.model._app;

  $scope.changeSaveToBrowser = function (dosave) {
    if (dosave) {
      localStorageService.set('clocktower-savedata', $scope.savedata);
    }

    else {
      localStorageService.remove('clocktower-savedata');
    }
  };

  socket.on('connect', function ()  {});
  $scope.appinfo = {};
  socket.on('app info', function (info)  {
    info.repository.weburl = info.repository.url.replace(/git/, 'https');
    $scope.appinfo = info;
  });


  // Display beta dialog
  // 
  var modalInstance = $modal.open({
    templateUrl: 'html/beta-dialog.html',
    controller: function ($scope, $modalInstance) {
      $scope.ok = function () {
         $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  });

  modalInstance.result.then(function () {
    $scope.model._app.shown.beta = true;
  });

});