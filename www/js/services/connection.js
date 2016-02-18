angular.module('challonger')
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
	});
