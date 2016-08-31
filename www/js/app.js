/**
 * Defines the main AngularJS application - challonger.
 * All client-side things are a part of this module
 * @module challonger
 * @requires ionic												Ionic Framework - https://github.com/driftyco/ionic
 * @requires ngCordova
 * @requires angular-svg-round-progress		SVG Progress Bar used on tournament results page - https://github.com/crisbeto/angular-svg-round-progressbar
 */
angular.module('challonger', ['ionic', 'ngCordova', 'angular-svg-round-progress', 'ui.materialize'])
	.run(function($ionicPlatform) {
		$ionicPlatform.ready(function() {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
		});
	})
	/** Global Angular Config.
	 * @class config
	 * @requires $ionicConfigProvider
	 */
	.config(function($ionicConfigProvider) {
		$ionicConfigProvider.scrolling.jsScrolling(false);
		$ionicConfigProvider.views.maxCache(5);
	})
	/**
	 * Routes Configuration.
	 * Configures all routes and views
	 * @class config
	 * @requires $stateProvider - ui.router states management
	 * @requires $urlRouterProvider - used to redirect 404s
	 * @static
	 */
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
		//side menu
			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl'
			})
			//about page
			.state('app.about', {
				url: '/about',
				views: {
					'menuContent': {
						templateUrl: 'templates/about.html',
						controller: 'AboutCtrl'
					}
				}
			})
			//settings page
			.state('app.settings', {
				url: '/settings',
				views: {
					'menuContent': {
						templateUrl: 'templates/settings.html',
						controller: 'SettingsCtrl'
					}
				}
			})
			//browse tournaments page
			.state('app.browse', {
				url: '/browse',
				views: {
					'menuContent': {
						templateUrl: 'templates/browse.html',
						controller: 'BrowseCtrl'
					}
				}
			})
			//homepage
			.state('app.home', {
				url: '/home',
				views: {
					'menuContent': {
						templateUrl: 'templates/home.html',
						controller: 'HomeCtrl'
					}
				}
			})
			//tournament results page
			.state('app.results', {
				cache: false,
				url: '/results/:url',
				views: {
					'menuContent': {
						templateUrl: 'templates/results.html',
						controller: 'ResultsCtrl'
					}
				}
			})
			//single tournament view page
			.state('app.tournament', {
				cache: false,
				url: '/tournament/:id',
				views: {
					'menuContent': {
						templateUrl: 'templates/tournament.html',
						controller: 'TournamentCtrl'
					}
				}
			})
			//create tournament page
			.state('app.create', {
				cache: false,
				url: '/create',
				views: {
					'menuContent': {
						templateUrl: 'templates/create.html',
						controller: 'CreateCtrl'
					}
				}
			});
		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/app/home');
	})
	.run(function ($localStorage) {
		if (!$localStorage.get('http_defaults')) {
			$localStorage.setObject('http_defaults', {
				timeout: 10000
			});
		}
	})
	.factory('$http_defaults', function ($localStorage) {
		return $localStorage.getObject('http_defaults');
	})
