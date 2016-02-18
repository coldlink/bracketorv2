angular.module('challonger', ['ionic', 'ngCordova', 'angular-svg-round-progress'])

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

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

		.state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	})

	.state('app.about', {
		url: '/about',
		views: {
			'menuContent': {
				templateUrl: 'templates/about.html',
				controller: 'AboutCtrl'
			}
		}
	})

	.state('app.settings', {
		url: '/settings',
		views: {
			'menuContent': {
				templateUrl: 'templates/settings.html',
				controller: 'SettingsCtrl'
			}
		}
	})

	.state('app.browse', {
		url: '/browse',
		views: {
			'menuContent': {
				templateUrl: 'templates/browse.html',
				controller: 'BrowseCtrl'
			}
		}
	})

	.state('app.home', {
		url: '/home',
		views: {
			'menuContent': {
				templateUrl: 'templates/home.html',
				controller: 'HomeCtrl'
			}
		}
	})

	.state('app.results', {
		url: '/results/:url',
		views: {
			'menuContent': {
				templateUrl: 'templates/results.html',
				controller: 'ResultsCtrl'
			}
		}
	})

	.state('app.tournament', {
		url: '/tournament/:id',
		views: {
			'menuContent': {
				templateUrl: 'templates/tournament.html',
				controller: 'TournamentCtrl'
			}
		}
	})

	.state('app.create', {
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
});
