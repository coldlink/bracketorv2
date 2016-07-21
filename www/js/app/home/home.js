(function() {
	'use strict';

	angular
		.module('challonger')
		.config(stateConfig);

	function stateConfig($stateProvider) {
		$stateProvider
		//homepage
			.state('app.home', {
			url: '/home',
			views: {
				'menuContent': {
					templateUrl: 'js/app/home/home.html',
					controller: 'HomeCtrl as home'
				}
			}
		});
	}
})();
