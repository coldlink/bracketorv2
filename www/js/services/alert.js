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
			bulkParticipants: function(scope, title, callback) {
				scope.prevDef = false;
				scope.popErr = null;
				scope.showAlert = function() {
					scope.current = {};
					scope.changeCurrent = function(newCurrent) {
						scope.current = newCurrent;
					};
					var alertPopup = $ionicPopup.alert({
						template: '<p class="assertive" ng-if="prevDef">{{popErr || "An input is required."}}</p><textarea class="darki" placeholder="Participant Display Name" ng-model="current.participants" ng-change="changeCurrent(current)"></textarea><small>Enter each new participant on a new line.</small>',
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
								if (!scope.current.participants) {
									scope.prevDef = true;
									scope.popErr = "At least one participant is required.";
									e.preventDefault();
								}
								callback(scope.current.participants);
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
			},
			matchPopUp: function(scope, value, callback) {
				scope.prevDef = false;
				scope.popErr = null;
				scope.showAlert = function() {
					scope.current = value;
					scope.current.index = 0;
					scope.changeCurrent = function(newCurrent) {
						scope.current = newCurrent;
					};
					var alertPopup = $ionicPopup.show({
						template: '<div class="row row-center"><div class="col text-left"><button ng-if="current.index !== 0" class="button button-small button-clear button-light icon ion-chevron-left" ng-click="current.index = current.index - 1"></button></div><div class="col text-left"><button ng-if="current.index === current.length - 1 && current.index > 0" class="button button-small button-clear button-light icon ion-minus-circled" ng-click="current.index = current.index - 1; current.pop(); changeCurrent(current);"></button></div><div class="col text-center">{{\'Set \' + (current.index + 1)}}</div><div class="col text-right"><button ng-if="current.index === current.length - 1" class="button button-small button-clear button-light icon ion-plus-circled" ng-click="current.push({p1: 0, p2: 0}); current.index = current.index + 1; changeCurrent(current);"></button></div><div class="col text-right"><button ng-if="current.index !== current.length - 1 && current.length > 0" class="button button-small button-clear button-light icon ion-chevron-right" ng-click="current.index = current.index + 1"></button></div></div><div class="row row-center"><div class="col text-center item-text-wrap"><button class="button button-clear" ng-class="current.p1id === current.winner_id && current.state !== \'pending\' ? \'button-assertive\' : \'button-light\'" ng-click="current.winner_id = current.p1id; changeCurrent(current)">{{(current.p1id ? listParticipants[current.p1id].display_name : \'\')}}</button></div></div><div class="row row-center"><div class="col text-center"><button class="button button-small button-clear button-light icon ion-minus-circled" ng-click="current[current.index].p1 = current[current.index].p1 - 1; changeCurrent(current)"></button></div><div class="col text-center"><input style="text-align: center;" ng-model="current[current.index].p1" ng-change="changeCurrent(current)"></div><div class="col text-center"><button class="button button-small button-clear button-light icon ion-plus-circled" ng-click="current[current.index].p1 = current[current.index].p1 + 1; changeCurrent(current)"></button></div></div><hr><div class="row row-center"><div class="col text-center"><button class="button button-small button-clear button-light icon ion-minus-circled" ng-click="current[current.index].p2 = current[current.index].p2 - 1; changeCurrent(current)"></button></div><div class="col text-center"><input style="text-align: center;" ng-model="current[current.index].p2" ng-change="changeCurrent(current)"></div><div class="col text-center"><button class="button button-small button-clear button-light icon ion-plus-circled" ng-click="current[current.index].p2 = current[current.index].p2 + 1; changeCurrent(current)"></button></div></div><div class="row row-center"><div class="col text-center item-text-wrap"><button class="button button-clear" ng-class="current.p2id === current.winner_id && current.state !== \'pending\' ? \'button-assertive\' : \'button-light\'" ng-click="current.winner_id = current.p2id; changeCurrent(current)">{{(current.p2id ? listParticipants[current.p2id].display_name : \'\')}}</button></div></div><div class="row row-center"><div class="col text-center" ng-if="tournament.tournament.tournament_type === \'round robin\' || tournament.tournament.tournament_type === \'swiss\'"><button class="button button-clear" ng-class="current.winner_id === \'tie\' && current.state !== \'pending\' ? \'button-assertive\' : \'button-light\'" ng-click="current.winner_id = \'tie\'; changeCurrent(current)">Match Tie</button></div></div>',
						title: 'Edit Match - ' + scope.current.ident,
						subTitle: scope.current.state.charAt(0).toUpperCase() + scope.current.state.substr(1).toLowerCase(),
						scope: scope,
						buttons: [{
							text: 'Cancel',
							onTap: function(e) {
								$vib.vshort();
								callback();
								return false;
							}
						}, {
							text: 'Save',
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
