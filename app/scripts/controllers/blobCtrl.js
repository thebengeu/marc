define(['app'], function (app) {
  'use strict';
  app.controller('BlobCtrl', ['$http', '$scope', '$stateParams',
    function ($http, $scope, $stateParams) {
      $scope.themeSuffix = '-dark';
      $scope.themes = [
        {
          label: 'Default',
          suffix: ''
        },
        {
          label: 'Coy',
          suffix: '-coy'
        },
        {
          label: 'Dark',
          suffix: '-dark'
        },
        {
          label: 'Funky',
          suffix: '-funky'
        },
        {
          label: 'Okaidia',
          suffix: '-okaidia'
        },
        {
          label: 'Tomorrow',
          suffix: '-tomorrow'
        },
        {
          label: 'Twilight',
          suffix: '-twilight'
        }
      ];

      var Extensions = {
        'js': 'javascript',
        'html': 'markup',
        'svg': 'markup'
      };

      var src = $stateParams.path;
      var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
      $scope.language = Extensions[extension] || extension;

      $http.get(src).success(function (data) {
        $scope.content = data;
      });
    }]);
});
