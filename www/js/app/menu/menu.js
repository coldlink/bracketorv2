(function() {
	'use strict';

	angular
		.module('challonger')
		.config(stateConfig);

	function stateConfig($stateProvider) {
		$stateProvider
			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl'
			});
	}
})();
