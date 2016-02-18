angular.module('challonger')
	.controller('TournamentCtrl', function($scope, $stateParams, $http, $connection, $API, $localStorage, $ionicActionSheet, $ionicPlatform, $tournament, $q, $alert, $vib, $toast) {
		var API_KEY;
		$vib.vshort();
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
					$vib.med();
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

			buttons.push({
				text: 'Refresh Tournament'
			});

			var hideSheet = $ionicActionSheet.show({
				buttons: buttons,
				cancelText: 'Cancel',
				cancel: function() {
					$vib.vshort();
					hideSheet();
				},
				buttonClicked: function(index) {
					$vib.vshort();
					switch (index) {
						case 0:
							$scope.editEnabled = !$scope.editEnabled;
							if ($scope.editEnabled) {
								$toast.st('Editing Enabled!');
							} else {
								$toast.st('Editing Disabled!');
							}
							return true;
						case 1:
							var temp = [];
							if ($localStorage.getObject('favTour')) {
								temp = $localStorage.getObject('favTour');

								if (temp.indexOf($scope.tournament.tournament.id) !== -1) {
									temp.splice(temp.indexOf($scope.tournament.tournament.id), 1);
									$toast.st('Bookmark Removed!');
								} else {
									temp.push($scope.tournament.tournament.id);
									$toast.st('Bookmark Added!');
								}
							} else {
								temp.push($scope.tournament.tournament.id);
								$toast.st('Bookmark Added!');
							}
							$localStorage.setObject('favTour', temp);
							return true;
						case 2:
							$scope.checkConnection();
							$toast.sb('Tournament Refreshing...');
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
					$vib.vshort();
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
					$vib.vshort();
					if ($scope.tournament.tournament.state === 'complete') {
						$alert.genericNoBack($scope, 'Error: Tournament Complete', 'Cannot change score of a completed tournament.');
						return false;
					}
					$scope.matchScores[matchId][index][player]--;
					$scope.matchScores[matchId].dirty = true;
				}
			},
			winSelect: function(matchId, winnerId) {
				if ($scope.editEnabled) {
					$vib.vshort();
					if ($scope.tournament.tournament.state === 'complete') {
						$alert.genericNoBack($scope, 'Error: Tournament Complete', 'Cannot change winner of a completed tournament.');
						return false;
					}
					$scope.matchScores[matchId].winner_id = winnerId;
					$scope.matchScores[matchId].dirty = true;
				}
			},
			addSet: function(matchId) {
				$vib.vshort();
				$scope.matchScores[matchId].push({
					p1: 0,
					p2: 0,
				});
				$scope.matchScores[matchId].dirty = true;
			},
			rmSet: function(matchId) {
				$vib.vshort();
				$scope.matchScores[matchId].pop();
				$scope.matchScores[matchId].dirty = true;
			},
			saveMatch: function(matchId, completeFlag, sameScoreFlag, playerFlag) {
				$vib.vshort();
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
										$toast.sb('Match Saved!');
										$scope.checkConnection();
									})
									.error(function(err) {
										$vib.med();
										$alert.genericNoBack($scope, 'Error', err.errors[0]);
									});
							}
						}
					}
				}
			},
			urlCopyOpen: function(url) {
				$vib.vshort();
				$alert.urlCopyOpen($scope, 'Challonge URL', 'Copy the Challonge URL to the clipboard, or open in a browser.', url);
			},
			signUpUrlCopyOpen: function(url) {
				$vib.vshort();
				$alert.urlCopyOpen($scope, 'Sign Up URL', 'Copy the sign up URL to the clipboard, or open in a browser.', url);
			},
			imgCopyOpen: function(url) {
				$vib.vshort();
				$alert.urlCopyOpen($scope, 'Live Image URL', 'Copy the live image URL to the clipboard, or open in a browser.', url);
			},
			edit: {
				value: function(tid, value) {
					$vib.vshort();
					$tournament.tournament.update.value(tid, value, $scope);
				},
				description: function(tid, description) {
					$vib.vshort();
					$tournament.tournament.update.description(tid, description, $scope);
				},
				state: function(tid, state) {
					$vib.vshort();
					$tournament.tournament.update.state(tid, state, $scope);
				},
				type: function(tid, type) {
					$vib.vshort();
					$tournament.tournament.update.type(tid, type, $scope);
				},
				signUpCap: function(tid, cap) {
					$vib.vshort();
					$tournament.tournament.update.signUpCap(tid, cap, $scope);
				},
				openSignup: function(tid, bool) {
					$vib.vshort();
					$tournament.tournament.update.openSignup(tid, bool, $scope);
				},
				reorder: function(tid, participant, pid, fromIndex, toIndex) {
					if (!$scope.editEnabled) {
						return false;
					}
					$vib.vshort();
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
					$vib.vshort();
					$tournament.participant.update(tid, pid, $scope);
				}
			},
			create: {
				participant: function(tid) {
					$vib.vshort();
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
