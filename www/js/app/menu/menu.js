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
				templateUrl: 'js/app/menu/menu.html',
				controller: 'MenuCtrl as menu'
			});
	}
})();
