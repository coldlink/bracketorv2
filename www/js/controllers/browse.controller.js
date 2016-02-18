angular.module('challonger')
	.controller('BrowseCtrl', function($scope, $API, $localStorage, $state, $vib) {
		var API_KEY;
		$vib.vshort();
		$scope.API_KEY = true;
		$scope.error = null;

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

		$scope.$on('$ionicView.enter', function(e) {
			API_KEY = $localStorage.get('API_KEY');
			if (!API_KEY) {
				$scope.API_KEY = false;
			} else {
				$scope.API_KEY = true;
			}
		});

		$scope.open = function(type) {
			$vib.vshort();
			$scope.error = null;
			if ($scope.expand === type) {
				$scope.expand = false;
			} else {
				$scope.expand = type;
			}
		};

		$scope.click = function(type, subdomain, eurl, isub) {
			$vib.vshort();
			var url = $API.url();
			switch (type) {
				case 'created':
					url += 'tournaments.json?api_key=' + API_KEY;
					break;
				case 'subdomain':
					if (!subdomain) {
						$scope.error = errors.noSub;
						return false;
					}
					if (subdomain.search(/[^A-Za-z0-9\-]/) !== -1) {
						$scope.error = errors.subRegEx;
						return false;
					}
					url += 'tournaments.json?api_key=' + API_KEY + '&subdomain=' + subdomain;
					break;
				case 'single':
					var tournament;
					if (!isub) {
						if (!eurl) {
							$scope.error = errors.noUrl;
							return false;
						}

						if (eurl.search(/[^A-Za-z0-9\-]/) !== -1) {
							$scope.error = errors.urlRegEx;
							return false;
						}

						tournament = eurl;
					} else {
						if (!subdomain && !eurl) {
							$scope.error = errors.noSubUrl;
							return false;
						}

						if (!subdomain) {
							$scope.error = errors.noSub;
							return false;
						}

						if (subdomain.search(/[^A-Za-z0-9\-]/) !== -1) {
							$scope.error = errors.subRegEx;
							return false;
						}

						if (!eurl) {
							$scope.error = errors.noUrl;
							return false;
						}

						if (eurl.search(/[^A-Za-z0-9\_]/) !== -1) {
							$scope.error = errors.urlRegEx;
							return false;
						}

						tournament = subdomain + '-' + eurl;
					}
					url += 'tournaments/' + tournament + '.json?api_key=' + API_KEY;
					break;
				case 'favTour':
					url = 'favTour';
					break;
				case 'hisTour':
					url = 'hisTour';
					break;
				default:
					break;
			}
			$state.go('app.results', {
				url: url
			});
		};
	});
