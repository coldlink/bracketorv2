angular.module('challonger.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});
})

.controller('HomeCtrl', function($scope) {
	//nothing here
})

.controller('BrowseCtrl', function($scope, $API, $localStorage, $state) {
	var API_KEY;
	$scope.API_KEY = true;
	$scope.$on('$ionicView.enter', function(e) {
		API_KEY = $localStorage.get('API_KEY');
		if (!API_KEY) {
			$scope.API_KEY = false;
		} else {
			$scope.API_KEY = true;
		}
	});

	$scope.open = function(type) {
		if ($scope.expand === type) {
			$scope.expand = false;
		} else {
			$scope.expand = type;
		}
	};

	$scope.click = function(type, subdomain, eurl, isub) {
		var url = $API.url();
		switch (type) {
			case 'created':
				url += 'tournaments.json?api_key=' + API_KEY;
				break;
			case 'subdomain':
				url += 'tournaments.json?api_key=' + API_KEY + '&subdomain=' + subdomain;
				break;
			case 'single':
				var tournament;
				if (!isub) {
					tournament = eurl;
				} else {
					tournament = subdomain + '-' + eurl;
				}
				url += 'tournaments/' + tournament + '.json?api_key=' + API_KEY;
				break;
			default:
				break;
		}
		$state.go('app.results', {
			url: url
		});
	};
})

.controller('ResultsCtrl', function($scope, $stateParams, $http, $connection, $state) {
	$scope.loading = true;
	$scope.tournaments = [];
	$scope.active = null;

	$scope.doRefresh = function() {
		$http.get($stateParams.url)
			.success(function(response) {
				console.log(response);
				$scope.tournaments = response;
			})
			.error(function(err) {
				console.log(err);
			})
			.finally(function() {
				$scope.loading = false;
				$scope.$broadcast('scroll.refreshComplete');
			});
	};

	$scope.open = function(id) {
		if ($scope.active !== id) {
			$scope.active = id;
		} else {
			$scope.active = null;
		}
	};

	$scope.typeToTwo = function(type) {
		switch (type) {
			case 'single elimination':
				return 'SE';
			case 'double elimination':
				return 'DE';
			case 'swiss':
				return 'SW';
			case 'round robin':
				return 'RR';
		}
	};

	$scope.stateToIcon = function(state) {
		switch (state) {
			case "pending":
				return 'ion-clock';
			case "underway":
				return 'ion-play';
			case "awaiting_review":
				return 'ion-alert-circled';
			case "complete":
				return 'ion-checkmark-circled';
		}
	};

	$scope.checkConnection = function() {
		if (!$connection.isConnected()) {
			$connection.noInternet($scope);
		} else {
			$scope.doRefresh();
		}
	};

	$scope.goToTournament = function(id) {
		$state.go('app.tournament', {
			id: id
		});
	};

	$scope.checkConnection();
})

.controller('TournamentCtrl', function($scope, $stateParams, $http, $connection, $API, $localStorage) {

	$scope.loading = true;
	var API_KEY = $localStorage.get('API_KEY');

	$scope.checkConnection = function() {
		if (!$connection.isConnected()) {
			$connection.noInternet($scope);
		} else {
			$scope.doRefresh();
		}
	};

	$scope.doRefresh = function () {
		$http.get($API.url() + 'tournaments/' + $stateParams.id +'.json?api_key=' + API_KEY + '&include_participants=1&include_matches=1')
		.success(function (response) {
			console.log(response);
			$scope.tournament = response;
		})
		.error(function (err) {
			console.log(err);
		})
		.finally(function() {
			$scope.listParticipants = {};
			for (var i = 0; i < $scope.tournament.tournament.participants.length; i++) {
				$scope.listParticipants[$scope.tournament.tournament.participants[i].participant.id] = $scope.tournament.tournament.participants[i].participant;
			}
			console.log($scope.listParticipants);
			$scope.loading = false;
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	$scope.state = function(state) {
		switch (state) {
			case "pending":
				return 'Pending';
			case "underway":
				return 'Underway';
			case "awaiting_review":
				return 'Awaiting Review';
			case "complete":
				return 'Complete';
		}
	};

	$scope.tournamentType = function (type) {
		switch (type) {
			case 'single elimination':
				return 'Single Elimination';
			case 'double elimination':
				return 'Double Elimination';
			case 'swiss':
				return 'Swiss Style';
			case 'round robin':
				return 'Round Robin';
		}
	};

	$scope.checkConnection();
})

.controller('SettingsCtrl', function($scope, $localStorage, $ionicModal) {
	if ($localStorage.get('API_KEY')) {
		$scope.API_KEY = $localStorage.get('API_KEY');
	}

	$scope.saveKey = function(v) {
		if (v.length === 0) {
			$scope.apiError = {
				message: 'API Key is required.'
			};
			return true;
		}
		if (v.length !== 40) {
			$scope.apiError = {
				message: 'API Key must be 40 characters long.'
			};
			return true;
		}
		if (v.search(/[a-zA-Z0-9]{40}/) === -1) {
			$scope.apiError = {
				message: 'API Key must contain only Alphanumeric characters (A-Z, a-z, 0-9).'
			};
		}
		$localStorage.set('API_KEY', v);
		$scope.apiError = {
			message: 'API Key Saved',
			type: 'positive'
		};
	};

	$ionicModal.fromTemplateUrl('setting-api-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});
});
