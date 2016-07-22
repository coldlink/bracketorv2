(function() {
	'use strict';

	angular
		.module('challonger')
		.config(stateConfig);

	function stateConfig($stateProvider) {
		$stateProvider
		//homepage
			.state('app.settings', {
			url: '/settings',
			views: {
				'menuContent': {
					templateUrl: 'js/app/settings/settings.html',
					controller: 'SettingsCtrl as settings'
				}
			}
		});
	}
})();
