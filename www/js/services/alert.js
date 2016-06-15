angular.module('challonger')
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
						template: '<ion-list><ion-radio ng-model="current" ng-value="\'start\'" ng-change="changeCurrent(current)" ng-disabled="initVal !== \'pending\'">Start Tournament</ion-radio><ion-radio ng-model="current" ng-value="\'finalize\'" ng-change="changeCurrent(current)" ng-disabled="initVal !== \'awaiting_review\'">Finalize Tournament</ion-radio><ion-radio ng-model="current" ng-value="\'reset\'" ng-change="changeCurrent(current)" ng-disabled="initVal === \'pending\'">Reset Tournament</ion-radio><ion-radio ng-model="current" ng-value="\'destroy\'" ng-change="changeCurrent(current)">Delete Tournament</ion-radio></ion-list><br><p ng-if="current === \'start\'">Start the tournament, opening the first round of matches for score reporting. The tournament must have at least 2 participants.</p><p ng-if="current === \'finalize\'">Finalize this tournament which has had all match scores submitted, rendering its results permanant. <br><b>Note:</b> This will refresh the tournament, and disable editing. You can enable editing again through the menu.</p><p ng-if="current === \'reset\'">Reset a tournament, clearing all of its scores and attachments. You can then add/remove/edit participants before starting the tournament again.</p><p ng-if="current === \'destroy\'">Deletes a tournament along with all its records. The is no undo, so please use with care.</p><br ng-if="popErr"><p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p>',
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
	});
