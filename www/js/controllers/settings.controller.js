angular.module('challonger')
	.controller('SettingsCtrl', function($scope, $localStorage, $ionicModal, $vib, $toast) {
		$vib.vshort();
		if ($localStorage.get('API_KEY')) {
			$scope.API_KEY = $localStorage.get('API_KEY');
		}

		if ($localStorage.get('enableVibration')) {
			if ($localStorage.get('enableVibration') === 'true') {
				$scope.enableVibration = true;
			} else {
				$scope.enableVibration = false;
			}
		} else {
			$scope.enableVibration = true;
		}

		$scope.openChallonge = function() {
			$vib.vshort();
			window.open('https://challonge.com/settings/developer', '_system', 'location=yes');
		};

		$scope.saveKey = function(v) {
			$vib.vshort();
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

		$scope.changeVibration = function(enabled) {
			$vib.short();
			if (enabled) {
				$toast.sb('Vibration Enabled');
				$localStorage.set('enableVibration', 'true');
			} else {
				$toast.sb('Vibration Disabled');
				$localStorage.set('enableVibration', 'false');
			}
		};

		$ionicModal.fromTemplateUrl('setting-api-modal.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
		});
		$scope.openModal = function() {
			$vib.vshort();
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
