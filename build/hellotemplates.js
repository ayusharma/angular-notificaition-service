angular.module("hello").run(["$templateCache", function($templateCache) {$templateCache.put("hello.html","<h3>Hello World</h3>");}]);