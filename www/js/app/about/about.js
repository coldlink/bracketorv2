(function() {
	'use strict';

	angular
		.module('challonger')
		.config(stateConfig);

	function stateConfig($stateProvider) {
		$stateProvider
		//about page
			.state('app.about', {
			url: '/about',
			views: {
				'menuContent': {
					templateUrl: 'js/app/about/about.html',
					controller: 'AboutCtrl as about'
				}
			}
		});
	}
})();
