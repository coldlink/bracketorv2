angular.module('challonger')
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
	});
