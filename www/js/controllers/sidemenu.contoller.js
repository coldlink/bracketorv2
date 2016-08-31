angular.module('challonger')
	.controller('SideMenuCtrl', function($scope, $localStorage, $state, $API) {
		var errors = {
			noSub: {
				message: 'No organization entered.'
			},
			noUrl: {
				message: 'No URL entered.'
			},
			noSubUrl: {
				message: 'No URL or organization entered.'
			},
			subRegEx: {
				message: 'Organization must be composed of letters, numbers, and dashes only.'
			},
			urlRegEx: {
				message: 'URL must be composed of letters, numbers, and underscores only.'
			}
		};

		var API_KEY = $localStorage.get('API_KEY');
		if (!API_KEY) {
			$scope.API_KEY = false;
		} else {
			$scope.API_KEY = true;
		}

		$scope.openQuickAccess = function() {
			//get api url from config
			var url = $API.url();

			var qaobj = $localStorage.getObject('quickAccess');
			switch (qaobj.action) {
				case 'created':
					url += 'tournaments.json?api_key=' + API_KEY;
					break;
				case 'subdomain':
					//show error if no subdomain entered
					if (!qaobj.subdomain) {
						$scope.error = errors.noSub;
						return false;
					}
					//if subdomain doesnt match regex show error
					if (qaobj.subdomain.search(/[^A-Za-z0-9\-]/) !== -1) {
						$scope.error = errors.subRegEx;
						return false;
					}
					//finish adding url parameters
					url += 'tournaments.json?api_key=' + API_KEY + '&subdomain=' + qaobj.subdomain;
					break;
				case 'bookmark':
					url = 'favTour';
					break;
				case 'history':
					url = 'hisTour';
					break;
			}

			$state.go('app.results', {
				url: url
			});
		}
	});
