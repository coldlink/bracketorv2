angular.module('challonger.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});
})

.controller('HomeCtrl', function($scope) {

})

.controller('BrowseCtrl', function($scope, gURL, $localStorage, $location) {
    var API_KEY;
	$scope.$on('$ionicView.enter', function(e) {
        $scope.API_KEY = true;
		API_KEY = $localStorage.get('API_KEY');
		if (!API_KEY) {
			$scope.API_KEY = false;
		} else {
			$scope.API_KEY = true;
		}
	});

	$scope.open = function(type) {
		if ($scope.expand === type) {
			$scope.expand = false;
		} else {
			$scope.expand = type;
		}
	};

	$scope.click = function(type, subdomain, eurl, isub) {
		var url = gURL.get();
		switch (type) {
			case 'created':
				url += 'tournaments.json?api_key=' + API_KEY;
				console.log(url);
				break;
			case 'subdomain':
				url += 'tournaments.json?api_key=' + API_KEY + '&subdomain=' + subdomain;
				console.log(url);
				break;
			case 'single':
                var tournament;
				if (!isub) {
                    tournament = eurl;
				} else {
				    tournament = subdomain + '-' + eurl;
				}
                url += 'tournaments/' + tournament + '.json?api_key=' + API_KEY;
                console.log(url);
				break;
			default:

		}
	};
})

.controller('PlaylistCtrl', function($scope, $stateParams, $http) {
	$http.get('https://api.challonge.com/v1/tournaments.json?api_key=W10UqbDCnmlXb0AH7k5qDz3D6UVAQXbXo2Kuvqw6')
		.success(function(response) {
			$scope.response = response;
		})
		.error(function(err) {
			$scope.response = err;
		});
})

.controller('SettingsCtrl', function($scope, $localStorage, $ionicModal) {
	if ($localStorage.get('API_KEY')) {
		$scope.API_KEY = $localStorage.get('API_KEY');
	}

	$scope.saveKey = function(v) {
		$localStorage.set('API_KEY', v);
	};

	$ionicModal.fromTemplateUrl('setting-api-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
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
