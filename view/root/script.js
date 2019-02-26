var ipCountryCode = "";
var langAA; //设置的语言符号aa
var languageId = ""; //设置的语言id
var countryId = ""; //设置的国家id
var countryCode = ""; //设置的国家区号
var topicList = ["enBrief", "koBrief", "ruBrief", "jaBrief"];
var topic = "";
var server;
var i18n;
var mCountryInfos;
var socketStr;
var appState = 1;    //1: app打开状态    0:app后台状态
var price_key;

var wsOpenUrl;
define(function (require, exports, moudle) {
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran()
    wsOpenUrl = server.wsOpenUrl('socketServer')
    app.ready(function () {
      var openinstall = api.require('openinstall');
      openinstall.getInstall({
         timeout:20
      },function(ret, err){
      console.warn("AAAAAAAAAAAAAAAA"+JSON.stringify(ret));
      });
        //------监听手机进入后台，设置appState为false------
        api.addEventListener({
            name: 'pause'
        }, function(ret, err){
          closeWebsocket();       //进入后台关闭websocket
           appState = 0;
        });
          //-------监听手机从后台打开，设置appState为true-------
        api.addEventListener({
            name: 'resume'
        }, function(ret, err){
          send(socketStr,frameName,winName);        //从后台打开开启websocket
           appState = 1;
        });

        api.addEventListener({
            name: 'offline'
        }, function(ret, err){
          closeWebsocket();       //进入后台关闭websocket
        });
        api.addEventListener({
            name: 'online'
        }, function(ret, err){
          openWebsocket();        //从后台打开开启websocket
        });

        //------点击状态栏事件------
        api.addEventListener({
            name: 'noticeclicked'
        }, function (ret, err) {
            var appParam = ret.appParam;
            // alert("0"+JSON.stringify(appParam))
            if (api.systemType == 'ios') {
                app.storage.val("briefNotification", true);
                app.publish("briefNotification", "")
            } else {
                // alert("1"+JSON.stringify(ret))
                var sourceAppId = ret.sourceAppId;
                app.storage.val("briefNotification", true);
                  app.publish("briefNotification", "")
            }
        });
        setTimeout("server.removeLaunchView()", 8000); //默认最多8s后移除启动页
        checkNetworkAndNext();
        // openWebsocket();
        // versions()
    });
});

//功能：检测系统更新
function versions() {

    let clientType

    if (api.systemType == "ios") {
        clientType = 1
    } else {
        clientType = 0
    }

    let param = {
        clientType: clientType
    }

    server.ajax({
        url: appcfg.host+'/v1/api/app/user/queryAppVersion.json',
        method: 'post',
        data: param,
        success: (ret) => {

            let onlineVersion = ret.data.versionNum,
                localVersion = api.appVersion

            function num(version) {

                let a = version.toString(),
                    b = a.split('.'),
                    res = b.join('');

                return res;
            }

            if (num(onlineVersion) > num(localVersion)) {

                api.confirm({
                    msg: '您的版本过于老旧，需要进行升级',
                    buttons: ['升级', '退下']
                }, (ret, err) => {
                    let num = ret.buttonIndex;
                    if (num == 1) {

                        let url

                        if (api.systemType == "ios") {
                            url = 'https://itunes.apple.com/cn/app/daily-coin-world/id1359761213?mt=8'
                        } else {
                            url = 'https://play.google.com/store/apps/details?id=com.dbit'
                        }

                        api.openWin({
                            name: 'win_show2',
                            url: url,
                            rect: {
                                x: 0,
                                y: 0,
                            }
                        })
                    }
                })

            } else if (num(onlineVersion) == num(localVersion)) {
                console.log('是最新版' + '🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥')
            }
        },
        error: (err) => {
            api.toast({
                msg: err,
                duration: 2000,
                location: 'bottom'
            })
        }
    })
}

//功能：检测网络链接状态，
//--没有网络进入无网络状态页面
//--有网络开启app，同时打开websorket
function checkNetworkAndNext() {
    if (api.connectionType == "none") { //没有网络连接，提示
        server.removeLaunchView();      //移除启动图
        // $('#network-error')[0].style.display = "block";
        // app.toast(i18n.t("Network_error_please_try_again_later"));
    } else {
        $('#network-error')[0].style.display = "none";
        openWebsocket();                //进入app,有网络的情况下再开开websocket
    }
    startApp();
}

var startApp = function () {
  if (server.getUser()) {
    server.ajax({
        url: appcfg.host+'/v1/api/app/user/getUserInfo.json',
        method: 'post',
        data: {
            userId: server.getUser().userId,
            token: server.getToken(),
            systemLanguage: navigator.language,
            uiLanguage: server.getUILanguageAABB(),
            contentArea: server.getCountryId()
        },
        success: (ret) => {

        },
        error: (err) => {
          var num = JSON.stringify(err).indexOf("Token验证失败");
          if(num!=-1){
            api.removePrefs({
                key: 'portfolio_id'
            });
            api.removePrefs({
                key: 'userinfo'
            });
            api.removePrefs({    //登录成功清除未登录时已读数据
                key: 'newsReadArrayKey5'
            });
            app.publish("changeUserInfo", "7");
            api.execScript({
                name: 'root',
                script: 'restartWebSocket();'
            });
            // api.rebootApp();
          }
        }
    })
  }


    //判断是否设置过地区
    var isLocationSet = !server.isBlank(server.getSelectedLanguageAABB());
    if (!isLocationSet) {
        //未设置过地区
        console.log("未设置过地区");
        getCountryInfo(true); //从服务器获取语言国家信息，获取到后进行下一步操作
    } else {
        //设置过地区
        console.log("设置过地区");
        getCountryInfo(false); //从服务器获取语言国家信息，更新
        ipCountryCode = server.getSelectedLanguageAABB();
        mCountryInfos = JSON.parse(server.getCountryInfo());
        setCountryInfo();
    }
};

//获取后台设置的所有国家信息
function getCountryInfo(isNext) {
    //从服务器获取语言国家列表
    server.ajax({
        url: appcfg.host+'/v1/api/app/register/getCountryCode.json',
        data: {},
        timeout: 8,
        method: "POST",
        success: function (res) {
            mCountryInfos = res.data;
            server.setCountryInfo(res.data);
              // getPriceKey();
            if (isNext) {
                ipCountryCode = navigator.language
                setCountryInfo();
            }
        },
        error: function (err) {
            console.log("获取国家码失败" + JSON.stringify(err)); //4月19日
            mCountryInfos =  server.getCountryInfo();
            //优先取缓存数据
            if(!mCountryInfos) {
              mCountryInfos = JSON.parse('[{"countryId":"80","countryPhoneCode":"86","languageId":261,"countryCode":"CN","languageCode":"zh","localeCountryName":"China"},{"countryId":"261","countryPhoneCode":"1","languageId":77,"countryCode":"US","languageCode":"en","localeCountryName":"United States"},{"countryId":"144","countryPhoneCode":"81","languageId":152,"countryCode":"JP","languageCode":"ja","localeCountryName":"Japan"},{"countryId":"152","countryPhoneCode":"82","languageId":160,"countryCode":"KR","languageCode":"ko","localeCountryName":"South Korea"},{"countryId":"221","countryPhoneCode":"7","languageId":204,"countryCode":"RU","languageCode":"ru","localeCountryName":"Russia"},{"countryId":"68","countryPhoneCode":"375","languageId":204,"countryCode":"BY","languageCode":"ru","localeCountryName":"Belarus"},{"countryId":"258","countryPhoneCode":"380","languageId":204,"countryCode":"UA","languageCode":"ru","localeCountryName":"Ukraine"},{"countryId":"169","countryPhoneCode":"373","languageId":204,"countryCode":"MD","languageCode":"ru","localeCountryName":"Moldova"},{"countryId":"155","countryPhoneCode":"327","languageId":204,"countryCode":"KZ","languageCode":"ru","localeCountryName":"Kazakhstan"},{"countryId":"247","countryPhoneCode":"992","languageId":204,"countryCode":"TJ","languageCode":"ru","localeCountryName":"Tajikistan"},{"countryId":"146","countryPhoneCode":"331","languageId":204,"countryCode":"KG","languageCode":"ru","localeCountryName":"Kyrgyzstan"},{"countryId":"263","countryPhoneCode":"233","languageId":204,"countryCode":"UZ","languageCode":"ru","localeCountryName":"Uzbekistan"},{"countryId":"250","countryPhoneCode":"993","languageId":204,"countryCode":"TM","languageCode":"ru","localeCountryName":"Turkmenistan"},{"countryId":"48","countryPhoneCode":"994","languageId":204,"countryCode":"AZ","languageCode":"ru","localeCountryName":"Azerbaijan"},{"countryId":"110","countryPhoneCode":"995","languageId":204,"countryCode":"GE","languageCode":"ru","localeCountryName":"Georgia"},{"countryId":"38","countryPhoneCode":"374","languageId":204,"countryCode":"AM","languageCode":"ru","localeCountryName":"Armenia"},{"countryId":"223","countryPhoneCode":"966","languageId":34,"countryCode":"SA","languageCode":"ar","localeCountryName":"Saudi Arabia"}]')
              server.setCountryInfo(mCountryInfos);
            }else {
              mCountryInfos = JSON.parse(mCountryInfos)
            }
              // getPriceKey();
            if (isNext) {
                ipCountryCode = navigator.language
                setCountryInfo();
            }
        }
    });
}
//------处理默认货币选项---默认货币单位，根据 ip 适配（根据地域，显示对应初始货币单位，规则如下）
  // ○ 俄语国家=RUB
  // ○ 韩国=KRW
  // ○ 日本=JPY
  // ○ 中国=CNY
  // ○ 香港=USD
  // ○ 美国=USD
  // ○ 其余国家=USD

//通过手机系统获得的国家符号cn/hk/us/jp设置语言、国家id、默认手机区号
function setCountryInfo() {
    console.log("开机检测 setCountryInfo 国家码：" + ipCountryCode);

    var price_key_select = api.getPrefs({       //price_key_select--me页面选择货币时，存入该字符串
        key: 'price_key_select',
        sync: true
    });
    var price_key;
    mCountryInfos.forEach(function (item) {
        var countryCodeStr = item.countryCode;
        if (ipCountryCode.indexOf(countryCodeStr) >= 0) {

            console.warn("匹配的国家代码" + countryCodeStr);
            languageId = item.languageId;
            countryId = item.countryId;
            countryCode = item.countryPhoneCode;
            langAA = item.languageCode;
            topic = item.languageCode + "Brief";

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

            return false;
        }
        ;
    });
    if (server.isBlank(languageId)) { //浏览器语言未匹配，设置为默认的英语
        ipCountryCode = "en-US"
        langAA = "en-US";
        console.log("开机检测 浏览器语言未匹配，设置为默认的英语：" + langAA);
        languageId = 77;
        countryId = 261;
        countryCode = 1;
        topic = "enBrief"
          if(!price_key_select){
            api.setPrefs({
                key: 'price_key',
                value: "USD"
            });
          }

    }

    server.setLanguageAABB(langAA);
    server.setLanguageId(languageId);
    server.setCountryId(countryId);
    server.setCountryCode(countryCode);

    try {
        initPush(); //初始化推送
    } catch (err) {
        app.toast(err)
        console.log("初始化推送失败" + err)
    }


    server.removeLaunchView()
    api.openWin({
        name: 'index',
        url: '../app/index/temp.html',
        // url: '../app/me/temp.html',
        pageParam: {
            // type: "add"
        },
        animation:{
          type:"none",                //动画类型（详见动画类型常量）
          subType:"from_right",       //动画子类型（详见动画子类型常量）
          duration:300
        },
        slidBackEnabled: false
    });


}

//设置推送
function initPush() {
    var googlePush = api.require('googlePush');
    if (api.systemType == "android") {
        googlePush.initFcm(function (ret, err) {
            if (ret) {
                console.log("android push初始化成功" + JSON.stringify(ret));
            } else {
                // alert("android push init failed" + JSON.stringify(err));
            }
        });
    }
    googlePush.registerToken(function (ret, err) {
        if (ret) {
            console.log("android push 注册token成功" + JSON.stringify(ret));
        } else {
            console.log("android push regist token failed" + JSON.stringify(err));
        }
    });
    googlePush.addOnTokenRefreshLisener(function (ret) {
        // alert(JSON.stringify(ret));
    });
    //-----监听手机接收到通知推送事件-----
    googlePush.addOnMessageLisener(function (ret) {
        console.log(JSON.stringify(ret))


        if(api.systemType == 'ios'){
          //原始字符串
          var string = ret.aps.alert.body;

          string = string.replace(/\r\n/g,"<br>")         //替换所有的换行符
          string = string.replace(/\n/g,"<br>");
          string = string.replace(/\'/g, "\\'");           // ' 替换成  \'
          string = string.replace(/\"/g, "\\\"");           // " 替换成\"
          string = string.replace(/</g, "\\\<");           //  < 替换成\<
          string = string.replace(/>/g,"\\\>");           // " 替换成\"
          string = string.replace(/\s/g,"&nbsp;");         //替换所有的空格（中文空格、英文空格都会被替换）
          //输出转换后的字符串
          console.log(string);
          // -----苹果手机app打开状态下收到通知，手动进行推送-----
            if(appState == 1){
              // app.publish("iosNote","")
              api.execScript({
                  name: 'index',
                  // frameName: 'frmName',
                  script: "openIosNote('" + string + "')"
              });
            }
        }
    });
    var briefNotifyEnable = server.getBriefNotify();
    if (briefNotifyEnable) {
        mCountryInfos.forEach(function (item) {
          var params = {
              topic: item.languageCode +"Brief"+ appcfg.pushTest
          };
          googlePush.unsubscribeFromTopic(params);
        })

        var params = {
           topic: topic + appcfg.pushTest
       };
       console.log("设置推送的topic——" + params.topic);
       googlePush.subscribeToTopic(params);

    }

    //注册监听{"translatetitle":"1"}
    //app内点击{"detail":"push notification detail message","body":"body","title":"Your app name"}
    //app外打开{"google.sent_time":1521902726521,"google.ttl":2419200,"detail":"push notification detail message","body":"body","from":"408701081974","title":"Your app name","google.message_id":"0:1521902726528747%95e37ffd95e37ffd","collapse_key":"com.dbit"}
    api.addEventListener({
        name: 'appintent'                //被其他应用调起事件
    }, function (ret, err) {
      // alert(JSON.stringify(ret))
        var appParam = ret.appParam;
        if (api.systemType == 'ios') {
            app.storage.val("briefNotification", true);
            // app.publish("briefNotification", "")
            if (null != appParam["collapse_key"] || undefined != appParam["collapse_key"]) {
                app.storage.val("briefNotification", true);
                app.publish("briefNotification", "")
            }
        } else {
            var sourceAppId = ret.sourceAppId;
            app.storage.val("briefNotification", true);
            // app.publish("briefNotification", "")
            if (null != appParam["collapse_key"] || undefined != appParam["collapse_key"]) {
                app.storage.val("briefNotification", true);
                app.publish("briefNotification", "")
            }
        }
    });
}

//打开Websocket
var frameName, winName, ws, closeTimeList = [],userId = '', devicesId = api.deviceId
function openWebsocket(restartSendParam) {

    if (server.getUser()) {
        ws = new WebSocket(wsOpenUrl + server.getUser().userId);

        console.log('❎❎❎❎❎❎❎❎❎❎❎❎❎❎❎---------》连接userID' + server.getUser().userId);
        userId = server.getUser().userId
    } else {
        ws = new WebSocket(wsOpenUrl + api.deviceId);

        console.log('❌❌❌❌❌❌❌❌❌❌❌❌❌❌---------》连接deviceId'+wsOpenUrl + api.deviceId);
    }
    console.warn('userId>>>>>>>' + server.getUser().userId)
    console.warn('devicesId>>>>>>>' + devicesId)

    ws.onmessage = function (ret) {
        // console.log("🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂")

        console.log(frameName + "🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂")
        console.log(winName + "🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂")
        // console.log(JSON.stringify(ret.data) + "🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂🐂")
        api.execScript({
            frameName: frameName,
            name: winName,
            script: 'onMessage(' + ret.data + ')'
        })
    };


    ws.onopen = function (evt) {
        console.log("0⃣️连接成功" + "currencyName");

        if (!server.isBlank(restartSendParam)) {
            try {
                ws.send(JSON.stringify(restartSendParam))
            } catch (error) {

            }
        }
        if (closeTimeList.length >= 9) {
            let firstVal = closeTimeList.shift()
            let lastVal = closeTimeList.pop()
            if (lastVal - firstVal < 10) {
                 /**
                 *
                 * websocket超时上报
                 *
                 */
                api.toast('网络连接失败，请重试')
                server.ajax({
                    url: '/api/currency/sendAlert.json',
                    method: 'post',
                    data: {
                        devicesId: devicesId,
                        userId: userId
                    }

                })
            }
            closeTimeList = []
        }
    };

    ws.onclose = function (evt) {
            // restartWebSocket(socketStr) // 连接中断重连
        closeTimeList.push(Date.parse(new Date())) // 记录断连时间
        // api.toast({
        //     msg: i18n.t('connection_fail'),
        //     duration: 2000,
        //     location: 'bottom'
        // })
        setTimeout(function() {
            send(socketStr, frameName, winName)
        },300)

        console.log("❌❌❌❌❌❌❌❌❌❌❌❌❌❌");
        console.warn("🈲️️连接中断: " + JSON.stringify(evt));

    };

}
//给websocket发送信息
function send(str, frame_Name, win_Name) {
    console.log(JSON.stringify(str) + "🈲️" + frame_Name + "🈲️" + win_Name);
    socketStr = str
    frameName = frame_Name
    winName = win_Name
    // console.warn(JSON.stringify(str) + "websocket连接状态" + ws.readyState);
    if (api.connectionType != "none" && ws.readyState > 2 ||!ws.readyState) { //判断如果websocket已关闭，就重新打开
        openWebsocket(str);
    }
     else if (ws.readyState == 1) { //准备好通讯，可以发送数据
        ws.send(JSON.stringify(str))
    }

}
//关闭websocket
function closeWebsocket() {
    ws.close()
}
//重启websocket
function restartWebSocket() {
    closeWebsocket()
    openWebsocket(socketStr)
}
