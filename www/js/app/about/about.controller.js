(function () {
	'use strict';
	/**
	 * About Controller for state 'app.about'
	 * @class AboutCtrl
	 * @constructor
	 * @param $vib 					js/services/vib.js
	 */
	angular
		.module('challonger')
		.controller('AboutCtrl', AboutCtrl);

		function AboutCtrl($vib) {
			var vm = this;
			$vib.vshort();

			vm.openTwitter = openTwitter;
			vm.openWeb = openWeb;
			vm.openGit = openGit;

			function openTwitter() {
				$vib.vshort();
				window.open('https://www.twitter.com/coldlink_', '_system', 'location=yes');
			}

			function openWeb() {
				$vib.vshort();
				window.open('https://www.mkn.sh', '_system', 'location=yes');
			}

			function openGit() {
				$vib.vshort();
				window.open('https://github.com/coldlink/bracketorv2', '_system', 'location=yes');
			}
		}
})();
