define(['app', 'controllers/blobCtrl'], function (app) {
  'use strict';
  app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('blob', {
        url: '/blob/master/*path',
        templateUrl: '/views/blob.html',
        controller: 'BlobCtrl'
      });
  }]);
  app.run(['$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
    }]);
});
