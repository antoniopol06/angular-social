'use strict';/** * Buttons */var services = {    facebook: {        title: 'Facebook',        counterUrl: 'http://graph.facebook.com/fql?q=SELECT+total_count+FROM+link_stat+WHERE+url%3D%22{url}%22&callback=?',        convertNumber: function(data) {            return data.data[0].total_count;        },        popupUrl: 'http://www.facebook.com/sharer/sharer.php?u={url}',        popupWidth: 600,        popupHeight: 500    },    twitter: {        title: 'Twitter',        counterUrl: 'http://urls.api.twitter.com/1/urls/count.json?url={url}&callback=?',        convertNumber: function(data) {            return data.count;        },        popupUrl: 'http://twitter.com/intent/tweet?url={url}&text={title}',        popupWidth: 600,        popupHeight: 450,        click: function(options) {            // Add colon to improve readability            if (!/[\.:\-–—]\s*$/.test(options.pageTitle)) options.pageTitle += ':';            return true;        }    },    mailru: {        title: 'Mail.ru',        counterUrl: 'http://connect.mail.ru/share_count?url_list={url}&callback=1&func=?',        convertNumber: function(data) {            for (var url in data) if (data.hasOwnProperty(url)) {                return data[url].shares;            }        },        popupUrl: 'http://connect.mail.ru/share?share_url={url}&title={title}',        popupWidth: 550,        popupHeight: 360    },    vkontakte: {        title: 'Вконтакте',        counterUrl: 'http://vkontakte.ru/share.php?act=count&url={url}&index={index}',        counter: function(jsonUrl, deferred) {            var options = services.vkontakte;            if (!options._) {                options._ = [];                if (!window.VK) window.VK = {};                window.VK.Share = {                    count: function(idx, number) {                        options._[idx].resolve(number);                    }                };            }            var index = options._.length;            options._.push(deferred);            $.ajax({                url: makeUrl(jsonUrl, {index: index}),                dataType: 'jsonp'            });        },        popupUrl: 'http://vk.com/share.php?url={url}&title={title}',        popupWidth: 550,        popupHeight: 330    },    odnoklassniki: {        title: 'Одноклассники',        counterUrl: 'http://www.odnoklassniki.ru/dk?st.cmd=shareData&ref={url}&cb=?',        convertNumber: function(data) {            return data.count;        },        popupUrl: 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st._surl={url}',        popupWidth: 550,        popupHeight: 360    },    googleplus: {        title: 'Google+',        popupUrl: 'https://plus.google.com/share?url={url}',        popupWidth: 700,        popupHeight: 500    },    livejournal: {        title: 'LiveJournal',        click: function(e) {            var form = this._livejournalForm;            if (!form) {                var html = this.options.pageHtml                    .replace(/&/g, '&amp;')                    .replace(/"/g, '&quot;');                form = $(template(                    '<form action="http://www.livejournal.com/update.bml" method="post" target="_blank" accept-charset="UTF-8">' +                        '<input type="hidden" name="mode" value="full">' +                        '<input type="hidden" name="subject" value="{title}">' +                        '<input type="hidden" name="event" value="{html}">' +                    '</form>',                    {                        title: this.options.pageTitle,                        html: html                    }                ));                this.widget.append(form);                this._livejournalForm = form;            }            form.submit();        }    },    pinterest: {        title: 'Pinterest',        counterUrl: 'http://api.pinterest.com/v1/urls/count.json?url={url}&callback=?',        convertNumber: function(data) {            return data.count;        },        popupUrl: 'http://pinterest.com/pin/create/button/?url={url}&description={title}',        popupWidth: 630,        popupHeight: 270    }};function makeUrl(url, context) {	return template(url, context, encodeURIComponent);}function template(tmpl, context, filter) {	return tmpl.replace(/\{([^\}]+)\}/g, function(m, key) {		// If key don't exists in the context we should keep template tag as is		return key in context ? (filter ? filter(context[key]) : context[key]) : m;	});}angular.module("ngSocial", [])       .directive("ngSocialButtons", ["$compile", "$q", "$parse", "$http", function($compile, $q, $parse, $http) {    return {        restrict: "A",        scope: {            'url': '=',            'title': '=',            'description': '='        },        replace: true,        templateUrl: '/views/buttons.html',        controller: ["$scope", "$timeout", function($scope, $timeout) {            $scope.openPopup = function(url, params) {                var left = Math.round(screen.width/2 - params.width/2),                    top = 0;                if (screen.height > params.height) {                    top = Math.round(screen.height/3 - params.height/2);                }                var win = window.open(url, 'sl_' + this.service, 'left=' + left + ',top=' + top + ',' +                    'width=' + params.width + ',height=' + params.height + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');                if (win) {                    win.focus();                } else {                    location.href = url;                }            }            $scope.clickShare = function(e, button, options) {                if (e.shiftKey || e.ctrlKey) {                    return;                }                e.preventDefault();                var process = true;                if (angular.isFunction(options.click)) {                    process = options.click.call(this, options);                }                if (process) {                    var url = makeUrl(options.popupUrl, {                        url: $scope.url,                        title: $scope.title                    });                    $scope.openPopup(url, {                        width: options.popupWidth,                        height: options.popupHeight                    });                }            }            $scope.link = function(button, options) {                return makeUrl(options.popupUrl, {                        url: $scope.url,                        title: $scope.title                });            }        }],        link: function(scope, element, attrs) {            var buttons = {};            angular.forEach((attrs.ngSocialButtons || '').split(','), function(button) {                if (services[button]) {                    buttons[button] = services[button];                }            });            scope.buttons = buttons;        }    };  }]);
angular.module('ngSocial').run(['$templateCache', function ($templateCache) {
	$templateCache.put('/views/buttons.html', '<ul class="ng-social"> <li ng-repeat="(button, options) in buttons"> <a ng-href="{{link(button, options)}}" target="_blank" ng-click="clickShare($event, button, options)" class="ng-social-button" ng-class="\'ng-social-button_\' + button"> <span class="ng-social-icon"></span> <span class="ng-social-text">{{options.title}}</span> </a> </li> </ul>');
}]);