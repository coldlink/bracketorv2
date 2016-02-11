angular.module('challonger', ['ionic', 'challonger.controllers', 'ngCordova', 'angular-svg-round-progress'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

		.state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	})

	.state('app.about', {
		url: '/about',
		views: {
			'menuContent': {
				templateUrl: 'templates/about.html',
				controller: 'AboutCtrl'
			}
		}
	})

	.state('app.settings', {
		url: '/settings',
		views: {
			'menuContent': {
				templateUrl: 'templates/settings.html',
				controller: 'SettingsCtrl'
			}
		}
	})

	.state('app.browse', {
		url: '/browse',
		views: {
			'menuContent': {
				templateUrl: 'templates/browse.html',
				controller: 'BrowseCtrl'
			}
		}
	})

	.state('app.home', {
		url: '/home',
		views: {
			'menuContent': {
				templateUrl: 'templates/home.html',
				controller: 'HomeCtrl'
			}
		}
	})

	.state('app.results', {
		url: '/results/:url',
		views: {
			'menuContent': {
				templateUrl: 'templates/results.html',
				controller: 'ResultsCtrl'
			}
		}
	})

	.state('app.tournament', {
		url: '/tournament/:id',
		views: {
			'menuContent': {
				templateUrl: 'templates/tournament.html',
				controller: 'TournamentCtrl'
			}
		}
	})

	.state('app.create', {
		url: '/create',
		views: {
			'menuContent': {
				templateUrl: 'templates/create.html',
				controller: 'CreateCtrl'
			}
		}
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
})

.factory('$vib', function($cordovaVibration, $localStorage) {
	return {
		vshort: function() {
			if ($localStorage.get('enableVibration') === 'true') {
				$cordovaVibration.vibrate(25);
			}
		},
		short: function() {
			if ($localStorage.get('enableVibration') === 'true') {
				$cordovaVibration.vibrate(50);
			}
		},
		med: function() {
			if ($localStorage.get('enableVibration') === 'true') {
				$cordovaVibration.vibrate(100);
			}
		},
		long: function() {
			if ($localStorage.get('enableVibration') === 'true') {
				$cordovaVibration.vibrate(200);
			}
		},
		ms: function(time) {
			if ($localStorage.get('enableVibration') === 'true') {
				$cordovaVibration.vibrate(time);
			}
		}
	};
})

.factory('$localStorage', function($window) {
	return {
		set: function(k, v) {
			$window.localStorage[k] = v;
		},
		get: function(k, d) {
			return $window.localStorage[k] || d;
		},
		setObject: function(k, o) {
			$window.localStorage[k] = JSON.stringify(o);
		},
		getObject: function(k) {
			if ($window.localStorage[k]) {
				return JSON.parse($window.localStorage[k]);
			} else {
				return false;
			}
		}
	};
})

.factory('$connection', function($ionicPopup, $ionicHistory, $vib) {
	return {
		isConnected: function() {
			if (window.Connection) {
				if (navigator.connection.type === window.Connection.NONE) {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		},
		noInternet: function(scope) {
			$vib.med();
			scope.showAlert = function() {
				var alertPopup = $ionicPopup.alert({
					title: 'No internet connention detected.',
					template: 'No internet connection was detected, please check your internet connection and try again.'
				});
				alertPopup.then(function() {
					$ionicHistory.goBack();
				});
			};
			scope.showAlert();
		}
	};
})

.factory('$API', function() {
	return {
		url: function() {
			// return 'https://api.challonge.com/v1/';
			if (window.Connection) {
				return 'https://api.challonge.com/v1/';
			} else {
				return 'http://localhost:8100/api/';
			}
		}
	};
})

.factory('$toast', function($window) {
	return {
		lb: function(message, success, error) {
			$window.plugins.toast.showLongBottom(message, success, error);
		},
		lc: function(message, success, error) {
			$window.plugins.toast.showLongCenter(message, success, error);
		},
		lt: function(message, success, error) {
			$window.plugins.toast.showLongTop(message, success, error);
		},
		sb: function(message, success, error) {
			$window.plugins.toast.showShortBottom(message, success, error);
		},
		sc: function(message, success, error) {
			$window.plugins.toast.showShortCenter(message, success, error);
		},
		st: function(message, success, error) {
			$window.plugins.toast.showShortTop(message, success, error);
		},
		show: function(message, duration, position, success, error) {
			$window.plugins.toast.show(message, duration, position, success, error);
		}
	};
})

.factory('$alert', function($ionicPopup, $ionicHistory, $state, $vib) {
	return {
		generic: function(scope, title, msg) {
			scope.showAlert = function() {
				var alertPopup = $ionicPopup.alert({
					title: title,
					template: msg
				});
				alertPopup.then(function() {
					$vib.vshort();
					$ionicHistory.goBack();
				});
			};
			scope.showAlert();
		},
		genericNoBack: function(scope, title, msg) {
			scope.showAlert = function() {
				var alertPopup = $ionicPopup.alert({
					title: title,
					template: msg
				});
				alertPopup.then(function() {
					$vib.vshort();
					return false;
				});
			};
			scope.showAlert();
		},
		deleted: function(scope) {
			scope.showAlert = function() {
				var alertPopup = $ionicPopup.alert({
					title: 'Tournament Deleted',
					template: 'Tournament successfully deleted.'
				});
				alertPopup.then(function() {
					$vib.vshort();
					$ionicHistory.goBack();
				});
			};
			scope.showAlert();
		},
		matchSameScr: function(scope, title, subtitle, callback) {
			scope.showAlert = function() {
				var alertPopup = $ionicPopup.alert({
					title: title,
					subTitle: subtitle,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							$vib.vshort();
							callback(false);
							return false;
						}
					}, {
						text: 'Continue',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							callback(true);
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		},
		urlCopyOpen: function(scope, title, subtitle, url) {
			scope.showAlert = function() {
				scope.current = url;
				var alertPopup = $ionicPopup.alert({
					title: title,
					subTitle: subtitle,
					template: '<input class="dark" type="text" ng-disabled="true" ng-model="current"><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					scope: scope,
					buttons: [{
						text: 'Close',
						onTap: function(e) {
							$vib.vshort();
							return false;
						}
					}, {
						text: '<b>Open</b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							window.open(url, '_system', 'location=yes');
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		},
		newUrlCopyOpen: function(scope, title, subtitle, url, tid) {
			scope.showAlert = function() {
				scope.current = url;
				var alertPopup = $ionicPopup.alert({
					title: title,
					subTitle: subtitle,
					template: '<input class="dark" type="text" ng-disabled="true" ng-model="current"><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					scope: scope,
					buttons: [{
						text: 'Close',
						onTap: function(e) {
							$vib.vshort();
							return false;
						}
					}, {
						text: '<b>Open</b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							$state.go('app.tournament', {
								id: tid
							});
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		},
		input: function(scope, title, subtitle, value, callback) {
			scope.prevDef = false;
			scope.popErr = null;
			scope.showAlert = function() {
				// console.log(value);
				scope.current = value.value;
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<input class="dark" type="text" ng-model="current" ng-change="changeCurrent(current)"><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							$vib.vshort();
							callback();
							return false;
						}
					}, {
						text: '<b>Save</b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							if (!scope.current) {
								if (value.required) {
									scope.prevDef = true;
									e.preventDefault();
								} else {
									callback(scope.current);
									return false;
								}
							} else {
								callback(scope.current);
								return false;
							}
						}
					}]
				});
			};
			scope.showAlert();
		},
		selectState: function(scope, title, subtitle, value, callback) {
			scope.prevDef = false;
			scope.popErr = null;
			scope.showAlert = function() {
				// console.log(value);
				scope.initVal = value.value;
				scope.current = value.value;
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<ion-list><ion-radio ng-model="current" ng-value="\'start\'" ng-change="changeCurrent(current)" ng-disabled="initVal !== \'pending\'">Start Tournament</ion-radio><ion-radio ng-model="current" ng-value="\'finalize\'" ng-change="changeCurrent(current)" ng-disabled="initVal !== \'awaiting_review\'">Finalize Tournament</ion-radio><ion-radio ng-model="current" ng-value="\'reset\'" ng-change="changeCurrent(current)" ng-disabled="initVal === \'pending\'">Reset Tournament</ion-radio><ion-radio ng-model="current" ng-value="\'destroy\'" ng-change="changeCurrent(current)">Delete Tournament</ion-radio></ion-list><br><p ng-if="current === \'start\'">Start the tournament, opening the first round of matches for score reporting. The tournament must have at least 2 participants.</p><p ng-if="current === \'finalize\'">Finalize this tournament which has had all match scores submitted, rendering its results permanant.</p><p ng-if="current === \'reset\'">Reset a tournament, clearing all of its scores and attachments. You can then add/remove/edit participants before starting the tournament again.</p><p ng-if="current === \'destroy\'">Deletes a tournament along with all its records. The is no undo, so please use with care.</p><br ng-if="popErr"><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							$vib.vshort();
							callback();
							return false;
						}
					}, {
						text: '<b>Save</b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							if (!scope.current) {
								if (value.required) {
									scope.prevDef = true;
									e.preventDefault();
								} else {
									callback(scope.current);
									return false;
								}
							} else {
								callback(scope.current);
								return false;
							}
						}
					}]
				});
			};
			scope.showAlert();
		},
		selectType: function(scope, title, subtitle, value, callback) {
			scope.prevDef = false;
			scope.popErr = null;
			scope.showAlert = function() {
				// console.log(value);
				scope.current = value.value;
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<ion-list><ion-radio ng-model="current" ng-value="\'single elimination\'" ng-change="changeCurrent(current)">Single Elimination</ion-radio><ion-radio ng-model="current" ng-value="\'double elimination\'" ng-change="changeCurrent(current)">Double Elimination</ion-radio><ion-radio ng-model="current" ng-value="\'round robin\'" ng-change="changeCurrent(current)">Round Robin</ion-radio><ion-radio ng-model="current" ng-value="\'swiss\'" ng-change="changeCurrent(current)">Swiss Style</ion-radio></ion-list><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							$vib.vshort();
							callback();
							return false;
						}
					}, {
						text: '<b>Save</b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							if (!scope.current) {
								if (value.required) {
									scope.prevDef = true;
									e.preventDefault();
								} else {
									callback(scope.current);
									return false;
								}
							} else {
								callback(scope.current);
								return false;
							}
						}
					}]
				});
			};
			scope.showAlert();
		},
		inputArea: function(scope, title, subtitle, value, callback) {
			scope.prevDef = false;
			scope.popErr = null;
			scope.showAlert = function() {
				scope.current = value;
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<textarea class="dark" ng-model="current" ng-change="changeCurrent(current)"></textarea><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							$vib.vshort();
							callback();
							return false;
						}
					}, {
						text: '<b>Save</b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							callback(scope.current);
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		},
		signUpCap: function(scope, title, subtitle, value, callback) {
			scope.prevDef = false;
			scope.poperr = null;
			scope.showAlert = function() {
				scope.current = value.value;
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<input class="dark" type="number" ng-model="current" ng-change="changeCurrent(current)"><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							$vib.vshort();
							callback();
							return false;
						}
					}, {
						text: '<b>Save<b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							if (scope.current === 0) {
								scope.current = null;
							}
							callback(scope.current);
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		},
		openSignup: function(scope, title, subtitle, value, callback) {
			scope.prevDef = false;
			scope.poperr = null;
			scope.showAlert = function() {
				scope.current = value.value;
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<ion-list><ion-radio ng-model="current" ng-change="changeCurrent(current)" ng-value="true">Yes</ion-radio><ion-radio ng-model="current" ng-change="changeCurrent(current)" ng-value="false">No</ion-radio></ion-list>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							$vib.vshort();
							callback();
							return false;
						}
					}, {
						text: '<b>Save<b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							callback(scope.current);
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		},
		newParticipant: function(scope, title, callback) {
			scope.prevDef = false;
			scope.popErr = null;
			scope.showAlert = function() {
				scope.current = {};
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p><input class="dark" type="text" placeholder="Display Name" ng-model="current.participant.name" ng-change="changeCurrent(current)"><small>The name displayed in the bracket - not required if Email or Challonge Username is provided. Must be unique per tournament.</small><br><input class="dark" type="text" placeholder="Challonge Username" ng-model="current.participant.challonge_username" ng-change="changeCurrent(current)"><small>Provide this if the participant has a Challonge account. They will be invited to the tournament.</small><br><input class="dark" type="email" placeholder="Email" ng-model="current.participant.email" ng-change="changeCurrent(current)"><small>Providing this will first search for a matching Challonge account. If a Challonge user with that email is found, they will be invited to the tournament. Otherwise they will be invited by email to create a Challonge account.</small><br><input class="dark" type="number" placeholder="Seed" ng-model="current.participant.seed" ng-change="changeCurrent(current)"><small>The participants new seed. Must be between 1 and the total number of participants. Overwriting an existing seed will automatically bump other participants as you would expect. Leave blank to add participant as last seed.</small>',
					title: title,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							$vib.vshort();
							callback();
							return false;
						}
					}, {
						text: '<b>Add</b>',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							if (!scope.current.participant.name) {
								scope.prevDef = true;
								scope.popErr = "A display name is required.";
								e.preventDefault();
							}
							callback(scope.current);
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		},
		editParticipant: function(scope, value, callback) {
			scope.prevDef = false;
			scope.popErr = null;
			scope.showAlert = function() {
				scope.current = value;
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p><input class="dark" type="text" placeholder="Display Name" ng-model="current.participant.name" ng-change="changeCurrent(current)"><small>The name displayed in the bracket - not required if Email or Challonge Username is provided. Must be unique per tournament.</small><br><input class="dark" type="text" placeholder="Challonge Username" ng-model="current.participant.challonge_username" ng-change="changeCurrent(current)"><small>Provide this if the participant has a Challonge account. They will be invited to the tournament.</small><br><input class="dark" type="number" placeholder="Seed" ng-model="current.participant.seed" ng-change="changeCurrent(current)"><small>The participants new seed. Must be between 1 and the total number of participants. Overwriting an existing seed will automatically bump other participants as you would expect. Leave blank to add participant as last seed.</small>',
					title: 'Edit Participant',
					scope: scope,
					buttons: [{
						text: 'Close',
						onTap: function(e) {
							$vib.vshort();
							callback();
							return false;
						}
					}, {
						text: 'Delete',
						type: 'button-energized',
						onTap: function(e) {
							$vib.vshort();
							callback(null, true);
							return false;
						}
					}, {
						text: 'Edit',
						type: 'button-assertive',
						onTap: function(e) {
							$vib.vshort();
							callback(scope.current, false);
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		}
	};
})

.factory('$tournament', function($http, $alert, $API, $localStorage, $state, $ionicHistory, $vib, $toast) {
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
												break;
											case 'reset':
												$toast.sb('Tournament Reset!');
												break;
											case 'finalize':
												$toast.sb('Tournament Finalized!');
												break;
										}
										scope.tournament = response;
										scope.checkConnection();
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
