angular.module('challonger')
	.controller('CreateCtrl', function($scope, $localStorage, $API, $connection, $alert, $http, $vib, $http_defaults) {
		$vib.vshort();
		$scope.$on('$ionicView.enter', function(e) {
			API_KEY = $localStorage.get('API_KEY');
			if (!API_KEY) {
				$scope.API_KEY = false;
			} else {
				$scope.API_KEY = true;
			}
		});

		$scope.save = function(tournament) {
			// console.log(tournament);
			$vib.vshort();
			if (!$connection.isConnected()) {
				return $alert.genericNoBack($scope, 'No internet connention detected.', 'No internet connection was detected, please check your internet connection and try again.');
			} else {
				// console.log($API.url() + 'tournaments.json?api_key=' + $localStorage.get('API_KEY'));
				$http.post($API.url() + 'tournaments.json?api_key=' + $localStorage.get('API_KEY'), tournament, $http_defaults)
					.success(function(response) {
						// console.log(response);
						$vib.short();
						return $alert.newUrlCopyOpen($scope, 'New Tournament', 'Tournament successfully created. Copy the url from the input below, or open the tournament by clicking \'Open\'.', response.tournament.full_challonge_url, response.tournament.id);
					})
					.error(function(err) {
						// console.log(err);
						$vib.med();
						return $alert.genericNoBack($scope, 'Error', err.errors[0]);
					});
			}
		};
	});
