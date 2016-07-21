(function() {
	'use strict';

	angular.module('challonger')
		.config(stateConfig)

	/**
	 * Routes Configuration.
	 * Configures all routes and views
	 * @class config
	 * @requires $stateProvider - ui.router states management
	 * @requires $urlRouterProvider - used to redirect 404s
	 * @static
	 */
	function stateConfig($stateProvider, $urlRouterProvider) {
		$stateProvider
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
	}
})();
