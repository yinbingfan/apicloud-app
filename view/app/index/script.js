/*
 */
var server;
var i18n;
define(function(require) {
    server = require('sdk/server');
    require('sdk/common');
    var $ = app.util;
    i18n = require('sdk/i18n');
    i18n.tran();

    checkUpdate();

    var wwid = window.innerWidth;

    var $head = $('#head')[0];
    var $title = $('#title')[0];

    //如果是收到快讯通知点击打开App，切换到快讯页面，否则切换到新闻页面
    if (app.storage.val("briefNotification") == "true") {
        app.storage.val("briefNotification", false);
        app.window.popoverElement({
            id: 'view',
            name: 'newsHome',
            url: '../newsHome/temp.html',
            bounces: false,
            scrollEnabled: false,
            vScrollBarEnabled: false,
            hScrollBarEnabled: false,
            scaleEnabled: false,
            overScrollMode: 'never',
            reload: false,
            param: {
                from: "preLoad"
            }
        });
        //移除导航当前状态
        removeAllTabSelected()

        $('#home .icon')[0].style.display = "none";
        $('#home .icon')[1].style.display = "";

        $('.foot .cur')[0].classList.remove('cur');
        $('#home')[0].classList.add('cur');

    } else {                                             //默认加载页面
        app.window.popoverElement({
            id: 'view',
            name: 'newsHome',
            url: '../newsHome/temp.html',
            bounces: false,
            scrollEnabled: false,
            vScrollBarEnabled: false,
            hScrollBarEnabled: false,
            scaleEnabled: false,
            overScrollMode: 'never',
            reload: false,
            param: {
                from: "preLoad"
            }
        });
    }
    //首页Frame切换
    $('.foot').on('touchstart', '[active]', function(e) {
        var target = e.target;
        var tid = target.getAttribute('id');
        if (target.className.indexOf('cur') !== -1) {
            return null;
        }
        if (e.detail) {
            setTimeout(function() {
                $(target)[0].classList.remove('active');
            }, 0);
        }
        //移除导航当前状态
        removeAllTabSelected()
        //点击底部导航切换页面
        switch (tid) {
            case "home":
                $('#home .icon')[0].style.display = "none";
                $('#home .icon')[1].style.display = "";
                app.window.popoverElement({
                    id: 'view',
                    name: 'newsHome',
                    url: '../newsHome/temp.html',
                    bounces: false,
                    scrollEnabled: false,
                    vScrollBarEnabled: false,
                    hScrollBarEnabled: false,
                    scaleEnabled: false,
                    overScrollMode: 'never',
                    reload: false,
                    param: {
                        from: "preLoad"
                    }
                });
                api.setPrefs({                         //作用：首页打开新闻列表页面时用该参数
                    key: 'pages',
                    value: 'newsHome'
                })
                 api.execScript({                     //目的：点击首页标签切换到首页对应的导航页
                     name: 'index',
                     frameName: 'newsHome',
                     script: 'loadFrame()'
                 });
                break;
            case "discover":
                $('#discover .icon')[0].style.display = "none";
                $('#discover .icon')[1].style.display = "";

                app.window.popoverElement({
                    id: 'view',
                    name: 'marketContainer',
                    url: '../marketContainer/temp.html',
                    bounces: false,
                    scrollEnabled: false,
                    vScrollBarEnabled: false,
                    hScrollBarEnabled: false,
                    scaleEnabled: false,
                    overScrollMode: 'never',
                    reload: false
                });
                api.setPrefs({
                    key: 'pages',
                    value: 'market'
                });
                break;
            case "wiki":
                $('#wiki .icon')[0].style.display = "none";
                $('#wiki .icon')[1].style.display = "";
                app.window.popoverElement({
                    id: 'view',
                    name: 'wikiIndex',
                    url: '../wikiIndex/temp.html',
                    bounces: false,
                    scrollEnabled: false,
                    vScrollBarEnabled: false,
                    hScrollBarEnabled: false,
                    scaleEnabled: false,
                    overScrollMode: 'never',
                    reload: false
                });
                api.setPrefs({
                    key: 'pages',
                    value: 'wikiIndex'
                });
                break;

            case "member":
                $('#member .icon')[0].style.display = "none";
                $('#member .icon')[1].style.display = "";
                app.window.popoverElement({
                    id: 'view',
                    name: 'member',
                    url: '../me/temp.html',
                    bounces: false,
                    scrollEnabled: false,
                    vScrollBarEnabled: false,
                    hScrollBarEnabled: false,
                    scaleEnabled: false,
                    overScrollMode: 'never',
                    reload: false
                });
                api.setPrefs({
                    key: 'pages',
                    value: 'member'
                });
                api.sendEvent({
                  name: 'clickMe',
              });

                break;
            default:
                break;
        }

        $('.foot .cur')[0].classList.remove('cur');
        $(target)[0].classList.add('cur');

        //对应主frame
        api.bringFrameToFront({
            from: tid
        });
        //对应子frame
        switch (tid) {
            case "home":
                api.bringFrameToFront({
                    from: server.getNewsTopFrame()
                });
                break;
            case "product":
                api.bringFrameToFront({
                    from: server.getBriefTopFrame()
                });
                break;
            case "discover":
                api.execScript({
                    name: 'index',
                    frameName: 'marketContainer',
                    script: 'try{loadFrame();}catch(e){console.warn(JSON.stringify(e))}'
                });
                break;
            case "member":
                break;
            default:
        }
    });
    //两次退出
    var first = null;
    api.addEventListener({
        name: 'keyback'
    }, function(ret, err){
        if (!first) {
            first = new Date().getTime();
            api.toast({
                msg: i18n.t('tap_again_to_exit'),
                duration:1500,
                location: 'bottom',
                // global: true
            });
            setTimeout(function() {
                first = null;
            }, 1500);
        } else {
            if (new Date().getTime() - first < 1500) {
                api.closeWidget({
                    silent:true
                });
            }
        }
    });
    //返回拦截
    // app.key('keyback', function() {
    //     if ($('#home')[0].className.indexOf('cur') === -1) {
    //         return $('#home').trigger('touchstart', {
    //             from_back: true
    //         });
    //     }
    //     app.exit();
    // });
    var footHeight = $('#footer')[0].offsetHeight;
    server.setFooterHeight(footHeight);

    //收到快讯通知点击后切换到快讯页面
    app.subscribe("briefNotification", function(msg) {
        console.warn("index页面接受订阅");
        app.window.popoverElement({
            id: 'view',
            name: 'newsHome',
            url: '../newsHome/temp.html',
            bounces: false,
            scrollEnabled: false,
            vScrollBarEnabled: false,
            hScrollBarEnabled: false,
            scaleEnabled: false,
            overScrollMode: 'never',
            reload: false,
            param: {
                from: "preLoad"
            }
        });
        //移除导航当前状态
        removeAllTabSelected();

        $('#home .icon')[0].style.display = "none";
        $('#home .icon')[1].style.display = "";

        $('.foot .cur')[0].classList.remove('cur');
        $('#home')[0].classList.add('cur');
        // api.bringFrameToFront({
        //     from: 'briefList'
        // });
        api.execScript({
            name: 'index',
            frameName: 'newsHome',
            script: "funcGoto('"+ msg +"');"
        });



    });

    if (server.getUser()) {
        fnGetUserInfo();
    }
    track();
    // getWapVersion();

});
//先取消底部按钮选中效果
function removeAllTabSelected(){
  $('#home .icon')[0].style.display = "";
  $('#home .icon')[1].style.display = "none";
  // $('#product .icon')[0].style.display = "";
  // $('#product .icon')[1].style.display = "none";
  $('#discover .icon')[0].style.display = "";
  $('#discover .icon')[1].style.display = "none";
  $('#wiki .icon')[0].style.display = "";
  $('#wiki .icon')[1].style.display = "none";
  $('#member .icon')[0].style.display = "";
  $('#member .icon')[1].style.display = "none";
}

//从服务器获取用户信息，更新本地信息
function fnGetUserInfo() {
  server.ajax({
    url: appcfg.host+'/v1/api/app/user/getUserInfo.json',
    data:{
        userId: server.getUser().userId,
        token: server.getToken(),
        systemLanguage: navigator.language,
        contentArea: server.getCountryId(),
        uiLanguage: server.getUILanguageAABB()
    },
    success:function(ret){
      console.log("打开首页获取用户信息" + JSON.stringify(ret));
      server.setUser(ret.data);
      app.publish("changeUserInfo", "4");
    },
    error:function(err){
      console.log(JSON.stringify(err));
      // app.toast(JSON.stringify(err));
    }
  })

}
//从服务器检查更新，服务器设置文本格式需如下：
/*
{"ch":"中文更新文本","en":"英文更新文本","ja":"日语更新文本","ru":"俄语更新文本"}
*/
function checkUpdate() {
    var reStart = api.getPrefs({
        key: 'rebootApp',
        sync: true,
    });
    // 切换语言重启APP时，不执行检测版本更新
    if(reStart) {
      api.removePrefs({
          key: 'rebootApp'
      });
      getCountryStrByIp();
      return;
    }
    var url = appcfg.host+'/v1/api/app/user/appVersion.json'
    var clientType;
    if (api.systemType == "ios") {
        clientType = 1
    } else {
        clientType = 0
    }
    server.ajax({
        url: url,
        data: {
            clientType: clientType,
            versionNum: api.appVersion,
        },
        success: function(ret) {
            console.warn("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥" + JSON.stringify(ret));
            if (server.isBlank(ret.data)) {
                getCountryStrByIp();
                return
            }
            var updateText;
            updateText = ret.data.remark

            //1:强制升级
            if (ret.data.forcedFlag == 1) {
              var param = {
                  title: i18n.t("upgrade"),
                  buttons: [i18n.t('upgrade_now')]
              }
              if (!server.isBlank(updateText)) {
                  param.msg = updateText
              }
              api.alert(param, function(ret, err) {
                  if(ret.buttonIndex == 1) {
                      api.openApp({
                          androidPkg: 'android.intent.action.VIEW',
                          mimeType: 'text/html',
                          uri: "https://play.google.com/store/apps/details?id=com.dbit",
                          iosUrl: "https://itunes.apple.com/cn/app/dbit/id1411329952?mt=8"
                      }, function(ret, err) {
                        api.closeWidget({
                            silent:true
                        });
                      });
                  }else {

                  }
                  if(api.systemType == "ios") {
                    api.closeWidget({
                        silent:true
                    });
                  }
              });
            //1:可选择性更新
            }else {
              var param = {
                  title: i18n.t("update"),
                  buttons: [i18n.t('update_btn'), i18n.t('later')]
              }
              if (!server.isBlank(updateText)) {
                  param.msg = updateText
              }
              api.confirm(param, function(ret, err) {
                  if (ret.buttonIndex == 1) {
                      api.openApp({
                          androidPkg: 'android.intent.action.VIEW',
                          mimeType: 'text/html',
                          uri: "https://play.google.com/store/apps/details?id=com.dbit",
                          iosUrl: "https://itunes.apple.com/cn/app/dbit/id1411329952?mt=8"
                      }, function(ret, err) {

                      });
                  }else{
                      getCountryStrByIp();
                  }
              })
            }
        },
        error: function(err) {
            getCountryStrByIp();
            console.warn("🔥" + JSON.stringify(err));
        }
    })
}
//数据埋点
function track() {
    server.ajaxTrack({
        url: appcfg.host+'/v1/api/app/eventTrack/sendTrackUser.json',
        data: {
            countryId: server.getCountryId(),
            languageId: server.getLanguageId()
        },
        success: function(ret) {

        },
        error: function(err) {
            console.log(JSON.stringify(err));
        }
    })
}

//获取wap端版本号
function getWapVersion() {
    jQuery.ajax({
        url: appcfg.host+'/v1/api/app/user/queryWapVersion.json',
        type: "GET",
        data: {},
        success: function(ret) {
            console.log("WAP端版本号" + JSON.stringify(ret)); //{"code":"200","msg":"성공","data":"20180416010"}
            server.setWapVersionCode(ret.data)
        },
        error: function(err) {
            console.log(JSON.stringify(err));
        }
    })
}

//获取ip地址和国家符号cn,hk,tw,kr,us,jp,ru,kz(哈萨克斯坦)，by(白俄罗斯)
//后台异步获取ip地址
function getCountryStrByIp() {
    var ipUrl = "http://ip-api.com/json"
        // var ipUrl = "http://freegeoip.net/json/?callback=?"
    jQuery.ajax({
        url: ipUrl,
        data: {},
        type: "GET",
        timeout: 8000,
        success: function(res) {
            console.log("获取ip地址成功" + JSON.stringify(res));
            var ipCountryCode = res.countryCode;
            console.log("系统语言——" + navigator.language + "  IP获取的国家码" + ipCountryCode);
            var isLocationSet = !server.isBlank(server.getSelectedLanguageAABB());
            if (!isLocationSet) {
                //如果和当前内容语言不一致，弹窗提示是否要切换
                if (navigator.language.indexOf(ipCountryCode) < 0) {
                    console.log("系统语言——" + navigator.language + "IP获取的国家码" + ipCountryCode);

                    var mCountryInfos = server.getCountryInfo();
                    mCountryInfos = JSON.parse(server.getCountryInfo());
                    var langAA; //设置的语言符号aa
                    var languageId = ""; //设置的语言id
                    var countryId = ""; //设置的国家id
                    var countryCode = ""; //设置的国家区号
                    var countryName;
                    mCountryInfos.forEach(function(item) {
                        var countryCodeStr = item.countryCode;
                        if (ipCountryCode.indexOf(countryCodeStr) >= 0) {
                            console.log("匹配的国家代码" + countryCodeStr);
                            languageId = item.languageId;
                            countryId = item.countryId;
                            countryCode = item.countryPhoneCode;
                            langAA = item.languageCode;
                            countryName = item.localeCountryName;
                            return false;
                        };
                    });
                    if (!server.isBlank(languageId)) {
                        var text = "Detected that your ip is in " + countryName + ". Switch to " + countryName + " content?";
                        switch (server.getUILanguageAABB().substring(0, 2)) {
                            case "ru":
                                text = "Обнаружили, что ваш ip находится в Южной" + countryName + ". Переключиться на " + countryName + " контент?"
                                break;
                            case "ja":
                                text = "あなたの居場所が" + countryName + "にあることが検出されました。" + countryName + "のコンテンツに切り替えますか？"
                                break;
                            case "ko":
                                text = "당신의 IP가 " + countryName + "에 있다는 것을 감지했습니다. " + countryName + " 콘텐츠로 전환 하시겠습니까?"
                                break;
                            case "zh":
                                text = "检测到你的IP在" + countryName + "，是否切换到" + countryName + "内容？"
                                break;
                            default:

                        }
                        // Обнаружили, что ваш ip находится в Южной Корее[]. Переключиться на корейский[] контент?
                        // Detected that your ip is in South Korea. Switch to Korean[] content?
                        // 당신의 IP가 []에 있다는 것을 감지했습니다. 한국어[] 콘텐츠로 전환 하시겠습니까?
                        // あなたの居場所が韓国[]にあることが検出されました。韓国[]のコンテンツに切り替えますか？

                        api.confirm({
                            title: i18n.t('confirm'),
                            msg: text,
                            buttons: [i18n.t('confirm'), i18n.t('cancel')]
                        }, function(ret, err) {
                            if (ret) {
                                if (ret.buttonIndex == 1) {
                                    server.setSelectedCountryId(countryId);
                                    server.setSelectedCountryCode(countryCode);
                                    server.setSelectedLanguageId(languageId);
                                    server.setSelectedLanguageAABB(langAA);
                                    api.execScript({
                                        // name: 'index',
                                        // frameName: 'market',
                                        name: 'root',
                                        script: 'closeWebsocket();'
                                    });
                                    var price_key_select = api.getPrefs({       //price_key_select--me页面选择货币时，存入该字符串
                                        key: 'price_key_select',
                                        sync: true
                                    });
                                    if(!price_key_select){
                                      if(countryCode == "ru") {
                                         price_key = "RUB";
                                      }else if(countryId == 152) {
                                         price_key = "KRW";
                                      }else if(countryId == 144) {
                                         price_key = "JPY";
                                      }else if(countryId == 80) {
                                         price_key = "CNY";
                                      }else if(countryId == 261) {
                                         price_key = "USD";
                                      }else{
                                        price_key = "USD";
                                      }
                                      api.setPrefs({
                                          key: 'price_key',
                                          value: price_key
                                      });
                                    }
                                    api.setPrefs({
                                        key: 'rebootApp',
                                        value: '1'
                                    });
                                    api.rebootApp();
                                }
                            }
                        });

                    }

                }
            }
        },
        error: function(err) {
            console.warn("获取ip地址失败" + JSON.stringify(err));
        }
    });
}

//后台记录用户信息
function getUserData() {
    console.log("🔥");
    /*
     * 智能机浏览器版本信息:
     *
     */
    var browser = {
        versions: function() {
            var u = navigator.userAgent,
                app = navigator.appVersion;
            return { //移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }
    console.log("浏览器内核" + JSON.stringify(browser));
    console.log("浏览器内核" + (browser));
    var param = {
        utmSource: 0,
        //来源渠道
        lastOnlineDevice: api.deviceId,
        //最后上线设备
        lastOnlineIp: server.getIp(),
        //最后上线ip
        lastDeviceId: api.deviceId,
        //主设备id，更新为最后上线设备ID
        clientType: (api.systemType == "ios") ? 1 : 0,
        lastDeviceType: api.uiMode,
        //主设备类型，更新为最后上线设备
        deviceUid: api.deviceId, //万一拿不到，new一个id
        //如果拿不到，我们就给一个唯一id
        deviceId: api.deviceId,
        //设备id
        deviceType: api.uiMode,
        //Desktop,Console,EReader,MediaHub,Mobile,SmallScreen,SmartPhone,SmartWatch,Tablet,SmartTv, UnKnow

        // deviceInfo
        brand: api.deviceModel,
        //品牌 ，sansang,xiaomi,huawei
        platform: api.systemType,
        //android,ios
        platformVersion: api.systemVersion,
        //版本 11.2, android 6
        platformLanguage: navigator.language,
        //系统语言
        model: api.deviceModel,
        //类型iPhone 5S	,iPhone 6S
        browser: "WebKit",
        //浏览器内核
        screenWidth: api.screenWidth,
        //屏幕宽
        screenHeight: api.screenHeight,
        //屏幕高
        idfa: "",
        advertisingID: "",
        imei: api.deviceId,
        deviceId: api.deviceId,
        contentArea: server.getCountryId(),
        countryName: server.getIpCountry(),
        regionName: server.getRegionName(),
        cityName: server.getCity(),
        mobileBrand: api.deviceModel,
        brand: api.deviceModel,
        platform: api.systemType,
        platformVersion: api.systemVersion,
        systemLanguage: navigator.language,
        model: api.deviceModel,
        browser: "TODO"
    }
    console.log(JSON.stringify(param));
    return param;
}

// 监听到IOS在打开app状态下收到推送事，执行该方法   （在root中调用）
function openIosNote(text) {
  api.openFrame({
      name: 'iosNote',
      url: '../iosNote/temp.html',
      rect: {
          x: 0,
          y: 0,
          w: "auto",
          h: "auto"
      },
      pageParam: {
          name: text
      },
      bounces: false,
      reload: true,
      bgColor: 'rgba(0,0,0,0)',
      vScrollBarEnabled: true,
      hScrollBarEnabled: true,
      animation: {
        type:"movein",                //动画类型（详见动画类型常量）
        subType:"from_bottom",       //动画子类型（详见动画子类型常量）
        duration:300                //动画过渡时间，默认300毫秒
    }
  });

}

// 第一次登录成功弹窗
function loginToast(title,text) {
   server.toast2(title,text)
}

// 老用户升级到DTT版本登录提示
function oldToast(title,text) {
   server.toastBig()
}
