/**
 * Tournament Controller for state 'app.tournament'
 * @class TournamentCtrl
 * @constructor
 * @param $scope 						Angular scope
 * @param $stateParams  		ui.router to get url query parameters
 * @param $http							Angular $http service
 * @param $connection				js/services/connection.js
 * @param $API 							js/services/api.js
 * @param $localStorage 		js/services/localStorage.js
 * @param $ionicActionSheet	http://ionicframework.com/docs/api/service/$ionicActionSheet/
 * @param $ionicPlatform		http://ionicframework.com/docs/api/service/$ionicPlatform/
 * @param $tournament				js/services/tournaments
 * @param $q								angular promises
 * @param $alert						js/services/alert.js
 * @param $vib 							js/services/vib.js
 * @param $toast 						js/services/toast.js
 */
angular.module('challonger')
	.controller('TournamentCtrl', function($scope, $stateParams, $http, $connection, $API, $localStorage, $ionicActionSheet, $ionicPlatform, $tournament, $q, $alert, $vib, $toast, $sce, $document, $http_defaults, $interval, $chunk) {
		var API_KEY;
		var autorefresh;
		$vib.vshort();
		//on view enter set loading, disable editing, get api_key, and start refresh by checking connection
		$scope.$on('$ionicView.enter', function() {
			$scope.loading = true;
			$scope.editEnabled = false;
			API_KEY = $localStorage.get('API_KEY');
			autorefresh = $interval(function() {
				$scope.checkConnection();
			}, parseInt($localStorage.get('autorefresh')));
			$scope.checkConnection();
		});

		//on leave remove tournament object, participants, and scores
		$scope.$on('$ionicView.leave', function() {
			$scope.tournament = null;
			$scope.listParticipants = {};
			$scope.matchScores = {};
			$interval.cancel(autorefresh);
		});

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

		$scope.getLiveImage = function() {
			$http.get($scope.tournament.tournament.live_image_url, $http_defaults)
				.success(function(response) {
					var temp = angular.element(response)[2];
					window.testingtemp = temp;
					temp.removeChild(temp.childNodes[5]);
					temp.removeChild(temp.childNodes[3]);
					temp.childNodes[5].setAttribute('y', 0);

					if ($scope.tournament.tournament.state !== 'pending') {
						for (var i = 0; i < temp.getElementsByClassName('match').length; i++) {
							if ($scope.matchScores[temp.getElementsByClassName('match').item(i).getAttribute('data-match-id').toString()].state !== 'pending') {
								temp.getElementsByClassName('match').item(i).addEventListener('click', function() {
									if ($scope.editEnabled) {
										var matchid = this.getAttribute('data-match-id').toString();
										var scrPopUpCb = function(value) {
											if (value) {
												$scope.matchScores[matchid] = value;
												$scope.scrBtn.saveMatch(matchid);
											}
										};
										$alert.matchPopUp($scope, $scope.matchScores[matchid], scrPopUpCb);
									}
								});
							}
						}
					}

					for (var i = 0; i < temp.getElementsByTagName('image').length; i++) {
						if (temp.getElementsByTagName('image')[i].getAttribute('xlink:href') && temp.getElementsByTagName('image')[i].getAttribute('xlink:href').indexOf('//') === 0) {
							temp.getElementsByTagName('image')[i].setAttribute('xlink:href', 'https:' + temp.getElementsByTagName('image')[i].getAttribute('xlink:href'));
						}
					}

					$scope.liveImage = temp;
				})
				.error(function(err) {
					$vib.med();
					console.log(err);
					$alert.generic($scope, 'Error', err.toString());
				});
		};

		$scope.doRefresh = function() {
			//get tournament from api using the id
			$http.get($API.url() + 'tournaments/' + $stateParams.id + '.json?api_key=' + API_KEY + '&include_participants=1&include_matches=1', $http_defaults)
				.success(function(response) {
					//on success set tournament object as response
					$scope.tournament = response;

					//sort matches
					$scope.tournament.tournament.matches = $scope.tournament.tournament.matches.sort(function(a, b) {
							switch (a.match.state) {
								case 'open':
									if (a.match.state === b.match.state) {
										return 0;
									} else {
										return -1;
									}
								case 'pending':
									if (a.match.state === b.match.state) {
										return 0;
									} else if (b.match.state === 'open') {
										return 1;
									} else {
										return -1;
									}
								case 'complete':
									if (a.match.state === b.match.state) {
										return 0;
									} else {
										return 1;
									}
							}
					});

					console.log($scope.tournament.tournament.matches);
						//save chunked match data
					$scope.matches = $chunk($scope.tournament.tournament.matches, 2);
					console.log($scope.matches);

					//remove participants from tournament object, and set to another object, used for editing and participants without screwing up the tournament object, key is participant id
					$scope.listParticipants = {};
					for (var i = 0; i < $scope.tournament.tournament.participants.length; i++) {
						$scope.listParticipants[$scope.tournament.tournament.participants[i].participant.id] = $scope.tournament.tournament.participants[i].participant;
					}

					//split the matches into a new object with the match id as key
					$scope.matchScores = {};
					$scope.tournament.tournament.matches.forEach(function(match) {
						//split scores from csv to p1 score and p2 score object, used to split out sets
						var tempScr = match.match.scores_csv.split(',');
						$scope.matchScores[match.match.id] = [];
						for (var i = 0; i < tempScr.length; i++) {
							var tempSet = tempScr[i].split('-');
							tempSetObj = {
								p1: tempSet[0] ? parseInt(tempSet[0]) : 0,
								p2: tempSet[1] ? parseInt(tempSet[1]) : 0,
							};
							$scope.matchScores[match.match.id].push(tempSetObj);
							//dirty checks if edited
							$scope.matchScores[match.match.id].dirty = false;
							//set current state
							$scope.matchScores[match.match.id].state = match.match.state;
							//set identifier
							$scope.matchScores[match.match.id].ident = match.match.identifier;
							//set winner id
							$scope.matchScores[match.match.id].winner_id = match.match.winner_id;
							//set p1 id - used to check for the participant in the listParticipants object
							$scope.matchScores[match.match.id].p1id = match.match.player1_id;
							//set p2 id
							$scope.matchScores[match.match.id].p2id = match.match.player2_id;
						}
					});

					console.log($scope.matchScores)

					//add the tourmanet to the history
					var temp = [];
					//check if a tournament history object exists in local storage
					if ($localStorage.getObject('hisTour')) {
						temp = $localStorage.getObject('hisTour');

						//if tournament found, remove from history (to push to front of history obejct)
						if (temp.indexOf($scope.tournament.tournament.id) !== -1) {
							temp.splice(temp.indexOf($scope.tournament.tournament.id), 1);
						} else {
							//if longer that 25 history tournaments splice the oldest added one
							if (temp.length === 25) {
								temp.splice(0, 1);
							}
						}
					} else {
						if (temp.length === 25) {
							temp.splice(0, 1);
						}
					}
					//push the tourmanet to the history object, and add to local storage
					temp.push($scope.tournament.tournament.id);
					$localStorage.setObject('hisTour', temp);

					//set refresh complete
					$scope.loading = false;
					$scope.$broadcast('scroll.refreshComplete');

					if ($scope.tournament.tournament.participants_count > 1) {
						$scope.getLiveImage();
					}
				})
				.error(function(err) {
					//thow error if something goes wrond
					$vib.med();
					$alert.generic($scope, 'Error', err.errors[0]);
				});
		};

		//convert tournament state from api to application format
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

		//convert tournament type from api to application format
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

		//create the action sheet menu using $ionicActionSheet
		$scope.menu = function() {
			var buttons = [];

			//check if editing enabled/disabled, and push correct button to buttons array
			//e.g if editing is enabled, push the "Disable Editing" button so user can disable editing.
			if ($scope.editEnabled) {
				buttons.push({
					text: 'Disable Editing'
				});
			} else {
				buttons.push({
					text: 'Enable Editing'
				});
			}

			//check if tournament is in tournament history, and push the correct button (add bookmark/remove bookmark)
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

			//alternate refresh button, can also refresh by pulling down
			buttons.push({
				text: 'Refresh Tournament'
			});

			//set button functions
			var hideSheet = $ionicActionSheet.show({
				buttons: buttons,
				//on cancel close sheet
				cancelText: 'Cancel',
				cancel: function() {
					$vib.vshort();
					hideSheet();
				},
				buttonClicked: function(index) {
					$vib.vshort();
					switch (index) {
						//enable/diable editing
						case 0:
							$scope.editEnabled = !$scope.editEnabled;
							if ($scope.editEnabled) {
								$toast.st('Editing Enabled!');
							} else {
								$toast.st('Editing Disabled!');
							}
							return true;
							//add/remove bookmark
						case 1:
							var temp = [];
							//check for bookmarked tournament object
							if ($localStorage.getObject('favTour')) {
								//if found set temp as the object
								temp = $localStorage.getObject('favTour');

								//if bookmark exists (using tournament id), remove (splice) the tourmanet from the array, otherwise push the tournament id to the array
								if (temp.indexOf($scope.tournament.tournament.id) !== -1) {
									temp.splice(temp.indexOf($scope.tournament.tournament.id), 1);
									$toast.st('Bookmark Removed!');
								} else {
									temp.push($scope.tournament.tournament.id);
									$toast.st('Bookmark Added!');
								}
							} else {
								//if no bookmark object found also push tournmaent to array
								temp.push($scope.tournament.tournament.id);
								$toast.st('Bookmark Added!');
							}
							//set tournament object
							$localStorage.setObject('favTour', temp);
							return true;
						case 2:
							//refresh the tournament by first checking the connection
							$scope.checkConnection();
							$toast.sb('Tournament Refreshing...');
							return true;
						default:
							return false;
					}
				}
			});
		};

		//match button clicks
		$scope.scrBtn = {
			editMatchOpen: function (matchId) {
				var scrPopUpCb = function(value) {
					if (value) {
						$scope.matchScores[matchId] = value;
						$scope.scrBtn.saveMatch(matchId);
					}
				};
				$alert.matchPopUp($scope, $scope.matchScores[matchId], scrPopUpCb);
			},
			//+1 to score, used to be short click, now + button press
			click: function(matchId, player, index) {
				if ($scope.editEnabled) {
					$vib.vshort();
					//check if tournament is completed, alert if true
					if ($scope.tournament.tournament.state === 'complete') {
						$alert.genericNoBack($scope, 'Error: Tournament Complete', 'Cannot change score of a completed tournament.');
						return false;
					}
					//+1 to player, set match to dirty
					$scope.matchScores[matchId][index][player]++;
					$scope.matchScores[matchId].dirty = true;
				}
			},
			//-1 to score, used to be long click, now - button press
			longClick: function(matchId, player, index) {
				if ($scope.editEnabled) {
					$vib.vshort();
					//check if tournament is completed, alert if true
					if ($scope.tournament.tournament.state === 'complete') {
						$alert.genericNoBack($scope, 'Error: Tournament Complete', 'Cannot change score of a completed tournament.');
						return false;
					}
					//-1 to player, set match to dirty
					$scope.matchScores[matchId][index][player]--;
					$scope.matchScores[matchId].dirty = true;
				}
			},
			//select match winner, also required
			winSelect: function(matchId, winnerId) {
				if ($scope.editEnabled) {
					$vib.vshort();
					//check if tournament is completed, alert if true
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
									}, $http_defaults)
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


					$scope.tournament.tournament.participants.splice(fromIndex, 1);
					$scope.tournament.tournament.participants.splice(toIndex, 0, participant);

					$http.put($API.url() + 'tournaments/' + tid + '/participants/' + pid + '.json?api_key=' + $localStorage.get('API_KEY'), {
							participant: {
								seed: toIndex + 1
							}
						}, $http_defaults)
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
				},
				bulk: function(tid) {
					$vib.vshort();
					$tournament.participant.bulk(tid, $scope);
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

		$scope.calcTotalScore = function (matchScores) {
			var total = [0, 0]
			matchScores.forEach(function (elem) {
				total[0] += elem.p1;
				total[1] += elem.p2
			})
			return total;
		}
	})
	.directive('liveImage', function() {
		return {
			restrict: 'EA',
			link: function(scope, elem, attrs) {
				scope.$watch('liveImage', function(val) {
					if (elem.children()) {
						elem.children().remove();
					}
					elem.append(val);
				});
			}
		};
	});
