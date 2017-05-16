/**
 * Datashop Notification - Notificaion Service for Datashop.
 * @author Ayush Sharma
 * @version v0.0.1
 * @link 
 * @license MIT
 */
var app = angular.module('notification', []);

app.provider('Notification', function () {
  this.options = {
    message: 'This is default message',
    delay: undefined,
    templateUrl: 'notification.html',
    onClose: undefined,
    targetState: undefined,
    onSuccess: undefined,
    closeOnClick: false,
    notificationClass: 'neutral',
    container: 'body',
    buttonOneText: 'Button One',
    buttonTwoText: 'Button Two'
  };

  this.setOptions = function (options) {
    if (!angular.isObject(options)) {
      throw new Error('Options should be an object.');
    }
    this.options = angular.extend({}, this.options, options);
  };

  this.$get = ["$timeout", "$http", "$compile", "$templateCache", "$rootScope", "$sce", "$q", "$templateRequest", function ($timeout, $http, $compile, $templateCache,
    $rootScope, $sce, $q, $templateRequest) {
    //
    var options = this.options;
    var messageElements = [];

    var uuid = function () {
      var s4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      };
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };

    var notification = function (args) {
      var deferred = $q.defer();

      if (typeof args !== 'object') {
        throw new Error('Args: Object require');
      }

      args.scope = args.scope || $rootScope;
      args.template = args.templateUrl || options.templateUrl;
      args.delay = args.delay || options.delay;
      args.message = args.message || options.message;
      args.onClose = args.onClose || options.onClose;
      // For Confirm Box
      args.buttonOne = args.buttonOne || options.buttonOne;
      args.buttonTwo = args.buttonTwo || options.buttonTwo;
      args.buttonOneText = args.buttonOneText || options.buttonOneText;
      args.buttonTwoText = args.buttonTwoText || options.buttonTwoText;
      args.closeOnClick = (args.closeOnClick !== null && args.closeOnClick
         !== undefined) ? args.closeOnClick : options.closeOnClick;
      args.container = args.container || options.container;
      args.notificationClass = args.notificationClass || options.notificationClass;

      $templateRequest(args.template).then(function (template) {
        // Creating scope for the each notification template
        var scope = args.scope.$new();
        var templateElement = $compile(template)(scope);

        scope.message = $sce.trustAsHtml(args.message);
        scope.title = $sce.trustAsHtml(args.title);
        scope.delay = args.delay;
        scope.onClose = args.onClose;
        scope.targetState = args.targetState;
        scope.notificationClass = args.notificationClass;
        scope.buttonOne = args.buttonOne;
        scope.buttonTwo = args.buttonTwo;
        scope.uuid = 'notifiy-' + uuid();
        scope.buttonOneText = args.buttonOneText;
        scope.buttonTwoText = args.buttonTwoText;
        /**
         * closeEvent
         */
        scope.close = function () {
          if (scope.onClose) {
            scope.onClose(templateElement);
          }
          templateElement.remove();
          messageElements.splice(messageElements.indexOf(templateElement), 1);
          scope.$destroy();
        };

        // Close on click
        if (args.closeOnClick) {
          templateElement.bind('click', scope.close());
        }

        /**
         * For Confirm Box
         */
        if (args.buttonOne) {
          scope.buttonOne = args.buttonOne;
        }
        if (args.buttonTwo) {
          scope.buttonTwo = args.buttonTwo;
        }

        // Automatically hide the notification on the duration of delay.
        if (angular.isNumber(args.delay)) {
          $timeout(function () {
            scope.close();
          }, args.delay);
        }

        angular.element(document.querySelector(args.container))
        .prepend(templateElement);

        messageElements.push(templateElement);
        deferred.resolve(scope);
      }).catch(function (err) {
        throw new
        Error('Template (' + args.template + ') could not be loaded. ' + err);
      });
      return deferred.promise;
    };

    notification.alert = function (args) {
      return this(args);
    };

    notification.clearAll = function () {
      angular.forEach(messageElements, function (element) {
        element.remove();
      });
      messageElements = [];
    };

    notification.close = function (id) {
      document.querySelector('#' + id).remove();
    };

    return notification;
  }];
});

angular.module("notification").run(["$templateCache", function($templateCache) {$templateCache.put("notification.html","<div class=\"row notification alert-service\" id=\"{{uuid}}\"><div class=\"columns large-12 no-padding\"><div class=\"callout text-left no-border no-margin\" ng-class=\"notificationClass\"><h6><b ng-bind-html=\"title\"></b></h6><p ng-bind-html=\"message\" class=\"no-margin\"></p><button class=\"close-button\" type=\"button\" ng-click=\"close()\" ng-if=\"!buttonOne && !buttonTwo\"><span aria-hidden=\"true\">&times;</span></button></div><div class=\"columns large-12 no-padding\"><div class=\"button-group expanded small\"><a ng-if=\"buttonOne\" ng-class=\"notificationClass\" class=\"button\" ng-click=\"buttonOne(uuid)\">{{buttonOneText}}</a> <a ng-if=\"buttonTwo\" ng-class=\"notificationClass\" class=\"button\" ng-click=\"buttonTwo(uuid)\">{{buttonTwoText}}</a></div></div></div></div>");}]);