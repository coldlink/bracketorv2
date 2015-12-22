// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('challonger', ['ionic', 'challonger.controllers', 'ngCordova'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
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
				templateUrl: 'templates/about.html'
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
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
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

.factory('$connection', function($ionicPopup, $ionicHistory) {
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
			if (window.Connection) {
				return 'https://api.challonge.com/v1/';
			} else {
				return 'http://localhost:8100/api/';
			}
		}
	};
})

.factory('$alert', function($ionicPopup, $ionicHistory) {
	return {
		generic: function(scope, title, msg) {
			scope.showAlert = function() {
				var alertPopup = $ionicPopup.alert({
					title: title,
					template: msg
				});
				alertPopup.then(function() {
					$ionicHistory.goBack();
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
					$ionicHistory.goBack();
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
					template: '<input type="text" ng-disabled="true" ng-model="current">',
					scope: scope,
					buttons: [{
						text: 'Close',
						onTap: function (e) {
							return false;
						}
					}, {
						text: '<b>Copy</b>',
						type: 'button-positive',
						onTap: function (e) {
							//implement copy
							return false;
						}
					}, {
						text: '<b>Open</b>',
						type: 'button-positive',
						onTap: function (e) {
							//implement open
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
				console.log(value);
				scope.current = value.value;
				scope.changeCurrent = function(newCurrent) {
					scope.current = newCurrent;
				};
				var alertPopup = $ionicPopup.alert({
					template: '<input type="text" ng-model="current" ng-change="changeCurrent(current)"><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							callback();
							return false;
						}
					}, {
						text: '<b>Save</b>',
						type: 'button-positive',
						onTap: function(e) {
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
				console.log(value);
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
							callback();
							return false;
						}
					}, {
						text: '<b>Save</b>',
						type: 'button-positive',
						onTap: function(e) {
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
				console.log(value);
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
							callback();
							return false;
						}
					}, {
						text: '<b>Save</b>',
						type: 'button-positive',
						onTap: function(e) {
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
					template: '<textarea ng-model="current" ng-change="changeCurrent(current)"></textarea><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							callback();
							return false;
						}
					}, {
						text: '<b>Save</b>',
						type: 'button-positive',
						onTap: function(e) {
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
					template: '<input type="number" ng-model="current" ng-change="changeCurrent(current)"><br><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
					title: title,
					subTitle: subtitle,
					scope: scope,
					buttons: [{
						text: 'Cancel',
						onTap: function(e) {
							callback();
							return false;
						}
					}, {
						text: '<b>Save<b>',
						type: 'button-positive',
						onTap: function(e) {
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
							callback();
							return false;
						}
					}, {
						text: '<b>Save<b>',
						type: 'button-positive',
						onTap: function(e) {
							callback(scope.current);
							return false;
						}
					}]
				});
			};
			scope.showAlert();
		}
	};
})

.factory('$tournament', function($http, $alert, $API, $localStorage, $state, $ionicHistory) {
	return {
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
							console.log('no value');
							return false;
						}
						console.log(newValue);
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
								console.log(err);
								scope.prevDef = true;
								scope.popErr = err.errors[0];
								scope.showAlert();
							})
							.success(function(response) {
								console.log(response);
								scope.checkConnection();
							});
					});
				},
				description: function(tId, description, scope) {
					$alert.inputArea(scope, 'Edit Tournament Description:', 'Description/instructions to be displayed above the bracket. Accepts HTML.', description, function(newDesc) {
						console.log(newDesc);
						if (newDesc) {
							return false;
						}
						return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), {
								description: newDesc
							})
							.error(function(err) {
								console.log(err);
								scope.prevDef = true;
								scope.popErr = err.errors[0];
								scope.showAlert();
							})
							.success(function(response) {
								console.log(response);
								scope.tournament = response;
								scope.checkConnection();
							});
					});
				},
				state: function(tId, state, scope) {
					$alert.selectState(scope, 'Select Tournament State:', null, state, function(newState) {
						console.log(newState);
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
										console.log(response);
										$ionicHistory.nextViewOptions({
											disableBack: true
										});
										$state.go('app.home');
										$alert.deleted(scope);
									})
									.error(function(err) {
										console.log(err);
										scope.prevDef = true;
										scope.popErr = err.errors[0];
										scope.showAlert();
									});
							} else {
								$http.post(eurl)
									.success(function(response) {
										console.log(response);
										scope.tournament = response;
										scope.checkConnection();
									})
									.error(function(err) {
										if (err) {
											console.log(err);
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
						console.log(newType);
						if (!newType) {
							return false;
						}
						return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), {
								tournament_type: newType
							})
							.error(function(err) {
								console.log(err);
								scope.prevDef = true;
								scope.popErr = err.errors[0];
								scope.showAlert();
							})
							.success(function(response) {
								console.log(response);
								scope.tournament = response;
								scope.checkConnection();
							});
					});
				},
				signUpCap: function(tId, cap, scope) {
					$alert.signUpCap(scope, 'Change Sign Up Cap', 'Maximum number of participants in the bracket. Set to 0 for no cap.', cap, function(newCap) {
						console.log(newCap);
						if (newCap === undefined) {
							return false;
						}
						return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), {
								signup_cap: newCap
							})
							.error(function(err) {
								console.log(err);
								scope.prevDef = true;
								scope.popErr = err.errors[0];
								scope.showAlert();
							})
							.success(function(response) {
								console.log(response);
								scope.tournament = response;
								scope.checkConnection();
							});
					});
				},
				openSignup: function(tId, bool, scope) {
					$alert.openSignup(scope, 'Host Sign Up Page?', 'Have Challonge host a sign-up page? (Otherwise, you manually add all participants).', bool, function(newBool) {
						console.log(newBool);
						if (newBool === undefined) {
							return false;
						}
						return $http.put($API.url() + 'tournaments/' + tId + '.json?api_key=' + $localStorage.get('API_KEY'), {
								open_signup: newBool
							})
							.error(function(err) {
								console.log(err);
								scope.prevDef = true;
								scope.popErr = err.errors[0];
								scope.showAlert();
							})
							.success(function(response) {
								console.log(response);
								scope.tournament = response;
								scope.checkConnection();
							});
					});
				}
			}
		}
	};
});
