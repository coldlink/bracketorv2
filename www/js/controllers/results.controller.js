/**
 * Results Controller for state 'app.results'
 * @class ResultsCtrl
 * @constructor
 * @param $scope 				Angular scope
 * @param $stateParams  ui.router to get url query parameters
 * @param $http					Angular $http service
 * @param $connection		js/services/connection.js
 * @param $state 				ui.router state provider
 * @param $API 					js/services/api.js
 * @param $localStorage js/services/localStorage.js
 * @param $alert				js/services/alert.js
 * @param $vib 					js/services/vib.js
 */
angular.module('challonger')
	.controller('ResultsCtrl', function($scope, $stateParams, $http, $connection, $state, $API, $localStorage, $alert, $vib) {
		$vib.vshort();
		//set alert parameters for no favourite tournaments, and no history
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

		//get a list of tournaments from and array of tournament ids from the challonge api which were saved in the localStorage as part of the favourite tournaments and tournament history
		// TODO: Remove horrible callback code with an async based approach
		function getTbyId(i, ids, cb) {
			if (i < ids.length) {
				//get tournament by given id
				$http.get($API.url() + 'tournaments/' + ids[i] + '.json?api_key=' + $localStorage.get('API_KEY'))
					.success(function(response) {
						//if found push tournament to the list of tournaments
						$scope.tournaments.push(response);
					})
					.error(function(err) {
						//alert user on error if an error occured when retrieving the tournament
						$vib.med();
						if ($stateParams.url !== 'favTour' && $stateParams.url !== 'hisTour') {
							$alert.generic($scope, 'Error', err.errors[0]);
						}
					})
					.finally(function() {
						//get next tournament
						return getTbyId(i + 1, ids, cb);
					});
			} else {
				// callback on all tournaments get
				if (cb) {
					cb();
				}
			}
		}

		//refresh the list of tournaments
		$scope.doRefresh = function() {
			//set empty tournament array
			$scope.tournaments = [];
			//check the url for the parameters
			switch ($stateParams.url) {
				//if favourite tournament flag
				case 'favTour':
					//check localStorage for favTour object
					if ($localStorage.getObject('favTour')) {
						//if found set a temp variable as the return object
						var temp = $localStorage.getObject('favTour');
						//on length 0 (no tournament ids) throw an alert
						if (temp.length === 0) {
							$alert.generic($scope, alerts.noFavTour.title, alerts.noFavTour.msg);
						} else {
							//otherwise get the tournaments by id
							// TODO: Remove horrible callback loop
							getTbyId(0, temp, function() {
								$scope.loading = false;
								$scope.$broadcast('scroll.refreshComplete');
							});
						}
					} else {
						//if favTour object not found, throw an no favourite tournament alert
						$alert.generic($scope, alerts.noFavTour.title, alerts.noFavTour.msg);
					}
					break;
				//same as favTour but for tournament view history
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
				//if no flag for favTour or hisTour, get the tournament from the challonge api using the given request url
				default:
					$http.get($stateParams.url)
						.success(function(response) {
							//if only 1 tournament found, an array is not sent, so put the response inside an array, otherwise just set to tournament Array
							//fixes issue with getting single result tournaments
							if (!Array.isArray(response)) {
								$scope.tournaments = [response];
							} else {
								$scope.tournaments = response;
							}
						})
						.error(function(err) {
							//throw alert on any error with the returned error message
							$vib.med();
							$alert.generic($scope, 'Error', err.errors[0]);
						})
						.finally(function() {
							//set loading false (hide the spinner) and broadcast that the refresh is complete
							$scope.loading = false;
							$scope.$broadcast('scroll.refreshComplete');
						});
			}
		};

		//open the tournament div in the html to present more information, and close any others, performed using the tournament id
		$scope.open = function(id) {
			$vib.vshort();
			if ($scope.active !== id) {
				$scope.active = id;
			} else {
				$scope.active = null;
			}
		};

		//function to convert a returned tournament type from the api to a 2 digit shorthand displayed on the tournament dropdown
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

		//function to convert a returned tournament state from the api to an ionicon icon representing that state
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

		//check for internet connection
		$scope.checkConnection = function() {
			//throw alert if no connection detected
			if (!$connection.isConnected()) {
				$connection.noInternet($scope);
			} else {
				//if connection found, continue to refresh
				$scope.doRefresh();
			}
		};

		//go to the tournament view (app.tournament) passing the tournament id as the url paramerter
		$scope.goToTournament = function(id) {
			$state.go('app.tournament', {
				id: id
			});
		};

		//filter to list tournaments in order of date created
		$scope.createdAtOrder = function(tournament) {
			return new Date(tournament.tournament.created_at);
		};

		//on view enter, set loading, close any current tournaments, and check for connection. checkConnection() will automatically call doRefresh() after.
		$scope.$on('$ionicView.enter', function() {
			$scope.loading = true;
			$scope.active = null;
			$scope.checkConnection();
		});

		//on view leave, set empty tournaments array
		$scope.$on('$ionicView.leave', function() {
			$scope.tournaments = [];
		});
	});
