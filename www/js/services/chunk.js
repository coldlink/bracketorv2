angular.module('challonger')
	.factory('$chunk', function() {
		function chunk(arr, size) {
			var newArr = [];
			for (var i = 0; i < arr.length; i += size) {
				newArr.push(arr.slice(i, i + size));
			}
			return newArr;
		}

		return chunk;
	})
