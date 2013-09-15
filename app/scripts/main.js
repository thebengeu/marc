require.config({
  paths: {
    angular: '../bower_components/angular/angular',
    Prism: '../bower_components/prism/prism',
    'ui.router': '../bower_components/angular-ui-router/release/angular-ui-router'
  },
  shim: {
    angular: {
      exports: 'angular'
    },
    Prism: {
      exports: 'Prism'
    },
    'ui.router': {
      deps: ['angular']
    }
  }
});

require(['bootstrap', 'directives/prism'], function () {
  'use strict';
});
