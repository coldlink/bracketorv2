angular.module('challonger')
	.factory('$tournament', function($http, $alert, $API, $localStorage, $state, $ionicHistory, $vib, $toast, $window, $state) {
		return {
			participant: {
				create: function(tId, scope) {
					$alert.newParticipant(scope, 'Add Participant', function(newPart) {
						// console.log(newPart);
						if (!newPart) {
							return false;
						}
						return $http.post($API.url() + 'tournaments/' + tId + '/participants.json?api_key=' + $localStorage.get('API_KEY'), newPart)
							.success(function(response) {
								// console.log(response);
								$toast.sb('Participant Added!');
								scope.checkConnection();
							})
							.error(function(err) {
								$vib.med();
								scope.prevDef = true;
								scope.popErr = err.errors[0];
								scope.showAlert();
							});
					});
				},
				update: function(tId, pId, scope) {
					var part = {
						participant: {
							name: scope.listParticipants[pId].display_name,
							seed: scope.listParticipants[pId].seed
						}
					};
					if (scope.listParticipants[pId].challonge_username) {
						part.participant.challonge_username = scope.listParticipants[pId].challonge_username;
					}
					$alert.editParticipant(scope, part, function(newPart, delFlag) {
						// console.log(newPart);
						if (delFlag) {
							return $http.delete($API.url() + 'tournaments/' + tId + '/participants/' + pId + '.json?api_key=' + $localStorage.get('API_KEY'))
								.success(function(response) {
									// console.log(response);
									$toast.sb('Participant Deleted!');
									scope.checkConnection();
								})
								.error(function(err) {
									$vib.med();
									scope.prevDef = true;
									scope.popErr = err.errors[0];
									scope.showAlert();
								});
						}
						if (!newPart) {
							return false;
						}
						if (newPart.participant.challonge_username === part.participant.challonge_username) {
							newPart.participant.challonge_username = '';
						}
						return $http.put($API.url() + 'tournaments/' + tId + '/participants/' + pId + '.json?api_key=' + $localStorage.get('API_KEY'), newPart)
							.success(function(response) {
								// console.log(response);
								$toast.sb('Participant Updated!');
								scope.checkConnection();
							})
							.error(function(err) {
								$vib.med();
								scope.prevDef = true;
								scope.popErr = err.errors[0];
								scope.showAlert();
							});
					});
				}
			},
			tournament: {
				update: {
					value: function(tId, current, scope) {
						var title, subtitle;
						switch (current.type) {
							case 'name':
								title = 'Edit Tournament Name:';
								subtitle = 'Your event\'s name/title (Max: 60 characters)';
								break;
							case 'url':
								title = 'Edit Tournament URL:';
								subtitle = '(Letters, numbers, and underscores only)';
								break;
							case 'subdomain':
								title = 'Edit Tournament Organization:';
								subtitle = '(Requires write access to the specified organisation). Cannot remove organisation once it has been set.';
								break;
							case 'game_name':
								title = 'Edit Game Name:';
								subtitle = 'The input is the name of the game.';
								break;
						}
						$alert.input(scope, title, subtitle, current, function(newValue) {
							if (newValue === undefined) {
								// console.log('no value');
								return false;
							}
							// console.log(newValue);
							var data;
							switch (current.type) {
								case 'name':
									data = {
										name: newValue
									};
									break;
								case 'url':
									data = {
										url: newValue
									};
									break;
								case 'subdomain':
									data = {
										tournament: {
											subdomain: newValue
										}
									};
									break;
								case 'game_name':
									data = {
										tournament: {
											game_name: newValue
										}
									};
									break;
							}
							return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), data)
								.error(function(err) {
									$vib.med();
									// console.log(err);
									scope.prevDef = true;
									scope.popErr = err.errors[0];
									scope.showAlert();
								})
								.success(function(response) {
									// console.log(response);
									$toast.sb('Tournament Updated!');
									scope.checkConnection();
								});
						});
					},
					description: function(tId, description, scope) {
						$alert.inputArea(scope, 'Edit Tournament Description:', 'Description/instructions to be displayed above the bracket. Accepts HTML.', description, function(newDesc) {
							// console.log(newDesc);
							if (newDesc === undefined) {
								return false;
							}
							return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), {
									description: newDesc
								})
								.error(function(err) {
									$vib.med();
									// console.log(err);
									scope.prevDef = true;
									scope.popErr = err.errors[0];
									scope.showAlert();
								})
								.success(function(response) {
									// console.log(response);
									$toast.sb('Tournament Updated!');
									scope.tournament = response;
									scope.checkConnection();
								});
						});
					},
					state: function(tId, state, scope) {
						$alert.selectState(scope, 'Select Tournament State:', null, state, function(newState) {
							// console.log(newState);
							var eurl;
							switch (newState) {
								case 'start':
									eurl = $API.url() + 'tournaments/' + tId + '/start.json?api_key=' + $localStorage.get('API_KEY');
									break;
								case 'reset':
									eurl = $API.url() + 'tournaments/' + tId + '/reset.json?api_key=' + $localStorage.get('API_KEY');
									break;
								case 'finalize':
									eurl = $API.url() + 'tournaments/' + tId + '/finalize.json?api_key=' + $localStorage.get('API_KEY');
									break;
								case 'destroy':
									eurl = $API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY');
									break;
							}
							if (eurl !== undefined) {
								if (newState === 'destroy') {
									$http.delete(eurl)
										.success(function(response) {
											// console.log(response);
											$ionicHistory.nextViewOptions({
												disableBack: true
											});
											$state.go('app.home');
											$alert.deleted(scope);
										})
										.error(function(err) {
											$vib.med();
											// console.log(err);
											scope.prevDef = true;
											scope.popErr = err.errors[0];
											scope.showAlert();
										});
								} else {
									$http.post(eurl)
										.success(function(response) {
											// console.log(response);
											switch (newState) {
												case 'start':
													$toast.sb('Tournament Started!');
													scope.tournament = response;
													scope.checkConnection();
													break;
												case 'reset':
													$toast.sb('Tournament Reset!');
													scope.tournament = response;
													scope.checkConnection();
													break;
												case 'finalize':
													$toast.sb('Tournament Finalized!');
													$window.location.reload();
													$scope.checkConnection();
													break;
											}
										})
										.error(function(err) {
											if (err) {
												$vib.med();
												// console.log(err);
												scope.prevDef = true;
												scope.popErr = err.errors[0];
												scope.showAlert();
											}
										});
								}
							}
						});
					},
					type: function(tId, type, scope) {
						$alert.selectType(scope, 'Edit Tournament Type:', null, type, function(newType) {
							// console.log(newType);
							if (!newType) {
								return false;
							}
							return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), {
									tournament_type: newType
								})
								.error(function(err) {
									$vib.med();
									// console.log(err);
									scope.prevDef = true;
									scope.popErr = err.errors[0];
									scope.showAlert();
								})
								.success(function(response) {
									// console.log(response);
									$toast.sb('Tournament Updated!');
									scope.tournament = response;
									scope.checkConnection();
								});
						});
					},
					signUpCap: function(tId, cap, scope) {
						$alert.signUpCap(scope, 'Change Sign Up Cap', 'Maximum number of participants in the bracket. Set to 0 for no cap.', cap, function(newCap) {
							// console.log(newCap);
							if (newCap === undefined) {
								return false;
							}
							return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), {
									signup_cap: newCap
								})
								.error(function(err) {
									$vib.med();
									// console.log(err);
									scope.prevDef = true;
									scope.popErr = err.errors[0];
									scope.showAlert();
								})
								.success(function(response) {
									// console.log(response);
									$toast.sb('Tournament Updated!');
									scope.tournament = response;
									scope.checkConnection();
								});
						});
					},
					openSignup: function(tId, bool, scope) {
						$alert.openSignup(scope, 'Host Sign Up Page?', 'Have Challonge host a sign-up page? (Otherwise, you manually add all participants).', bool, function(newBool) {
							// console.log(newBool);
							if (newBool === undefined) {
								return false;
							}
							return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), {
									open_signup: newBool
								})
								.error(function(err) {
									$vib.med();
									// console.log(err);
									scope.prevDef = true;
									scope.popErr = err.errors[0];
									scope.showAlert();
								})
								.success(function(response) {
									// console.log(response);
									$toast.sb('Tournament Updated!');
									scope.tournament = response;
									scope.checkConnection();
								});
						});
					}
				}
			}
		};
	});
