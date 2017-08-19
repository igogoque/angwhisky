//инициализация приложухи
var angwhisky = angular.module('angwhisky', ['ngRoute']);

//конфигурация приложухи и роутинг
angwhisky.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: true
    });
    $routeProvider
//вывод всех продуктов
    .when('/home/', {
        templateUrl: 'template/home.html',
        controller: 'ProdController'
    })
//вывод всех продуктов одной категории (с сортировкой)
    .when('/cat/:id/:soart', {
        templateUrl: 'template/cat.html',
        controller: 'CatProdController'
    })
//вывод одного продукта
    .when('/prod/:id', {
        templateUrl: 'template/prod.html',
        controller: 'OneProdController'
    })
    .when('/login', {
        templateUrl: 'template/login.html',
        controller: 'LoginController'
    })
    .when('/logout', {
        templateUrl: 'template/home.html',
        controller: 'LogoutController'
    })
    .when('/register', {
        templateUrl: 'template/register.html',
        controller: 'RegisterController'
    })
//вывод всех итемов корзины
    .when('/bag', {
        templateUrl: 'template/bag.html',
        controller: 'BagController'
    })
//удаление итема корзины
    .when('/delbag/:id', {
        templateUrl: 'template/bag.html',
        controller: 'DelBagController'
    })
//добавление итема корзины
    .when('/addbag/:id', {
        templateUrl: 'template/addbag.html',
        controller: 'AddBagController'
    })
//оформление заказа
    .when('/dobuy', {
        templateUrl: 'template/buystatus.html',
        controller: 'BuyController'
    })
    .when('/waitconfirm', {
        templateUrl: 'template/waitconfirm.html',
    })
    .when('/regdone', {
        templateUrl: 'template/regdone.html',
    })
//подтверждение регистрации пользователя
    .when('/confirmreg/:userid', {
        templateUrl: 'template/confirmreg.html',
        controller: 'ConfirmRegController'
    })
//отправка уведомления о сбросе пароля
    .when('/forgotreq', {
      templateUrl: 'template/forgotreq.html',
      controller: 'ForgotReqController'
    })
//сброс пароля
    .when('/forgotconfirm/:userid', {
        templateUrl: 'template/forgotconfirm.html',
        controller: 'ForgotConfirmController'
    })
    .otherwise({ redirectTo: '/home/' });

}]);


//константы
//angwhisky.constant('serviceBasePath', 'http://localhost:3649/'); //путь к серверу
//angwhisky.constant('ourBasePath', 'http://localhost:3408/'); //путь к клиенту

angwhisky.constant('serviceBasePath', 'http://whiskydemo.apphb.com/'); //путь к серверу
angwhisky.constant('ourBasePath', 'http://angwhisky.apphb.com/'); //путь к клиенту


////////////////////////////////////////////////////////////////контроллеры//////////////////////////////////////////////////////////

//вывод категорий товаров
angwhisky.controller('CatController', ['$scope', '$http', 'userService', 'dataService',
    function ($scope, $http, userService, dataService) {
        dataService.getData('CategoryAPI').then(function (data) { 
            $scope.Cats = data;
        });
    userService.refreshEnv();
}]);

//вывод всех продуктов
angwhisky.controller('ProdController', ['$scope', 'dataService', 'serviceBasePath',
    function ($scope, dataService, serviceBasePath) {
        $scope.BasePath = serviceBasePath.substring(0, serviceBasePath.length - 1);
        dataService.getData('ProductAPI').then(function (data) {
            $scope.Products = data;
        });
}]);

//вывод продуктов по категории
angwhisky.controller('CatProdController', ['$scope','$routeParams', 'serviceBasePath', '$http', 'dataService',
    function ($scope, $routeParams, serviceBasePath, $http, dataService) {
        $scope.catid = $routeParams.id;
        $scope.soart = $routeParams.soart;
        $scope.BasePath = serviceBasePath.substring(0, serviceBasePath.length - 1);

        dataService.getData('ProductAPI/' + $scope.catid).then(function (data) {
            $scope.CatProducts = data;
        });

        dataService.getData('CategoryAPI').then(function (data) {
            var Cats = data;
            for (var i = 0; i < Cats.length; i++) {
                if (Cats[i].id == $scope.catid) {
                    $scope.Catname = Cats[i].name;
                };
            };
        });

}]);


//вывод одного продукта
angwhisky.controller('OneProdController', ['$scope', 'serviceBasePath', '$routeParams',  'dataService',
    function ($scope, serviceBasePath, $routeParams, dataService) {
        var theid = $routeParams.id;
        $scope.BasePath = serviceBasePath.substring(0, serviceBasePath.length - 1);
        dataService.getData('OneProdAPI/' + theid).then(function (data) {
            $scope.Prodcol = data;
            $scope.Prod = $scope.Prodcol[0];
        });

    }]);


//логин
angwhisky.controller('LoginController', ['$scope', 'accountService', '$location', 'userService', 
    '$rootScope', 'dataService',
    function ($scope, accountService, $location, userService, $rootScope, dataService) {
    $scope.account = {
        userName: '',
        Password: ''
    };
    $scope.message = "";
    $scope.login = function () {
        accountService.login($scope.account).then(function (data) {

            $rootScope.whiskyauth = false;
            sessionStorage.CurrUserName = null;
            sessionStorage.usaid = null;
            var isConfirmed = false;
            dataService.getData('AuthAPI').then(function (data) {
                var usa = data;
                if (usa.IsConfirmed) {
                    $rootScope.whiskyauth = true;
                    $rootScope.loginwelcome = "Добро пожаловать, " + usa.userName + "!";
                    sessionStorage.CurrUserName = usa.Email;
                    sessionStorage.usaid = usa.UserId;
                    isConfirmed = true;
                    userService.refreshEnv();
                    $location.path('/home');
                } else {
                    $scope.message = "Email не подтвержден";
                };
            });


        }, function (error) {
            $scope.message = error;
        });
    };
}]);

//логаут
angwhisky.controller('LogoutController', ['$scope', 'accountService', '$location', 'userService', '$route',
    function ($scope, accountService, $location, userService, $route) {
        var logout = function () {
             accountService.logout();
             userService.refreshEnv();
             $location.path('/home');
            };
        logout();
        $route.reload();
}]);

//регистрация нового пользователя
angwhisky.controller('RegisterController', ['$scope', '$location', '$http', 'serviceBasePath', 'ourBasePath',
    function ($scope, $location, $http, serviceBasePath, ourBasePath ) {
        $scope.account = {
            userName: '',
            Email: '',
            Password: '',
            Password2: '',
            OutUrl: ourBasePath 
        };
        $scope.message = "";
        $scope.register = function () {
            if ($scope.account.Password != $scope.account.Password2) {
                $scope.message = "Пароли не совпадают";
            } else {
                $http.post(serviceBasePath + 'api/RegisterAPI/', $scope.account).then(function (data) {
                    $location.path('/waitconfirm');
                }, function (error) {
                    $scope.message = error.data;
                });
            };
        };
}]);

//подтверждение регистрации по емейлу
angwhisky.controller('ConfirmRegController', ['$scope', '$routeParams', 'serviceBasePath', '$http', '$location',
    function ($scope, $routeParams, serviceBasePath, $http, $location) {
      $scope.message = "";
      $scope.endreg = function () {
          var userobj = {
              userid: $routeParams.userid,
              usertoken: $scope.usertoken
          };
          $http.post(serviceBasePath + 'api/ConfirmRegAPI/', userobj).then(function (data) {
              $location.path('/regdone');
          }, function (error) {
              $scope.message = error.data;
          });
      };
}]);

//отправка уведомления о сбросе пароля
angwhisky.controller('ForgotReqController', ['$scope', 'serviceBasePath', '$http', '$location', 'ourBasePath',
    function ($scope, serviceBasePath, $http, $location, ourBasePath) {
        $scope.message = "";
        $scope.sendForgotReq = function () {

            var masyaga = {
                forgotemail: $scope.forgotemail,
                outurl: ourBasePath
            };

            $http.post(serviceBasePath + 'api/ForgotReqAPI/', masyaga).then(function (data) {
                $location.path('/waitconfirm');
            }, function (error) {
                if (error != null) {
                    console.log(error);
                    $scope.message = 'Неправильно указан адрес';
                };
            });
        };
}]);

//сброс пароля
angwhisky.controller('ForgotConfirmController', ['$scope', '$routeParams', 'serviceBasePath', '$http', '$location',
    function ($scope, $routeParams, serviceBasePath, $http, $location) {
        $scope.message = "";
        $scope.account = {
            userid: $routeParams.userid,
            usertoken: '',
            Password: '',
            Password2: ''
        };

        $scope.doReset = function () {
            if ($scope.account.Password != $scope.account.Password2) {
                $scope.message = "Пароли не совпадают";
            } else {

                $http.post(serviceBasePath + 'api/ForgotConfirmAPI/', $scope.account).then(function (data) {
                    $location.path('/forgotdone');
                }, function (error) {
                    $scope.message = error.data;
                });
            };
        };
 }]);


//вывод содержимого корзины
angwhisky.controller('BagController', ['serviceBasePath', 'dataService', '$scope',
    function (serviceBasePath, dataService, $scope) {

    var getBags = function () {
        dataService.getData('PurchaseAPI/' + sessionStorage.usaid).then(function (data) {
            $scope.Bags = data;
            $scope.allsum = 0;
            for (var i = 0; i < $scope.Bags.length; i++) {
                $scope.allsum = $scope.allsum + $scope.Bags[i].summa;
            };
        });
    };

    getBags();

}]);

//удаление итема корзины
angwhisky.controller('DelBagController', ['serviceBasePath', '$http', '$routeParams', '$window','dataService',
    function (serviceBasePath, $http, $routeParams, $window, dataService) {
        var theid = $routeParams.id;
        dataService.getData('PurchaseAPI/' + sessionStorage.usaid).then(function (data) {
            var Bags = data;
            var delbag = {};
            for (var i = 0; i < Bags.length; i++) {
                if (Bags[i].Id == theid) {
                    delbag = angular.toJson(Bags[i]);
                };
            };
            $http.post(serviceBasePath + '/api/DelBagAPI/', delbag).then(function (response) {
                $window.history.back();
            });
        });

}]);

//оформление заказа по всем имеющимся итемам корзины
angwhisky.controller('BuyController', ['serviceBasePath', '$http', '$scope',
    function (serviceBasePath, $http, $scope) {
        var uinfo = { UserId: sessionStorage.usaid, Email: sessionStorage.CurrUserName, userName: sessionStorage.CurrUserName };
        $http.post(serviceBasePath + '/api/PurchaseAPI/', uinfo).then(function (response) {
            $scope.Buymessage = "Ваш заказ принят.";
        }, function (error) {
            $scope.Buymessage = error.data.ExceptionMessage;
        });

    }]);

//добавление итема в корзину
angwhisky.controller('AddBagController', ['serviceBasePath', '$http', 'dataService', '$routeParams', '$scope',
    '$location', 'userService',
    function (serviceBasePath, $http, dataService, $routeParams, $scope, $location, userService) {
        var au = userService.GetCurrentUser();
        if (au == null) {
            $location.path('/login');
        } else{
            var theid = $routeParams.id;
            dataService.getData('ProductAPI').then(function (data) {
                var Products = data;
                for (var i = 0; i < Products.length; i++) {
                    if (Products[i].id == theid) {
                        $scope.Prodname = Products[i].name;
                    };
                };
            });

            $scope.message = "";
            $scope.addbag = { 'Id': 0, 'qnty': 1, 'ProductId': theid, 'ProductName': $scope.Prodname, 'UserId': sessionStorage.usaid };

            $scope.addtobag = function () {
                $http.post(serviceBasePath + 'api/AddBagAPI/', $scope.addbag).then(function (response) {
                    $location.path('/bag');
                }, function (error) {
                    $scope.message = error.data;
                });
            };
        };
}]);



///////////////////////////////////////////////////сервисы////////////////////////////////////////////////////////////////////////

//извлечение данных методом гет
angwhisky.factory('dataService', ['$http', 'serviceBasePath', '$routeParams', '$q', function ($http, serviceBasePath, $routeParams, $q) {
    var fac = {};

    fac.getData = function (datapath) {
        var defer = $q.defer();
        $http.get(serviceBasePath + 'api/' + datapath + '/').then(function (response) {
            defer.resolve(response.data);
        }, function (error) {
            defer.reject(error.data);
        });
        return defer.promise;
    };


    return fac;
}]);


//работа с активным пользователем
angwhisky.factory('userService', ['$rootScope',   function ($rootScope) {
    var fac = {};
    fac.CurrentUser = null;
    fac.SetCurrentUser = function (user, username) {
        fac.CurrentUser = user;
        sessionStorage.CurrUserName = username;
        sessionStorage.user = angular.toJson(user);
    };
    fac.GetCurrentUser = function () {
        fac.CurrentUser = angular.fromJson(sessionStorage.user);
        return fac.CurrentUser;
    };
    fac.refreshEnv = function () {
        var usar = fac.GetCurrentUser();
        if (usar != null) {
            $rootScope.loginwelcome = "Добро пожаловать, " + sessionStorage.CurrUserName + "!";
            $rootScope.whiskyauth = true;
        } else {
            $rootScope.loginwelcome = "Вход не выполнен";
            $rootScope.whiskyauth = false;
        };
    };
    return fac;
}]);

//работа с авторизацией
angwhisky.factory('accountService', ['$http', '$q', 'serviceBasePath', 'userService', '$rootScope',
    function ($http, $q, serviceBasePath, userService, $rootScope) {
    var fac = {};
    fac.login = function (user) {
        var obj = { 'userName': user.userName, 'Password': user.Password, 'grant_type': 'password' };
        Object.toparams = function ObjectsToParams(obj) {
            var p = [];
            for (var key in obj) {
                p.push(key + '=' + encodeURIComponent(obj[key]));
            };
            return p.join('&');
        };
        var defer = $q.defer();
        $http({
            method: 'post',
            url: serviceBasePath + "token",
            data: Object.toparams(obj),
            headers: {'Content-type' : 'application/x-www-form-urlencoded' }
        }).then(function (response) {

            userService.SetCurrentUser(response.data, user.userName);
            defer.resolve(response.data);
        }, function (error) {
            if (error != null) {
                error.data = "Неверный логин или пароль";
            };
            defer.reject(error.data);
        });

        return defer.promise;
    };
    fac.logout = function () {
        userService.CurrentUser = null;
        userService.SetCurrentUser(userService.CurrentUser, null);
        $rootScope.whiskyauth = false;
        sessionStorage.CurrUserName = null;
        sessionStorage.usaid = null;
    };

    return fac;
}]);

//эйч-ти-ти-пи интерсептор!
angwhisky.config(['$httpProvider', function ($httpProvider) {
    var interceptor = function (userService, $q, $location)
    {
        return {
            request: function (config) {
                var currentUser = userService.GetCurrentUser();
                if (currentUser != null) {
                    config.headers['Authorization'] = 'Bearer ' + currentUser.access_token;
                };
                return config;
            },
            responseError: function (rejection) {
                if (rejection.status === 401) {
                    $location.path('/login');
                    return $q.reject(rejection);
                };
                return $q.reject(rejection);
            }
       }
    };
    var params = ['userService', '$q', '$location'];
    interceptor.$inject = params;
    $httpProvider.interceptors.push(interceptor);
}]);

