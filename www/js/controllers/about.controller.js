/**
 * About Controller for state 'app.about'
 * @class AboutCtrl
 * @constructor
 * @param $scope 				Angular scope
 * @param $vib 					js/services/vib.js
 */
angular.module('challonger')
	.controller('AboutCtrl', function($scope, $vib) {
		//short vibration
		$vib.vshort();

		//open my twitter
		$scope.openTwitter = function() {
			$vib.vshort();
			window.open('https://www.twitter.com/coldlink_', '_system', 'location=yes');
		};

		//open my website
		$scope.openWeb = function() {
			$vib.vshort();
			window.open('https://www.mkn.sh', '_system', 'location=yes');
		};

		//open project github
		$scope.openGit = function() {
			$vib.vshort();
			window.open('https://github.com/coldlink/bracketorv2', '_system', 'location=yes');
		};
	});
