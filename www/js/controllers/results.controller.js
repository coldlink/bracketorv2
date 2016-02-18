angular.module('challonger')
	.controller('ResultsCtrl', function($scope, $stateParams, $http, $connection, $state, $API, $localStorage, $alert, $vib) {
		$vib.vshort();
		var alerts = {
			noFavTour: {
				title: 'No Bookmarks',
				msg: 'No bookmarked tournaments were found. A tournament can be added to the bookmarks by viewing the tournament and selecting \'Add Bookmark\' from the menu.'
			},
			noHisTour: {
				title: 'No History',
				msg: 'No previously viewed tournaments were found. Browse tournaments for them to be automatically added to the history. Max 25 tournaments.'
			}
		};

		function getTbyId(i, ids, cb) {
			if (i < ids.length) {
				$http.get($API.url() + 'tournaments/' + ids[i] + '.json?api_key=' + $localStorage.get('API_KEY'))
					.success(function(response) {
						// console.log(response);
						$scope.tournaments.push(response);
					})
					.error(function(err) {
						$vib.med();
						if ($stateParams.url !== 'favTour' && $stateParams.url !== 'hisTour') {
							$alert.generic($scope, 'Error', err.errors[0]);
						}
					})
					.finally(function() {
						return getTbyId(i + 1, ids, cb);
					});
			} else {
				if (cb) {
					cb();
				}
			}
		}

		$scope.doRefresh = function() {
			$scope.tournaments = [];
			switch ($stateParams.url) {
				case 'favTour':
					if ($localStorage.getObject('favTour')) {
						var temp = $localStorage.getObject('favTour');
						if (temp.length === 0) {
							$alert.generic($scope, alerts.noFavTour.title, alerts.noFavTour.msg);
						} else {
							getTbyId(0, temp, function() {
								$scope.loading = false;
								$scope.$broadcast('scroll.refreshComplete');
							});
						}
					} else {
						$alert.generic($scope, alerts.noFavTour.title, alerts.noFavTour.msg);
					}
					break;
				case 'hisTour':
					if ($localStorage.getObject('hisTour')) {
						var temp = $localStorage.getObject('hisTour');
						if (temp.length === 0) {
							$alert.generic($scope, alerts.noHisTour.title, alerts.noHisTour.msg);
						} else {
							getTbyId(0, temp, function() {
								$scope.loading = false;
								$scope.$broadcast('scroll.refreshComplete');
							});
						}
					} else {
						$alert.generic($scope, alerts.noHisTour.title, alerts.noHisTour.msg);
					}
					break;
				default:
					$http.get($stateParams.url)
						.success(function(response) {
							if (!Array.isArray(response)) {
								$scope.tournaments = [response];
							} else {
								$scope.tournaments = response;
							}
						})
						.error(function(err) {
							$vib.med();
							$alert.generic($scope, 'Error', err.errors[0]);
						})
						.finally(function() {
							$scope.loading = false;
							$scope.$broadcast('scroll.refreshComplete');
						});
			}
		};

		$scope.open = function(id) {
			$vib.vshort();
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

		$scope.createdAtOrder = function(tournament) {
			return new Date(tournament.tournament.created_at);
		};

		$scope.$on('$ionicView.enter', function() {
			$scope.loading = true;
			$scope.active = null;
			$scope.checkConnection();
		});

		$scope.$on('$ionicView.leave', function() {
			$scope.tournaments = [];
		});
	});
