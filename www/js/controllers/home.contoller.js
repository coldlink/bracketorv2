angular.module('challonger')
	.controller('HomeCtrl', function($scope, $state) {
		$scope.open = function (state) {
			$state.go(state);
		};
	});
