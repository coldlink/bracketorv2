angular.module('challonger.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});
})

.controller('HomeCtrl', function($scope, $ionicPlatform) {
	//Nothing here!
})

.controller('BrowseCtrl', function($scope, $API, $localStorage, $state) {
	var API_KEY;
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
		$scope.error = null;
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
})

.controller('ResultsCtrl', function($scope, $stateParams, $http, $connection, $state, $API, $localStorage, $alert) {
	$scope.loading = true;
	$scope.active = null;

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
					console.log(response);
					$scope.tournaments.push(response);
				})
				.error(function(err) {
					console.log(err);
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
						console.log(response);
						$scope.tournaments = response;
					})
					.error(function(err) {
						$alert.generic($scope, 'Error', err.errors[0]);
					})
					.finally(function() {
						$scope.loading = false;
						$scope.$broadcast('scroll.refreshComplete');
					});
		}
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

.controller('TournamentCtrl', function($scope, $stateParams, $http, $connection, $API, $localStorage, $ionicActionSheet, $cordovaToast, $ionicPlatform, $tournament, $q) {
	$scope.loading = true;
	$scope.editEnabled = false;
	var API_KEY = $localStorage.get('API_KEY');

	$scope.checkConnection = function() {
		if (!$connection.isConnected()) {
			$connection.noInternet($scope);
		} else {
			$scope.doRefresh();
		}
	};

	$scope.doRefresh = function() {
		$http.get($API.url() + 'tournaments/' + $stateParams.id + '.json?api_key=' + API_KEY + '&include_participants=1&include_matches=1')
			.success(function(response) {
				console.log(response);
				$scope.tournament = response;
			})
			.error(function(err) {
				console.log(err);
			})
			.finally(function() {
				$scope.listParticipants = {};
				for (var i = 0; i < $scope.tournament.tournament.participants.length; i++) {
					$scope.listParticipants[$scope.tournament.tournament.participants[i].participant.id] = $scope.tournament.tournament.participants[i].participant;
				}

				$scope.matchScores = {};
				$scope.tournament.tournament.matches.forEach(function(match) {
					var tempScr = match.match.scores_csv.split(',');
					$scope.matchScores[match.match.id] = [];
					for (var i = 0; i < tempScr.length; i++) {
						var tempSet = tempScr[i].split('-');
						tempSetObj = {
							p1: tempSet[0] ? tempSet[0] : 0,
							p2: tempSet[1] ? tempSet[1] : 0,
						};
						$scope.matchScores[match.match.id].push(tempSetObj);
						$scope.matchScores[match.match.id].dirty = false;
						$scope.matchScores[match.match.id].ident = match.match.identifier;
						$scope.matchScores[match.match.id].winner_id = match.match.winner_id;
					}
				});
				console.log($scope.listParticipants);
				console.log($scope.matchScores);

				var temp = [];
				if ($localStorage.getObject('hisTour')) {
					temp = $localStorage.getObject('hisTour');

					if (temp.indexOf($scope.tournament.tournament.id) !== -1) {
						temp.splice(temp.indexOf($scope.tournament.tournament.id), 1);
					} else {
						if (temp.length === 25) {
							temp.splice(0, 1);
						}
					}
				} else {
					if (temp.length === 25) {
						temp.splice(0, 1);
					}
				}
				temp.push($scope.tournament.tournament.id);
				$localStorage.setObject('hisTour', temp);

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

	$scope.tournamentType = function(type) {
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

	$scope.menu = function() {
		var buttons = [];

		if ($scope.editEnabled) {
			buttons.push({
				text: 'Disable Editing'
			});
		} else {
			buttons.push({
				text: 'Enable Editing'
			});
		}

		if ($localStorage.getObject('favTour')) {
			var temp = $localStorage.getObject('favTour');

			if (temp.indexOf($scope.tournament.tournament.id) !== -1) {
				buttons.push({
					text: 'Remove Bookmark'
				});
			} else {
				buttons.push({
					text: 'Add Bookmark'
				});
			}
		} else {
			buttons.push({
				text: 'Add Bookmark'
			});
		}

		var hideSheet = $ionicActionSheet.show({
			buttons: buttons,
			cancelText: 'Cancel',
			cancel: function() {
				hideSheet();
			},
			buttonClicked: function(index) {
				switch (index) {
					case 0:
						$scope.editEnabled = !$scope.editEnabled;
						return true;
					case 1:
						var temp = [];
						if ($localStorage.getObject('favTour')) {
							temp = $localStorage.getObject('favTour');

							if (temp.indexOf($scope.tournament.tournament.id) !== -1) {
								temp.splice(temp.indexOf($scope.tournament.tournament.id), 1);
							} else {
								temp.push($scope.tournament.tournament.id);
							}
						} else {
							temp.push($scope.tournament.tournament.id);
						}
						$localStorage.setObject('favTour', temp);
						return true;
					default:
						return false;
				}
			}
		});
	};

	$scope.scrBtn = {
		click: function(matchId, player, index) {
			if ($scope.editEnabled) {
				$scope.matchScores[matchId][index][player]++;
				$scope.matchScores[matchId].dirty = true;
			}
		},
		longClick: function(matchId, player, index) {
			if ($scope.editEnabled) {
				$scope.matchScores[matchId][index][player]--;
				$scope.matchScores[matchId].dirty = true;
			}
		},
		winSelect: function (matchId, winnerId) {
			$scope.matchScores[matchId].winner_id = winnerId;
		},
		addSet: function(matchId) {
			$scope.matchScores[matchId].push({
				p1: 0,
				p2: 0,
			});
			$scope.matchScores[matchId].dirty = true;
		},
		rmSet: function(matchId) {
			$scope.matchScores[matchId].pop();
			$scope.matchScores[matchId].dirty = true;
		},
		saveMatch: function (matchId) {
			var tmpScr = '';
			var sameScrFlag = false;
			for (var i = 0; i < $scope.matchScores[matchId].length; i++) {
				tmpScr += $scope.matchScores[matchId][i].p1 + '-' + $scope.matchScores[matchId][i].p2 + ',';

				if ($scope.matchScores[matchId][i].p1 === $scope.matchScores[matchId][i].p2) {
					sameScrFlag = true;
				}
			}
			tmpScr = tmpScr.slice(0, -1);
			console.log(tmpScr);

			if (sameScrFlag) {
				//alert for same score stuff
			}
		},
		edit: {
			value: function (tid, value) {
				$tournament.tournament.update.value(tid, value, $scope);
			},
			description: function (tid, description) {
				$tournament.tournament.update.description(tid, description, $scope);
			},
			state: function (tid, state) {
				$tournament.tournament.update.state(tid, state, $scope);
			},
			type: function (tid, type) {
				$tournament.tournament.update.type(tid, type, $scope);
			}
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
