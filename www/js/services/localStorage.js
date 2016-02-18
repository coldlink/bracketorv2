angular.module('challonger')
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
	});
