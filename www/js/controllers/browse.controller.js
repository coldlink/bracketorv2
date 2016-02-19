/**
 * Browse Controller for state 'app.browse'
 * @class AboutCtrl
 * @constructor
 * @param $scope 				Angular scope
 * @param $API 					js/services/api.js
 * @param $localStorage js/services/localStorage.js
 * @param $vib 					js/services/vib.js
 * @param $state 				ui.router state provider
 */
angular.module('challonger')
	.controller('BrowseCtrl', function($scope, $API, $localStorage, $state, $vib) {
		//vibrate on state enter
		$vib.vshort();

		//assume api key exists with no errors
		var API_KEY;
		$scope.API_KEY = true;
		$scope.error = null;

		//list of posible errors
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

		//on view enter, attempt to get api key. if error set API_KEY to false, displaying an error message
		$scope.$on('$ionicView.enter', function(e) {
			API_KEY = $localStorage.get('API_KEY');
			if (!API_KEY) {
				$scope.API_KEY = false;
			} else {
				$scope.API_KEY = true;
			}
		});

		//open the input for the type selected, e.g. created tournament/single tournament, and hide any open tournaments
		$scope.open = function(type) {
			$vib.vshort();
			$scope.error = null;
			if ($scope.expand === type) {
				$scope.expand = false;
			} else {
				$scope.expand = type;
			}
		};

		//On click "Get Tournaments"
		$scope.click = function(type, subdomain, eurl, isub) {
			$vib.vshort();

			//get api url from config
			var url = $API.url();

			//find the currently selected type of tournament to find, and set parameters respectively
			switch (type) {
				//own created tournaments
				case 'created':
					url += 'tournaments.json?api_key=' + API_KEY;
					break;
				//tournament by subdomain
				case 'subdomain':
					//show error if no subdomain entered
					if (!subdomain) {
						$scope.error = errors.noSub;
						return false;
					}
					//if subdomain doesnt match regex show error
					if (subdomain.search(/[^A-Za-z0-9\-]/) !== -1) {
						$scope.error = errors.subRegEx;
						return false;
					}
					//finish adding url parameters
					url += 'tournaments.json?api_key=' + API_KEY + '&subdomain=' + subdomain;
					break;
				//get a single tournament by url
				case 'single':
					var tournament;
					//check for no subdomain entered
					if (!isub) {
						//check for no url entered, show error if no url.
						if (!eurl) {
							$scope.error = errors.noUrl;
							return false;
						}
						//show error if url doesnt match regex
						if (eurl.search(/[^A-Za-z0-9\-]/) !== -1) {
							$scope.error = errors.urlRegEx;
							return false;
						}
						//set tournament to the url
						tournament = eurl;
					} else {									//if subdomain exists
						//show error if no subdomain and no url
						if (!subdomain && !eurl) {
							$scope.error = errors.noSubUrl;
							return false;
						}
						//show error if no subdomain
						if (!subdomain) {
							$scope.error = errors.noSub;
							return false;
						}
						//subdomain regex error
						if (subdomain.search(/[^A-Za-z0-9\-]/) !== -1) {
							$scope.error = errors.subRegEx;
							return false;
						}
						//not url error
						if (!eurl) {
							$scope.error = errors.noUrl;
							return false;
						}
						//url regex error
						if (eurl.search(/[^A-Za-z0-9\_]/) !== -1) {
							$scope.error = errors.urlRegEx;
							return false;
						}
						//set tournament to url and subdomain
						tournament = subdomain + '-' + eurl;
					}
					//finish adding url parameters
					url += 'tournaments/' + tournament + '.json?api_key=' + API_KEY;
					break;
				//set flag for getting favourite tournaments
				case 'favTour':
					url = 'favTour';
					break;
				//set flag for getting history tournaments
				case 'hisTour':
					url = 'hisTour';
					break;
				default:
					break;
			}
			//go to results (app.results & ResultsCtrl) with the tournament url as a parameter
			$state.go('app.results', {
				url: url
			});
		};
	});
