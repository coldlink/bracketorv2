angular.module('challonger')
	.controller('AboutCtrl', function($scope, $vib) {
		$vib.vshort();
		$scope.openTwitter = function() {
			$vib.vshort();
			window.open('https://www.twitter.com/coldlink_', '_system', 'location=yes');
		};

		$scope.openWeb = function() {
			$vib.vshort();
			window.open('https://www.mkn.sh', '_system', 'location=yes');
		};

		$scope.openGit = function() {
			$vib.vshort();
			window.open('https://github.com/coldlink/bracketorv2', '_system', 'location=yes');
		};
	});
