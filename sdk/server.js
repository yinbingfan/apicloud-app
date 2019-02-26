/*
 * name: server
 * version: 0.5.0
 * update: bug fix/ add openSelecter
 * date: 2017-04-28
 */

define(function (require, exports, module) {
    "use strict";
    var $ = app.util;
    var etpl = require('etpl');
    //资源路径处理
    var _source = function (source, host) {
        if (!$.trim(source)) {
            return "";
        }
        host = host && host.split ? host : appcfg.host.source;
        if (/^([\w-]+:)?\/\/([^\/]+)/.test(source)) {
            //source = host + source.replace(/^([\w-]+:)?\/\/([^\/]+)/,'');
        } else {
            source = host + source;
        }
        return source.replace(/\\/g, '/');
    };
    //图片域名处理
    etpl.addFilter('source', function (source, host) {
        return _source(source, host);
    });
    //时间格式处理
    var _getDate = function (source, ignore_minute, logfunction) {
        var myDate;
        var separate = '-';
        var minute = '';
        if (source === void(0)) {
            source = new Date();
        }
        logfunction && logfunction(source);
        if (source.split) {
            source = source.replace(/\-/g, '/');
        } else if (isNaN(parseInt(source))) {
            source = source.toString().replace(/\-/g, '/');
        } else {
            source = new Date(source);
        }
        logfunction && logfunction(source);
        if (new Date(source) && (new Date(source)).getDate) {
            myDate = new Date(source);
            logfunction && logfunction(myDate);
            if (!ignore_minute) {
                minute = (myDate.getHours() < 10 ? " 0" : " ") + myDate.getHours() + ":" + (myDate.getMinutes() < 10 ? "0" : "") + myDate.getMinutes();
            }
            return myDate.getFullYear() + separate + (myDate.getMonth() + 1) + separate + (myDate.getDate() < 10 ? '0' : '') + myDate.getDate() + minute;
        } else {
            return source.slice(0, 16);
        }
    };
    var _isBlank = function (obj) {

        if (obj == undefined || obj == null || obj == 'null' || obj.length == 0 || obj == '' || obj == {}) {
            return true;
        } else {
            return false;
        }
    }

    var _wsOpenUrl = function (url) {

        let wsOpenUrl

        wsOpenUrl = appcfg.controlSorket.replace("http", "ws")
        wsOpenUrl = wsOpenUrl.replace("/api/", "")
        wsOpenUrl = wsOpenUrl + `/${url}/`;

        return wsOpenUrl
    }

    var _getUser = function () {
        var user = api.getPrefs({
            sync: true,
            key: 'userinfo'
        });
        // console.warn(user);
        if (_isBlank(user)) {
            return false;
        } else {
            return JSON.parse(user);
        }
    };

    var _setUser = function (user) {
        api.setPrefs({ //存储 token
            key: 'userinfo',
            value: user
        });
    }

    var _setToken = function (t) {
        api.setPrefs({
            key: 'token',
            value: t
        });
    }

    var _getToken = function () {
        return api.getPrefs({
            key: 'token',
            sync: true
        });
    }

    //封装ajax请求，统一增加语言符(如zh-CN)，token(如果已登陆)，返回服务器错误信息
    var _ajax = function (params) {
        // console.warn(navigator.language);
        var url = params.url;
        var name = params.name;  //缓存参数
        var data = params.data;
        var language = _getUILanguageAABB();
        if (_isBlank(language)) {
            data.lang = (navigator.language).replace("-", "_"); //参数中加入语言符
        } else {
            language = language.replace("-", "_");
            data.lang = language;
        }

        if (_getUser()) {
            data.token = api.getPrefs({
                sync: true,
                key: 'token'
            });
        }
        var method;
        if (_isBlank(params.method)) {
            method = "post";
        } else {
            method = params.method;
        }
        // console.warn("http" + method + " url=" + url + " data=" + JSON.stringify(data));
        console.log("网络请求" + JSON.stringify(params));
        api.ajax({
            url: url,
            method: method,
            snapshoot:true,
            headers: params.headers,
            timeout: params.timeout,
            data: {
                values: data
            }
        }, function (ret, err) {
            if (ret) {
                console.log("网络请求成功————————" + method + "：URL=" + url + " param=" + JSON.stringify(ret));
                params.success(ret);
            } else {
                console.log("网络请求失败————————" + method + "：URL=" + url + " param=" + JSON.stringify(err));
                if (err.statusCode == 403) {
                    api.removePrefs({
                        key: 'userinfo'
                    });
                    api.removePrefs({    //登录成功清除未登录时已读数据
                        key: 'newsReadArrayKey5'
                    });
                    var valKey = "marketList_Optional"  +  server.getCountryId()
                    api.removePrefs({    //登录成功清除未登录时已读数据
                        key: valKey
                    });
                    api.execScript({
                        name: 'index',
                        frameName: 'market',
                        script: "closeFrame()"
                    });
                    app.publish("changeUserInfo", "1");
                    console.log("🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚111111111111111111");
                    api.execScript({
                        // name: 'index',
                        // frameName: 'market',
                        name: 'root',
                        script: 'restartWebSocket();'
                    });
                    api.execScript({
                        name: 'index',
                        frameName: 'member',
                        script: 'init()'
                    });
                    // api.execScript({                                                      //刷新新闻缓存数据
                    //     name: 'index',
                    //     frameName: 'subNews',
                    //     script: 'getNewsList(1);'
                    // });
                    console.log("🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚111111111111111111");
                    api.alert({
                        title: i18n.t("alert"),
                        msg: i18n.t("Login information has expired, please login again")
                    }, function (ret, err) {
                        if (ret) {
                            api.openWin({
                                name: 'login',
                                url: '../login/temp.html',
                                pageParam: {
                                    name: 'test'
                                }
                            });
                            //  alert( JSON.stringify( ret ) );
                        }
                    });
                } else {
                   app.pull.stop();
                  //  app.toast(i18n.t("Network_error_please_try_again_later"));
                    params.error(err);
                }
            }
        });

    }

    var _ajaxTrack = function (params) {
        var url = params.url;
        var data = params.data;
        var lang = _getUILanguageAABB();
        if (_isBlank(lang)) {
            data.lang = (navigator.language).replace("-", "_"); //参数中加入语言符
        } else {
            data.lang = lang.replace("-", "_"); //参数中加入语言符
        }
        var clientType, deviceId, userId;
        deviceId = api.deviceId;
        if (api.systemType == "android") {
            clientType = 0;
        } else {
            clientType = 1;
        }
        if (_getUser()) {
            userId = _getUser().userId;
            data.token = api.getPrefs({
                sync: true,
                key: 'token'
            });
        }
        data.clientType = clientType;
        data.userId = userId;
        data.deviceId = deviceId;

        api.ajax({
            url: url,
            method: "post",
            headers: params.headers,
            data: {
                values: data
            }
        }, function (ret, err) {
            if (ret) {
                console.log("http 请求成功" + "埋点" + "：url=" + url + " param=" + JSON.stringify(ret));
                params.success(ret);
            } else {
                console.log("http 请求失败" + "埋点" + "：url=" + url + " param=" + JSON.stringify(err));
                if (err.statusCode == 403) {
                    api.removePrefs({
                        key: 'userinfo'
                    });
                    app.publish("changeUserInfo", "2");
                    console.log("🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚22222222222222222222222222222")
                    api.execScript({
                        // name: 'index',
                        // frameName: 'market',
                        name: 'root',
                        script: 'restartWebSocket();'
                    });
                    console.log("🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚22222222222222222222222222222")
                    api.alert({
                        msg: "登录信息已过期，请重新登录"
                    }, function (ret, err) {
                        if (ret) {
                            api.openWin({
                                name: 'login',
                                url: '../login/temp.html',
                                pageParam: {
                                    name: 'test'
                                }
                            });
                            //  alert( JSON.stringify( ret ) );
                        }
                    });
                } else {
                    params.success(err);
                }
            }
        });
    }

    //退出登录
    var _logout = function () {
        app.storage.remove('user');
        //注销推送
        var ajpush = api.require('ajpush');
        ajpush.bindAliasAndTags({
            alias: '',
            tags: []
        }, function (ret) {
            if (ret.statusCode) {
                console.log('推送已注销');
            }
        });
        app.openView({
            closeback: true
        }, 'member', 'login');

    };

    //存储用户信息
    var _initUser = function (userData) {
        if (!userData) {
            return app.toast('初始化用户信息失败');
        }
        app.storage.val('user', userData);
        //app初始化
        app.storage.val('appInit', 1);
        //注册推送
        if (userData.tag) {
            var ajpush = api.require('ajpush');
            ajpush.bindAliasAndTags({
                alias: "user_" + userData.id,
                tags: userData.tag.split(',')
            }, function (ret, err) {
                if (ret) {
                    console.log("user_" + userData.id + "成功注册推送");
                } else {
                    console.log(JSON.stringify(err));
                }
            });
        }
    };
    //推送开关
    var _push = {
        open: function (cb) {
            var ajpush = api.require('ajpush');
            if (ajpush) {
                ajpush.resumePush(function (ret) {
                    if (typeof cb === 'function') {
                        cb(ret && ret.status);
                    }
                });
            } else {
                console.log('ajpush插件未就绪');
            }
        },
        close: function (cb) {
            var ajpush = api.require('ajpush');
            if (ajpush) {
                ajpush.stopPush(function (ret) {
                    if (typeof cb === 'function') {
                        cb(ret && ret.status);
                    }
                });
            } else {
                console.log('ajpush插件未就绪');
            }
        }
    };


    //获取语言id
    var _getLanguageId = function () {
        // return 160;
        var id = api.getPrefs({
            key: 'selectedLanguageId',
            sync: true
        });
        if (_isBlank(id)) {
            id = api.getPrefs({
                key: 'languageId',
                sync: true
            });
        }
        return id;
    }

    //获取国家id
    var _getCountryId = function () {

        // return 152;
        var id = api.getPrefs({
            key: 'selectedCountryId',
            sync: true
        });
        if (_isBlank(id)) {
            id = api.getPrefs({
                key: 'countryId',
                sync: true
            });
        }
        return id;
    }
    //获取国家码86
    var _getCountryCode = function () {
        // return 82;
        var id;
        id = api.getPrefs({
            key: 'selectedCountryCode',
            sync: true
        });
        if (_isBlank(id)) {
            id = api.getPrefs({
                key: 'countryCode',
                sync: true
            });
        }
        if (_isBlank(id)) {
            id = appcfg.host.countryCode;
        }
        return id;
    }

    //数据预取
    var _preGet = function (cb) {
        var got = 0,
            preGetList = _preGet.prototype.preGetList,
            getOne = function () {
                got++;
                if (got >= preGetList.length && typeof(cb) === 'function') {
                    cb();
                    got = null;
                    getOne = null;
                    preGetList = null;
                }
            };
        // console.log("数据预取 preGetList" +preGetList+"  getOne: "+getOne);
        if (_checkPreget()) {
            return cb();
        }
        //开始加载
        $.each(preGetList, function (i, e) {
            app.ajax({
                url: e.url,
                data: e.data,
                success: function (res) {
                    console.log("Sever.js开始加载" + JSON.stringify(res));
                    getOne();
                    if (res.status === 'Y') {
                        var data = res.data;
                        if (data) {
                            if (data.split) {
                                data = JSON.parse(data);
                            }
                            app.storage.val(e.key, data);
                        }
                    }
                },
                error: function () {
                }
            });
        });
    };
    //预取配置信息
    // _preGet.prototype.preGetList = [{
    // 	key: 'test',
    // 	url: 'http://wallessl.clientgear.com/sysmonitor/version',
    // 	data: {}
    // }];

    _preGet.prototype.preGetList = [];
    //预取数据
    var _checkPreget = function () {
        var preGetList = _preGet.prototype.preGetList,
            isDone = true;
        $.each(preGetList, function (i, e) {
            if (!app.storage.val(e.key)) {
                isDone = false;
                return false;
            }
        });
        return isDone;
    };
    //检查升级
    var _checkUpdate = function (silence) {
        var mam = api.require('mam');
        var platform = api.systemType;
        mam.checkUpdate(function (ret, err) {
            if (ret) {
                var result = ret.result;
                if (result.update === true && result.closed === false) {
                    app.confirm(result.updateTip, function () {
                        if (platform == 'ios') {
                            api.installApp({
                                appUri: result.source
                            });
                        } else if (platform == 'android') {
                            app.loading.show('正在下载');
                            api.download({
                                url: result.source,
                                report: true
                            }, function (ret, err) {
                                if (ret && 1 === ret.state) { /* 下载完成 */
                                    app.loading.hide();
                                    var savePath = ret.savePath;
                                    api.installApp({
                                        appUri: savePath
                                    });
                                }
                            });
                        }
                    }, null, {
                        bar: true,
                        title: '升级到 V' + result.version
                    });
                } else if (!silence) {
                    app.alert("暂无更新");
                }
            } else if (!silence) {
                app.alert(err.msg);
            }
        });
    };
    //获取地理位置
    var _getLocation = function (callback, errcb) {
        var bMap = api.require('bMap');
        var chaoshi = setTimeout(function () {
            app.loading.hide();
            bMap.stopLocation();
            if (app.storage.val('gps')) {
                var gpsCache = app.storage.val('gps');
                if (typeof(callback) === 'function') {
                    callback(gpsCache.lat, gpsCache.lng);
                }
                console.log('定位超时，使用缓存数据');
            } else {
                if (typeof(errcb) === 'function') {
                    errcb();
                } else {
                    app.toast('GPS定位超时！', 1000);
                }
            }
        }, appcfg.set.outime);
        bMap.getLocation({
            accuracy: '10m',
            autoStop: true,
            filter: 1
        }, function (ret, err) {
            app.loading.hide();
            if (ret && ret.status) {
                chaoshi = clearTimeout(chaoshi);
                if (ret.lat && ret.lon) {
                    app.storage.val('gps', {
                        lat: ret.lat,
                        lng: ret.lon
                    });
                } else {
                    console.log('bMap.getLocation定位异常');
                }
                bMap.stopLocation();
                if (typeof(callback) === 'function') {
                    callback(ret.lat, ret.lon);
                }
            } else {
                if (typeof(errcb) === 'function') {
                    errcb();
                } else {
                    app.toast('GPS定位失败：' + JSON.stringify(err));
                }
            }
        });
    };
    //指定DOM打开地图
    var _openBaiduMap = function (dom, data, refresh) {
        if (!$.isPlainObject(data) || !data.longitude || !data.latitude) {
            return app.toast('参数缺失，无法打开地图');
        }
        var bdMapParam = {
            lat: data.latitude,
            lng: data.longitude
        };
        app.storage.val('bdMapData', bdMapParam);
        if (refresh) {
            app.window.evaluate('', 'bdMapView', 'refresh()');
        } else {
            setTimeout(function () {
                var offset = $("#" + dom)[0].getBoundingClientRect();
                app.window.popoverElement({
                    id: dom,
                    name: 'bdMapView',
                    url: seajs.root + '/view/common/baiduMap/temp.html',
                    top: parseInt(window.selfTop) + offset.top,
                    bounce: false
                });
            }, 0);
        }
    };
    //公用模板
    var _commonTemp = function (tempName, data) {
        var templateCache = app.storage.val('templateCache') || {};
        if (!$.isPlainObject(data)) {
            data = {};
        }
        if (templateCache[tempName + JSON.stringify(data)]) {
            return templateCache[tempName + JSON.stringify(data)];
        }
        var etplEngine = new etpl.Engine();
        var template = api.readFile({
            sync: true,
            path: 'widget://res/temp/template.txt'
        });
        etplEngine.compile(template);
        var Render = etplEngine.getRenderer(tempName);
        if (Render) {
            var html = Render(data);
            templateCache[tempName + JSON.stringify(data)] = html;
            app.storage.val('templateCache', templateCache);
            return html;
        } else {
            console.log('找不到指定模板：' + tempName);
        }
    };

    var cacheImg = function (element, callback) {
        var placeholderPic = seajs.root + '/res/img/placeholder.jpg';
        var remoteEle;
        if ($(element)[0].getAttribute('data-remote')) {
            remoteEle = $(element);
        } else {
            remoteEle = $(element)[0].querySelectorAll('[data-remote]');
        }
        app.ready(function () {
            var cacheCount = 0;
            $.each(remoteEle, function (i, ele) {
                var remote = ele.getAttribute('data-remote') || placeholderPic;
                api.imageCache({
                    url: remote,
                    policy: "cache_else_network"
                }, function (ret, err) {
                    var url = ret.url;
                    if (ele.tagName.toLowerCase() === 'img') {
                        ele.setAttribute('src', url);
                    } else {
                        ele.style.backgroundImage = "url(" + url + ")";
                    }
                    ele.removeAttribute('data-remote');
                    cacheCount++;
                    if (cacheCount === remoteEle.length) {
                        typeof callback === 'function' && callback();
                    }
                });
            });
        });
        return remoteEle;
    };

    // 新闻列表（栏目下新闻、详情页底部新闻、收藏、历史等）：
    // - 发布时间如果少于1小时，则显示“1m-59m”；
    // - 如果介于1小时和24小时之间，则显示“1h- 24h”；
    // - 如果大于24小时，且为今年的文章，则显示具体时间点，如“13:24, Mar 23（不显示年）"；
    // - 如果为今年以前的文章，则显示“Mar 23, 2018（即不显示具体时间）”。
    var _getNewsTime = function (createtime) {
        return _getTwitterTime(createtime);
    }

    // Brief：标题下方的时间常驻。时间格式为：
    // - 今天=“Friday, Mar 25, Today”；
    // - 昨天=“Thusday, Mar 24, Yesterday”；
    // - 昨天之前=“Wednesday, Mar 23,”。
    // 去年=“Wednesday, Mar 23, 2018”。
    var _getBriefTopTime = function (createtime) {
        // var convetedTime = getDateDiff(createtime);
        var time1 = new Date(createtime)
        time1.Format("yyyy-MM-dd");
        var content = "null";
        var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var weekdayShort = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
        var monthStr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var monthShortStr = ["Jan", "Feb", "mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        content = i18n.t(monthShortStr[time1.getMonth()]) + " " + time1.getDate() + " " + i18n.t(weekday[time1.getDay()]);
        var language = _getUILanguageAABB()
        console.log(language);

        var now = Date.parse(new Date()) / 1000;
        var time2 = Date.parse(new Date(createtime)) / 1000;
        var limit = now - time2;
        var nowDate = new Date();
        var todayOrYes = "";
        if (limit < 86400 && time1.getDate() == nowDate.getDate()) {
            content = " " + i18n.t("today");
        } else if (limit < 172800 && time1.getDate() == (nowDate.getDate() - 1)) {
            content = " " + i18n.t("yesterday");
        } else if (limit >= 172800 && limit <= (2592000 * 12)) {
            //Friday, Mar 25, 2018 Today
            content = i18n.t(weekday[time1.getDay()]) + ", " + i18n.t(monthShortStr[Number(time1.getMonth())]) + "  " + time1.getDate() + "" + todayOrYes;
            if (language.indexOf("ja") >= 0) { //2018.03.25  今日  金曜日
                content = Number(time1.getMonth()+1) + "." + time1.getDate() + todayOrYes + " " + i18n.t(weekday[time1.getDay()]);
            }
            if (language.indexOf("ru") >= 0) { //Вчера 24 мар. 2018 г. чт.
                content = todayOrYes.trim() + " " + time1.getDate() + " " + i18n.t(monthShortStr[Number(time1.getMonth())]) + ' ' +i18n.t(weekdayShort[time1.getDay()]);
            }
            if (language.indexOf("ko") >= 0) { //어제 2018-03-24(목)
                content = todayOrYes.trim() + Number(time1.getMonth()+1)  + "-" + time1.getDate() + "(" + i18n.t(weekdayShort[time1.getDay()]) + ")";
            }
            if (language.indexOf("zh") >= 0) { //中文 Friday, Mar 25, 2018 Today
                content = i18n.t(weekday[time1.getDay()]) + ", " + i18n.t(monthShortStr[Number(time1.getMonth())]) + "" + time1.getDate() + "日" + todayOrYes;
            }
        } else if (limit >= (2592000 * 12)) { //大于一年
            content = i18n.t(weekday[time1.getDay()]) + ", " + i18n.t(monthShortStr[Number(time1.getMonth())]) + " " + time1.getDate() + ", " + time1.getFullYear() + todayOrYes;
            if (language.indexOf("ja") >= 0) { //2018.03.25  今日  金曜日
                content = time1.getFullYear() + "." + Number(time1.getMonth()+1) + "." + time1.getDate() + todayOrYes + " " + i18n.t(weekday[time1.getDay()]);
            }
            if (language.indexOf("ru") >= 0) { //Вчера 24 мар. 2018 г. чт.
                content = todayOrYes.trim() + " " + time1.getDate() + " " + i18n.t(monthShortStr[Number(time1.getMonth())]) + " " + time1.getFullYear() + " г. " + i18n.t(weekdayShort[time1.getDay()]);
            }
            if (language.indexOf("ko") >= 0) { //어제 2018-03-24(목)
                content = todayOrYes.trim() + " " + time1.getFullYear() + "-" + Number(time1.getMonth()+1) + "-" + time1.getDate() + "(" + i18n.t(weekdayShort[time1.getDay()]) + ")";
            }
            if (language.indexOf("zh") >= 0) { //中文 Friday, Mar 25, 2018 Today
                content = i18n.t(weekday[time1.getDay()]) + ", " + i18n.t(monthShortStr[Number(time1.getMonth())]) + "" + time1.getDate() + "日, " + time1.getFullYear() + todayOrYes;
            }
        }

        return content;
    }

    // - 发布时间如果少于1小时，则显示“1m-59m”；
    // - 如果介于1小时和24小时之间，则显示“1h- 24h”；
    // - 如果大于24小时，且为今年的文章，则显示具体时间点，如“13:24, Mar 23（不显示年）"；
    // - 如果为今年以前的文章，则显示“Mar 23, 2018（即不显示具体时间）”。
    var _getTwitterTime = function (createtime) {
        var language = _getUILanguageAABB()
        var time1 = new Date(createtime);
        var now = Date.parse(new Date()) / 1000;
        time1.Format("yyyy-MM-dd");
        var time1Num = Date.parse(time1) / 1000;
        var limit = now - time1Num;
        console.log("新闻时间：" + time1Num + ", now: " + now + " , time1: " + time1 + "limit: " + limit);
        var content = "";
        if (limit < 3600) { //一小时内
            if (language.indexOf("ru") >= 0) {
              content = Math.floor(limit / 60) +" "+" "+ i18n.t("minute_short");
            }else{
                content = Math.floor(limit / 60) + i18n.t("minute_short");
            }
        } else if (limit >= 3600 && limit < 86400) { //一天内
          if (language.indexOf("ru") >= 0) {
            content = Math.floor(limit / 3600) +" "+" " +i18n.t("hour_short");
          }else{
              content = Math.floor(limit / 3600) + i18n.t("hour_short");
          }
        } else if (limit >= 86400 && limit <= (2592000 * 12)) { //今年内
            console.log("🔥本月");
            content = _getTimeHHMM(createtime) + ", " + getTimeMonthShort(createtime) + " " + time1.getDate();
            var language = _getUILanguageAABB()
            if (language.indexOf("zh") >= 0) {
                content = _getTimeHHMM(createtime) + ", " + getTimeMonthShort(createtime) + time1.getDate() + "日";
            }
            if (language.indexOf("ru") >= 0) {
                content = _getTimeHHMM(createtime) +", "+" "+ time1.getDate() +" "+  " " + getTimeMonthShort(createtime);
            }
            if (language.indexOf("ja") >= 0) {
                content = (time1.getMonth() + 1) + "/" + time1.getDate() + " " + _getTimeHHMM(createtime);
            }
            if (language.indexOf("ko") >= 0) {
                content = (time1.getMonth() + 1) + "-" + time1.getDate() + " " + _getTimeHHMM(createtime);
            }
        } else if (limit >= (2592000 * 12)) { //大于一年
            content = getTimeMonthShort(createtime) + " " + time1.getDate() + " " + time1.getFullYear();
        }
        return content;
    }

    // 完整的日期时间  2018-11-10  20：00
    var _getDttTime = function (createtime) {
      var time1 = new Date(createtime).Format("yyyy-MM-dd  hh:mm:ss");
      return time1;
    }

    var _getTime = function (createtime) {
      var language = _getUILanguageAABB()
      var time1 = new Date(createtime);
        time1.Format("yyyy-MM-dd");
        var   content = _getTimeHHMM(createtime) + ", " + getTimeMonthShort(createtime) + " " + time1.getDate() + " " + time1.getFullYear();
        var language = _getUILanguageAABB()
        if (language.indexOf("zh") >= 0) {
            content = _getTimeHHMM(createtime) + ", " + getTimeMonthShort(createtime) + time1.getDate() + "日" + " " + time1.getFullYear();
        }
        if (language.indexOf("ru") >= 0) {
            content = _getTimeHHMM(createtime) +", "+" "+ time1.getDate()  +" "+  " " + getTimeMonthShort(createtime) + " " + time1.getFullYear();
        }
        if (language.indexOf("ja") >= 0) {
            content = (time1.getMonth() + 1) + "/" + time1.getDate() + " " + time1.getFullYear() + " " + _getTimeHHMM(createtime);
        }
        if (language.indexOf("ko") >= 0) {
            content = (time1.getMonth() + 1) + "-" + time1.getDate() + " " + time1.getFullYear() + " " + _getTimeHHMM(createtime);
        }
        return content;
    }

    var _getTimeHHMM = function (createtime) {
        // var convetedTime = getDateDiff(createtime);
        var time1 = new Date(createtime);
        var ttt = time1.Format("yyyy-MM-dd");
        var content = "";
        var minutes = time1.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        content = time1.getHours() + ":" + minutes;
        return content;
    }

    var _getTimeHHMMSS = function (createtime) {
        // var convetedTime = getDateDiff(createtime);
        var time1 = new Date(createtime);
        var ttt = time1.Format("yyyy-MM-dd");
        var content = "";
        var minutes = time1.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var seconds = time1.getSeconds();
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        content = time1.getHours() + ":" + minutes + ":" + seconds;
        return content;
    }

    var getTimeMonthShort = function (createtime) {
        var monthStr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var monthShortStr = ["jan", "feb", "mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        // var convetedTime = getDateDiff(createtime);
        var time1 = new Date(createtime)
        time1.Format("yyyy-MM-dd");
        return i18n.t(monthShortStr[time1.getMonth()]);
    }

    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    var getDateDiff = function (DiffTime) {
        //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
        var Time = DiffTime.replace(/\-/g, "/");
        return Time;
    };

    var _getTimeMMDDYYYY = function (timestamp) {
        var time1 = new Date(timestamp)
        time1.Format("MM/dd/yyyy");
        return (time1.getMonth() + 1) + "/" + time1.getDate() + "/" + time1.getFullYear();
    }

    var _setBriefNotify = function (b) {
        api.setPrefs({
            key: 'briefNotificationEnable',
            value: b
        });
    }
    var _getBriefNotify = function () {
        var s = api.getPrefs({
            key: 'briefNotificationEnable',
            sync: true
        });
        if (s == "false") {
            return false
        } else {
            return true
        }
    }

    //UI界面的语言，启动页设置的
    var _setUILanguageAABB = function (l) {
        api.setPrefs({
            key: 'UILanguage',
            value: l
        });
    }

    //UI界面的语言
    var _setSelectedUILanguageAABB = function (l) {
        api.setPrefs({
            key: 'SelectedUILanguage',
            value: l
        });
    }

    //UI界面的语言（最终确定的UI语言）
    //同i8n.js文件中的写法
    var _getUILanguageAABB = function (l) {
        var lang;
        lang = api.getPrefs({
            key: 'SelectedUILanguage',
            sync: true
        });
        if (_isBlank(lang)) {
            lang = api.getPrefs({
                key: 'UILanguage',
                sync: true
            });
        }
        if (_isBlank(lang)) {
            lang = navigator.language;
        }
        return lang;
    }

    var _getLoadingPageLang = function(){
        var langs
        switch (_getUILanguageAABB().substring(0, 2)) {
            case "en":
                langs = "en";
                break;
            case "zh":
                langs = "cn";
                break;
            case "ko":
                langs = "kr";
                break;
            case "ru":
                langs = "ru";
                break;
            case "ja":
                langs = "jp";
                break;
            default:
                langs = 'jp';
                break;
        }
        return langs

    }

    //内容语言启动页设置
    var _setLanguageAABB = function (l) {
        api.setPrefs({
            key: 'language',
            value: l
        });
    }

    //内容语言设置页设置
    var _setSelectedLanguageAABB = function (l) {
        console.log("_setSelectedLanguageAABB " + l);
        api.setPrefs({
            key: 'selectedLanguage',
            value: l
        });
    }

    //获取最终确定的（内容语言）
    var _getLanguageAABB = function () {
        var language = api.getPrefs({
            key: 'selectedLanguage',
            sync: true
        });
        if (_isBlank(language)) {
            language = api.getPrefs({
                key: 'language',
                sync: true
            });
        }
        if (_isBlank(language)) {
            language = navigator.language
        }
        // console.log("_getLanguageAABB" + language);
        return language;
    }

    //获取设置里设置的国家对应的（内容语言）
    var _getSelectedLanguageAABB = function () {
        var language = api.getPrefs({
            key: 'selectedLanguage',
            sync: true
        });
        if (_isBlank(language)) {
            language = "";
        }
        console.log("_getSelectedLanguageAABB——" + language);
        return language;
    }

    var _setLanguageId = function (languageId) {
        api.setPrefs({
            key: 'languageId',
            value: languageId
        });
    }
    var _setCountryId = function (countryId) {
        api.setPrefs({
            key: 'countryId',
            value: countryId
        });
    }
    var _setCountryCode = function (countryCode) {
        api.setPrefs({
            key: 'countryCode',
            value: countryCode
        });
    }
    var _setWapVersionCode = function (versionCode) {
        api.setPrefs({
            key: 'versionCode',
            value: versionCode
        });
    }

    var _getWapVersionCode = function () {
        return api.getPrefs({
            sync: true,
            key: "versionCode"
        });
    }

    var _setCountryInfo = function (countryInfos) {
        api.setPrefs({
            key: 'countryInfos',
            value: countryInfos
        });
    }

    var _getCountryInfo = function () {
        return api.getPrefs({
            key: 'countryInfos',
            sync: true
        });
    }

    var _getFooterHeight = function () {
        return api.getPrefs({
            key: 'footerHeight',
            sync: true
        });
    }

    var _setFooterHeight = function (h) {
        api.setPrefs({
            key: 'footerHeight',
            value: h
        });
    }

    var _setFontSize = function (s) {
        api.setPrefs({
            key: 'font-size',
            value: s
        });
    }

    var _getFontSize = function () {
        return api.getPrefs({
            key: 'font-size',
            sync: true
        });
    }

    var _setNewsTopFrame = function (s) {
        api.setPrefs({
            key: 'newsFrame',
            value: s
        });
    }

    var _getNewsTopFrame = function () {
        return api.getPrefs({
            key: 'newsFrame',
            sync: true
        });
    }

    var _setBriefTopFrame = function (s) {
        api.setPrefs({
            key: 'briefFrame',
            value: s
        });
    }

    var _getBriefTopFrame = function () {
        return api.getPrefs({
            key: 'briefFrame',
            sync: true
        });
    }

    var _setSelectedCountryId = function (a) {
        api.setPrefs({
            key: 'selectedCountryId',
            value: a
        });
    }

    var _setSelectedCountryCode = function (a) {
        api.setPrefs({
            key: 'selectedCountryCode',
            value: a
        });
    }
    var _setSelectedLanguageId = function (a) {
        api.setPrefs({
            key: 'selectedLanguageId',
            value: a
        });
    }

    var newsReadArrayKey = "newsReadArrayKey5";
    var _setNewsRead = function (id) {
        var readList = api.getPrefs({
            key: newsReadArrayKey,
            sync: true
        });
        if (!_isBlank(readList)) {
            readList = readList.split(",");
            readList.push(id);
            api.setPrefs({
                key: newsReadArrayKey,
                value: readList.join(",")
            });
        } else {
            var readList = [];
            readList.push(id);
            api.setPrefs({
                key: newsReadArrayKey,
                value: readList.join(",")
            });
        }
    }
    var _getNewsRead = function (id) {
        var readArray = api.getPrefs({
            key: newsReadArrayKey,
            sync: true
        });
        if (!_isBlank(readArray)) {
            readArray = readArray.split(",");
            if (readArray.indexOf(id) != -1) {
                return true;
            }
        }
        return false;
    }

    var _getNewsMark = function (newsId) {
        var markListStr = api.getPrefs({
            key: 'markList',
            sync: true
        });
        var list;
        if (_isBlank(markListStr)) {
            return ""
        }
        var list = JSON.parse(markListStr);
        if (_isBlank(list[newsId])) {
            return ""
        } else {
            return list[newsId]
        }
    }

    var _setNewsMark = function (newsId, isMarked) {
        var markListStr = api.getPrefs({
            key: 'markList',
            sync: true
        });
        var list;
        if (_isBlank(markListStr)) {
            list = {};
        } else {
            list = JSON.parse(markListStr);
        }
        list[newsId] = isMarked;
        markListStr = JSON.stringify(list);
        api.setPrefs({
            key: 'markList',
            value: markListStr
        });
    }
//移除启动图。若 config.xml 里面配置 autoLaunch 为 false，则启动图不会自动消失，直到调用此方法移除。
    var _removeLaunchView = function () {
        api.removeLaunchView({
            animation: {
                type: 'fade',
                duration: 500
            }
        });
    }
    var _getTitleLength = function() {
        var titleLength;
        switch (_getLanguageAABB().substring(0, 2)) {
            case "en":
                titleLength = "86";
                break;
            case "zh":
                titleLength = "60";
                break;
            case "ko":
                titleLength = "60";
                break;
            case "ru":
                titleLength = "75";
                break;
            case "ja":
                titleLength = "45";
                break;
            default:
                titleLength = '60';
                break;
        }
        return titleLength
    };



    var _getCurrency = function () {

        var currencySymbol;

        let price_key = api.getPrefs({
            key: 'price_key',
            sync: true
        });

        if (price_key) {
            switch (price_key) {
                case "USD":
                    currencySymbol = "$";
                    break;
                case "CNY":
                    currencySymbol = "￥";
                    break;
                case "KRW":
                    currencySymbol = "₩";
                    break;
                case "RUB":
                    currencySymbol = "₽";
                    break;
                case "JPY":
                    currencySymbol = "￥";
                    break;
            }
            return [price_key, currencySymbol]
        } else {
            return ['USD', '$']
        }
    }

    var _getExchangeRate = function (from, price, currencySymbol1) {

        // alert(from+price+currencySymbol1)
        var from1, to, price1, rate1, currencySymbol, price2;
        let price_key = api.getPrefs({
            key: 'price_key',
            sync: true
        });

        switch (price_key) {
            case "USD":
                to = "USD";
                currencySymbol = "$";
                break;
            case "CNY":
                to = "CNY";
                currencySymbol = "￥";
                break;
            case "KRW":
                to = "KRW";
                currencySymbol = "₩";
                break;
            case "RUB":
                to = "RUB";
                currencySymbol = "₽";
                break;
            case "JPY":
                to = "JPY";
                currencySymbol = "￥";
                break;
            default:  to = "USD";
                    currencySymbol = "$";
                    break;
        }

        // console.log("_getExchangeRate "+to+",+from "+from);
        if (to == from) {
            // return (currencySymbol1 + price)
            return (currencySymbol1  + parseFloat(price).toLocaleString())
        }
        rate1 = api.getPrefs({
            key: from + "-" + to,
            sync: true
        });

        if (!_isBlank(rate1)) {
            price1 = price * rate1;
            // return (currencySymbol + price1)
            return (currencySymbol + parseFloat(price1.toFixed(2)).toLocaleString())
        } else {
            console.log("没有汇率信息");
            //网络请求汇率并刷新ui数据
            _ajax({
                method: "get",
                url: appcfg.host+"/v1/api/app/exchange/convert/" + from + "/" + to,
                data: {},
                success: function (ret) {
                    rate1 = ret.data.rate;
                    price1 = price * rate1
                    api.setPrefs({
                        key: from + "-" + to,
                        value: ret.data.rate
                    });
                },
                error: function (err) {
                    console.warn(JSON.stringify(err));
                }

            })
            console.log("没有汇率信息" + (currencySymbol + price));
            // console.log("没有汇率信息"+(currencySymbol1 + price.toFixed(2)));
            // return (currencySymbol1 + price)
            return (currencySymbol + parseInt(price).toLocaleString())          //bug464
        }

    }

    var _getExchangeRateBTC = function (from, price) {
        var from1, to, price1, rate1, currencySymbol;
        to = "BTC";
        currencySymbol = "₿"
        // console.log("_getExchangeRate "+to+",+from "+from);
        rate1 = api.getPrefs({
            key: from + "-" + to,
            sync: true
        });
        if (! _isBlank(rate1)) {
            price1 = price * rate1;
            return (parseFloat(price1.toFixed(6)))

        } else {
            console.log("没有汇率信息");
            //网络请求汇率并刷新ui数据
            _ajax({
                method: "get",
                url: appcfg.host+"/v1/api/app/exchange/convert/" + from + "/" + to,
                data: {},
                success: function (ret) {
                    console.warn(JSON.stringify(ret))
                    rate1 = ret.data.rate;
                    price1 = price * rate1
                    api.setPrefs({
                        key: from + "-" + to,
                        value: ret.data.rate
                    });
                    return (parseFloat(price1.toFixed(6)))
                },
                error: function (err) {
                    console.warn(JSON.stringify(err));
                      return ("--")
                }

            })
            console.log("没有汇率信息" + (currencySymbol + price));
        }

    }
    var _getExchangeRateUSD = function (from, price, currencyCode) {
        var from1, to, price1, rate1, currencySymbol;
        // console.log("_getExchangeRate "+to+",+from "+from);
        to = "USD"
        currencySymbol = "$"
        rate1 = api.getPrefs({
            key: from + "-" + to,
            sync: true
        });

        if (!_isBlank(rate1)) {
            price1 = price * rate1;
            return (currencySymbol + parseFloat(price1.toFixed(2)).toLocaleString())
            // return (currencySymbol + price1.toFixed(2))
        } else {
            console.log("没有汇率信息");
            //网络请求汇率并刷新ui数据
            _ajax({
                method: "get",
                url: appcfg.host+"/v1/api/app/exchange/convert/" + from + "/" + to,
                data: {},
                success: function (ret) {
                    rate1 = ret.data.rate;
                    price1 = price * rate1
                    api.setPrefs({
                        key: from + "-" + to,
                        value: ret.data.rate
                    });
                    return (currencySymbol + parseFloat(price1.toFixed(2)).toLocaleString())
                },
                error: function (err) {
                    console.warn(JSON.stringify(err));
                      return (currencySymbol + "--")
                }

            })
            console.log("没有汇率信息" + (currencySymbol + price));

        }

    }

    var _getIp = function () {
        // app.toast("todo getIp");
    }

    var _getIpCountry = function () {
        // app.toast("todo getIpCountry");
    }
    var _getRegionName = function () {
        // app.toast("todo getRegionName");
    }
    var _getCity = function () {
        // app.toast("todo _getCity");
    }
    var _loading = function(num,name){
      var activity = api.require('UILoading');
    	if(num==0){
          activity.flower({
            center: {
                x:api.winWidth/2.0,
                y: api.winHeight/2.5
            },
            size: 30,
            fixedOn: name,
            mask: "rgba(0,0,0,0)",
            fixed: true
        }, function(ret) {
            setTimeout(function() {
              activity.closeFlower({
                  id:0               //IOS端必须加id
               });
            },20000)
        });
    	}else{
        // alert(1)
        activity.closeFlower({
            id:0               //IOS端必须加id
         });
    	}
    }
    // toast1样式弹窗
    var _toast1 = function (text,time) {
      var long = 1500;
      if(time) {
        long = time
      }
      api.openFrame({
          name: 'toast1',
          url: '../toast1/temp.html',
          rect: {
              x: api.winWidth/2-150/2,
              // y: api.winHeight-78,
              w: 150,
              h: 38,
              marginBottom: 78
          },
          pageParam: {
              text: text
          },
          bounces: false,
          animation: {
              type:"fade",                //动画类型（详见动画类型常量）
              subType:"from_bottom",       //动画子类型（详见动画子类型常量）
              duration:500                //动画过渡时间，默认300毫秒
          },
          bgColor: 'transparent',
          vScrollBarEnabled: false,
          hScrollBarEnabled: false
      })

      setTimeout(function() {
        api.closeFrame({
            name: 'toast1'
        });

      },long)
    }

    // toast2样式弹窗
    var _toast2 = function (title,text,time) {
      var long = 1500;
      if(time){
        long = time;
      }
      api.openFrame({
          name: 'toast2',
          url: '../toast2/temp.html',
          rect: {
              x: api.winWidth/2-300/2,
              // y: 0,
              w: 300,
              h: 90,
              marginBottom: 78
          },
          pageParam: {
              title: title,
              text: text
          },
          bounces: false,
          animation: {
              type:"fade",                //动画类型（详见动画类型常量）
              subType:"from_bottom",       //动画子类型（详见动画子类型常量）
              duration: 500              //动画过渡时间，默认300毫秒
          },
          bgColor: 'rgba(0,0,0,0)',
          // vScrollBarEnabled: true,
          // hScrollBarEnabled: true
      })
      setTimeout(function() {
        api.closeFrame({
            name: 'toast2'
        });

      },long)
    }

    var _toastBig = function() {
      api.openFrame({
          name: 'toastBig',
          url: '../toastBig/temp.html',
          rect: {
              x: 0,
              y: 0,
              w: "auto",
              h: "auto"
          },
          pageParam: {
              name: 'test'
          },
          bounces: false,
          bgColor: 'rgba(0,0,0,0.8)',
          vScrollBarEnabled: false,
          hScrollBarEnabled: false
      });
    }

    module.exports = {
       getTime : _getTime,
       getDttTime : _getDttTime,
        //打开websocket的url
        wsOpenUrl: _wsOpenUrl,
        getCurrency: _getCurrency,

        //保存、获取登录/注册/更新/退出登录用户信息，没有则返回空
        getUser: _getUser,
        setUser: _setUser,

        //token
        setToken: _setToken,
        getToken: _getToken,

        // 语言id
        setLanguageId: _setLanguageId,
        getLanguageId: _getLanguageId,

        //国家码（如86）
        setCountryCode: _setCountryCode,
        getCountryCode: _getCountryCode,

        //国家id
        setCountryId: _setCountryId,
        getCountryId: _getCountryId,

        //设置语言id、国家id、国家码(如86)
        setSelectedLanguageId: _setSelectedLanguageId,
        setSelectedCountryId: _setSelectedCountryId,
        setSelectedCountryCode: _setSelectedCountryCode,

        //操作界面语言码en-US
        setUILanguageAABB: _setUILanguageAABB,
        getUILanguageAABB: _getUILanguageAABB,
        getLoadingPageLang: _getLoadingPageLang,

        //获取设置过的操作界面语言码en-US
        setSelectedUILanguageAABB: _setSelectedUILanguageAABB,

        //获取区域语言码en-US
        setLanguageAABB: _setLanguageAABB,
        getLanguageAABB: _getLanguageAABB,

        //获取设置过的区域语言码en-US
        setSelectedLanguageAABB: _setSelectedLanguageAABB,
        getSelectedLanguageAABB: _getSelectedLanguageAABB,

        //wap端版本号
        setWapVersionCode: _setWapVersionCode,
        getWapVersionCode: _getWapVersionCode,

        //国家语言信息
        setCountryInfo: _setCountryInfo,
        getCountryInfo: _getCountryInfo,

        //获取主界面底部tab高度，其他住导航页面打开页面时增加marginBottom
        getFooterHeight: _getFooterHeight,
        setFooterHeight: _setFooterHeight,

        //本地新闻字号大小
        getFontSize: _getFontSize,
        setFontSize: _setFontSize,

        //新闻主页面哪个子页面在顶部
        getNewsTopFrame: _getNewsTopFrame,
        setNewsTopFrame: _setNewsTopFrame,

        //快讯主页面哪个子页面在顶部
        getBriefTopFrame: _getBriefTopFrame,
        setBriefTopFrame: _setBriefTopFrame,

        //封装的网络请求，自动增加token、userId（如果有），登陆失效处理
        ajax: _ajax,
        //封装的用户数据跟踪网络请求，自动增加token、userId（如果有），登陆失效处理
        ajaxTrack: _ajaxTrack,
        //退出登录，清楚本地缓存用户信息
        logout: _logout,
        //加载动画
        loading: _loading,

        //通用时间格式s
        getDate: _getDate,
        getTwitterTime: _getTwitterTime,//推特时间
        getNewsTime: _getNewsTime,//新闻列表时间，同推特时间
        getBriefTopTime: _getBriefTopTime,//快讯顶部时间
        getTimeMMDDYYYY: _getTimeMMDDYYYY,
        getTimeHHMM: _getTimeHHMM,
        getTimeHHMMSS: _getTimeHHMMSS,

        //设置、获取某条新闻是否读过
        setNewsRead: _setNewsRead,
        getNewsRead: _getNewsRead,

        //设置、获取某条新闻是否收藏过
        getNewsMark: _getNewsMark,
        setNewsMark: _setNewsMark,

        //获取根据汇率转化后的价格¥355
        getExchangeRate: _getExchangeRate,
        //获取根据汇率转化后的比特币价格¥355
        getExchangeRateBTC: _getExchangeRateBTC,
        //获取根据汇率转化后的比特币价格¥355
        getExchangeRateUSD: _getExchangeRateUSD,

        //从本地读取网络请求获取到的ip、国家、区域、城市信息
        getIp: _getIp,
        getIpCountry: _getIpCountry,
        getRegionName: _getRegionName,
        getCity: _getCity,

        //获取变量是否为空
        isBlank: _isBlank,

        //本地快讯通知开关设置
        getBriefNotify: _getBriefNotify,
        setBriefNotify: _setBriefNotify,
        //移除启动页
        removeLaunchView: _removeLaunchView,
        getTitleLength:_getTitleLength,
        //没用到的，后面可以参考研究一下
        checkUpdate: _checkUpdate,
        openBaiduMap: _openBaiduMap,
        commonTemp: _commonTemp,
        getLocation: _getLocation,
        cacheImg: cacheImg,
        initUser: _initUser,
        push: _push,
        preGet: _preGet,
        source: _source,
        // toast1
        toast1: _toast1,
        toast2: _toast2,
        toastBig:_toastBig
    };

});
