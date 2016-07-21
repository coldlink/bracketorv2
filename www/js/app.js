(function() {
	'use strict';
	/**
	 * Defines the main AngularJS application - challonger.
	 * All client-side things are a part of this module
	 * @module challonger
	 * @requires ionic												Ionic Framework - https://github.com/driftyco/ionic
	 * @requires ngCordova
	 * @requires angular-svg-round-progress		SVG Progress Bar used on tournament results page - https://github.com/crisbeto/angular-svg-round-progressbar
	 */
	angular.module('challonger', ['ionic', 'ngCordova', 'angular-svg-round-progress'])
		.run(platformConfig)
		.config(ionicConfig);

	/** Global Angular Config.
	 * @class config
	 * @requires $ionicConfigProvider
	 */
	function ionicConfig($ionicConfigProvider) {
		$ionicConfigProvider.scrolling.jsScrolling(false);
		$ionicConfigProvider.views.maxCache(5);
	}

	function platformConfig($ionicPlatform) {
		$ionicPlatform.ready(() => {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if (window.StatusBar) StatusBar.styleDefault();
		});
	}
})();
