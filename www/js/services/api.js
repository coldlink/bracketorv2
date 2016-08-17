angular.module('challonger')
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
	});
