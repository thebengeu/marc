define(['app', 'Prism'], function (app, Prism) {
  'use strict';
  app.directive('prism', function() {
    return {
      link: function(scope) {
        scope.$watch(function() {
          Prism.highlightAll();
        });
      }
    };
  });
});
