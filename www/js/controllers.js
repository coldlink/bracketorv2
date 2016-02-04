angular.module('challonger.controllers', [])

.controller('AppCtrl', function() {
	//nothing here :3
})

.controller('AboutCtrl', function ($scope) {
	$scope.openTwitter = function () {
		window.open('https://www.twitter.com/coldlink_', '_system', 'location=yes');
	};

	$scope.openWeb = function () {
		window.open('https://www.mkn.sh', '_system', 'location=yes');
	};

	$scope.openGit = function () {
		window.open('https://github.com/coldlink/challongerv2', '_system', 'location=yes');
	};
})

.controller('HomeCtrl', function() {
	//Nothing here :3
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
		console.log($stateParams);
		console.log($stateParams.url);
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

	$scope.createdAtOrder = function (tournament) {
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
})

.controller('TournamentCtrl', function($scope, $stateParams, $http, $connection, $API, $localStorage, $ionicActionSheet, $ionicPlatform, $tournament, $q, $alert) {
	var API_KEY;
	$scope.$on('$ionicView.enter', function() {
		$scope.loading = true;
		$scope.editEnabled = false;
		API_KEY = $localStorage.get('API_KEY');
		$scope.checkConnection();
	});

	$scope.$on('$ionicView.leave', function() {
		$scope.tournament = null;
		$scope.listParticipants = {};
		$scope.matchScores = {};
	});

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
				// console.log(response);
				$scope.tournament = response;
			})
			.error(function(err) {
				$alert.generic($scope, 'Error', err.errors[0]);
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
						$scope.matchScores[match.match.id].state = match.match.state;
						$scope.matchScores[match.match.id].ident = match.match.identifier;
						$scope.matchScores[match.match.id].winner_id = match.match.winner_id;
						$scope.matchScores[match.match.id].p1id = match.match.player1_id;
						$scope.matchScores[match.match.id].p2id = match.match.player2_id;
					}
				});
				// console.log($scope.listParticipants);
				// console.log($scope.matchScores);

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
				if ($scope.tournament.tournament.state === 'complete') {
					$alert.genericNoBack($scope, 'Error: Tournament Complete', 'Cannot change score of a completed tournament.');
					return false;
				}
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
		winSelect: function(matchId, winnerId) {
			if ($scope.editEnabled) {
				if ($scope.tournament.tournament.state === 'complete') {
					$alert.genericNoBack($scope, 'Error: Tournament Complete', 'Cannot change winner of a completed tournament.');
					return false;
				}
				$scope.matchScores[matchId].winner_id = winnerId;
				$scope.matchScores[matchId].dirty = true;
			}
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
		saveMatch: function(matchId, completeFlag, sameScoreFlag, playerFlag) {
			var tmpScr = '';
			// console.log($scope.matchScores[matchId]);

			if ($scope.matchScores[matchId].state === 'complete' && !completeFlag) {
				$alert.matchSameScr($scope, 'Warning: Match Complete', 'Changing the result of this match may cause other matches to be reset, possibly losing progress in the tournament. Are you sure you want to continue?', function(arg) {
					if (!arg) {
						return false;
					} else {
						completeFlag = true;
						return $scope.scrBtn.saveMatch(matchId, completeFlag, sameScoreFlag, playerFlag);
					}
				});
			} else {
				if (!$scope.matchScores[matchId].winner_id) {
					$alert.genericNoBack($scope, 'Error: No Winner Selected', 'A winner must be selected before a match can be saved. Select a winner by tapping on the winners name.');
					return false;
				}

				var p1scr = 0;
				var p2scr = 0;
				for (var i = 0; i < $scope.matchScores[matchId].length; i++) {
					tmpScr += $scope.matchScores[matchId][i].p1 + '-' + $scope.matchScores[matchId][i].p2 + ',';

					if ($scope.matchScores[matchId][i].p1 > $scope.matchScores[matchId][i].p2) {
						p1scr++;
					}

					if ($scope.matchScores[matchId][i].p2 > $scope.matchScores[matchId][i].p1) {
						p2scr++;
					}
				}

				if (p1scr === p2scr && !sameScoreFlag) {
					$alert.matchSameScr($scope, 'Warning: Same Score', 'Both players have the same overall score. If this is correct then click \'Continue\' to proceed, else click \'Cancel\' to cancel saving and check.', function(arg) {
						if (!arg) {
							return false;
						} else {
							sameScoreFlag = true;
							return $scope.scrBtn.saveMatch(matchId, completeFlag, sameScoreFlag, playerFlag);
						}
					});
				} else {
					if (p1scr > p2scr && $scope.matchScores[matchId].winner_id === $scope.matchScores[matchId].p2id && !playerFlag) {
						$alert.matchSameScr($scope, 'Warning: Possible Mismatched Winner', 'The winner you selected does not match the result of the scores you entered (assuming high score wins). Click \'Cancel\' to make changes or \'Continue\' to submit as-is.', function(arg) {
							if (!arg) {
								return false;
							} else {
								playerFlag = true;
								return $scope.scrBtn.saveMatch(matchId, completeFlag, sameScoreFlag, playerFlag);
							}
						});
					} else {
						if (p2scr > p1scr && $scope.matchScores[matchId].winner_id === $scope.matchScores[matchId].p1id && !playerFlag) {
							$alert.matchSameScr($scope, 'Warning: Possible Mismatched Winner', 'The winner you selected does not match the result of the scores you entered (assuming high score wins). Click \'Cancel\' to make changes or \'Continue\' to submit as-is.', function(arg) {
								if (!arg) {
									return false;
								} else {
									playerFlag = true;
									return $scope.scrBtn.saveMatch(matchId, completeFlag, sameScoreFlag, playerFlag);
								}
							});
						} else {
							tmpScr = tmpScr.slice(0, -1);
							// console.log(tmpScr);
							$http.put($API.url() + 'tournaments/' + $scope.tournament.tournament.id + '/matches/' + matchId + '.json?api_key=' + $localStorage.get('API_KEY'), {
									match: {
										scores_csv: tmpScr,
										winner_id: $scope.matchScores[matchId].winner_id
									}
								})
								.success(function() {
									$scope.checkConnection();
								})
								.error(function(err) {
									$alert.genericNoBack($scope, 'Error', err.errors[0]);
								});
						}
					}
				}
			}
		},
		urlCopyOpen: function(url) {
			$alert.urlCopyOpen($scope, 'Challonge URL', 'Copy the Challonge URL to the clipboard, or open in a browser.', url);
		},
		signUpUrlCopyOpen: function(url) {
			$alert.urlCopyOpen($scope, 'Sign Up URL', 'Copy the sign up URL to the clipboard, or open in a browser.', url);
		},
		imgCopyOpen: function(url) {
			$alert.urlCopyOpen($scope, 'Live Image URL', 'Copy the live image URL to the clipboard, or open in a browser.', url);
		},
		edit: {
			value: function(tid, value) {
				$tournament.tournament.update.value(tid, value, $scope);
			},
			description: function(tid, description) {
				$tournament.tournament.update.description(tid, description, $scope);
			},
			state: function(tid, state) {
				$tournament.tournament.update.state(tid, state, $scope);
			},
			type: function(tid, type) {
				$tournament.tournament.update.type(tid, type, $scope);
			},
			signUpCap: function(tid, cap) {
				$tournament.tournament.update.signUpCap(tid, cap, $scope);
			},
			openSignup: function(tid, bool) {
				$tournament.tournament.update.openSignup(tid, bool, $scope);
			},
			reorder: function(tid, participant, pid, fromIndex, toIndex) {
				if (!$scope.editEnabled) {
					return false;
				}
				// console.log(pid);
				// console.log(tid);

				$scope.tournament.tournament.participants.splice(fromIndex, 1);
				$scope.tournament.tournament.participants.splice(toIndex, 0, participant);

				$http.put($API.url() + 'tournaments/' + tid + '/participants/' + pid + '.json?api_key=' + $localStorage.get('API_KEY'), {
						participant: {
							seed: toIndex + 1
						}
					})
					.success(function(response) {
						// console.log(response);
						$scope.checkConnection();
					})
					.error(function(err) {
						$alert.generic($scope, 'Error', err.errors[0]);
					});
			},
			participant: function(tid, pid) {
				if (!$scope.editEnabled) {
					return false;
				}
				$tournament.participant.update(tid, pid, $scope);
			}
		},
		create: {
			participant: function(tid) {
				$tournament.participant.create(tid, $scope);
			}
		}
	};

	$scope.getImage = function(url) {
		if (!url) {
			return 'https://i2.wp.com/challonge.com/assets/gravatar.png';
		}
		if (url.substring(0, 2) === '//') {
			return 'https:' + url;
		}
		return url;
	};

	$scope.sortMatches = function(match) {
		switch (match.match.state) {
			case 'open':
				return 1;
			case 'pending':
				return 2;
			case 'complete':
				return 3;
		}
	};
})

.controller('CreateCtrl', function($scope, $localStorage, $API, $connection, $alert, $http) {
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
		if (!$connection.isConnected()) {
			return $alert.genericNoBack($scope, 'No internet connention detected.', 'No internet connection was detected, please check your internet connection and try again.');
		} else {
			// console.log($API.url() + 'tournaments.json?api_key=' + $localStorage.get('API_KEY'));
			$http.post($API.url() + 'tournaments.json?api_key=' + $localStorage.get('API_KEY'), tournament)
				.success(function(response) {
					// console.log(response);
					return $alert.newUrlCopyOpen($scope, 'New Tournament', 'Tournament successfully created. Copy the url from the input below, or open the tournament by clicking \'Open\'.', response.tournament.full_challonge_url, response.tournament.id);
				})
				.error(function(err) {
					// console.log(err);
					return $alert.genericNoBack($scope, 'Error', err.errors[0]);
				});
		}
	};
})

.controller('SettingsCtrl', function($scope, $localStorage, $ionicModal) {
	if ($localStorage.get('API_KEY')) {
		$scope.API_KEY = $localStorage.get('API_KEY');
	}

	$scope.openChallonge = function () {
		window.open('https://challonge.com/settings/developer', '_system', 'location=yes');
	};

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
