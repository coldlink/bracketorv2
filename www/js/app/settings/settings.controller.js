(function() {
	'use strict';

	angular
		.module('challonger')
		.controller('SettingsCtrl', function($scope, $localStorage, $ionicModal, $vib, $toast, $sce) {
			//binables
			var vm = this;
			vm.apiError = ''; //error holder for api key

			vm.changeVibration = changeVibration;
			vm.getChallongeSettingsDeveloperUrl = getChallongeSettingsDeveloperUrl;
			vm.openChallonge = openChallonge;
			vm.openChallongeNewUser = openChallongeNewUser;
			vm.saveKey = saveKey;

			//on load
			$vib.vshort();
			if ($localStorage.get('API_KEY')) {
				vm.API_KEY = $localStorage.get('API_KEY');
			}

			if ($localStorage.get('enableVibration') && $localStorage.get('enableVibration') === 'true') {
				vm.enableVibration = false;
			} else {
				vm.enableVibration = true;
			}

			//methods
			function changeVibration(v) {
				$vib.short();
				if (v) {
					$toast.sb('Vibration Enabled');
					$localStorage.set('enableVibration', 'true');
				} else {
					$toast.sb('Vibration Disabled');
					$localStorage.set('enableVibration', 'false');
				}
			}

			function getChallongeSettingsDeveloperUrl() {
				return $sce.trustAsResourceUrl('https://challonge.com/settings/developer');
			}

			function openChallonge() {
				$vib.vshort();
				window.open('https://challonge.com/settings/developer', '_system', 'location=yes');
			}

			function openChallongeNewUser() {
				$vib.vshort();
				window.open('https://challonge.com/users/new', '_system', 'location=yes');
			}

			function saveKey(v) {
				$vib.vshort();
				if (!v.length) {
					vm.apiError = {
						message: 'API Key is required.'
					};
					return 1;
				}
				if (v.length !== 40) {
					vm.apiError = {
						message: 'API Key must be 40 characters long.'
					};
					return 1;
				}
				if (v.search(/[a-zA-Z0-9]{40}/) === -1) {
					vm.apiError = {
						message: 'API Key must contain only Alphanumeric characters (A-Z, a-z, 0-9).'
					};
				}
				$localStorage.set('API_KEY', v);
				vm.apiError = {
					message: 'API Key Saved',
					type: 'positive'
				};
			}


			//modal configuration
			$ionicModal.fromTemplateUrl('setting-api-modal.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				console.log($scope);
				vm.modal = modal;
			});
			vm.openModal = function() {
				$vib.vshort();
				vm.modal.show();
			};
			vm.closeModal = function() {
				vm.modal.hide();
			};
			//Cleanup the modal when we're done with it!
			$scope.$on('$destroy', function() {
				vm.modal.remove();
			});
		});
})();
