angular.module('challonger')
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
