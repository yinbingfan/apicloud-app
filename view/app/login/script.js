var $;
var server;
var i18n;
var countryStr;
var countryArray;
var countryId, countryCode, languageId; //变量名不能改，在location页面有调用
var from;

var SMSTimer
var countdown;
var b=0;
var inviterId = "";
var openinstall;


define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();

    // 请求要请人ID
    openinstall = api.require('openinstall');
    openinstall.getInstall({
       timeout:20
    },function(ret, err){
      console.warn("AAAAAAAAAAAAAAAA"+JSON.stringify(ret));
      if(ret.data) {
        inviterId = JSON.parse(ret.data).uid
      }
    });
    //监听系统进入后台事件，解决计时器停止问题
    api.addEventListener({
      name:'pause'
      }, function(ret, err){
        //  alert(0)
          if(countdown>0 && countdown<60){
              b=Date.now();
              // alert(b)
          }
      });

      api.addEventListener({
          name:'resume'
        }, function(ret, err){
          if(b){
            var ele = $("#request-code")[0];
            var betweenMs = Date.now() - b;
            var  betweens = Math.floor(betweenMs / 1000);
            // betweenTime = Math.floor(betweens / 60);
            // console.log('间隔:' + betweenTime + '分钟');
            var num =  countdown-betweens;
            if(num>0){
              countdown=num;
              ele.innerHTML = countdown + "s";
            }else{
              ele.innerHTML = i18n.t("request");
              // ele.innerHTML = "request";
              $(ele).addClass("enable");
              window.clearInterval(SMSTimer);
            }
          }

      });

    from = api.pageParam.from
        // $ = app.util;
    $(".back").click(function(){

        api.closeWin();
    });

    app.subscribe('closeLoginWin', function(msg){
      setTimeout(function() {
        api.closeWin({
          name:msg
        });
      },500)

    });
    var defaultCode = server.getCountryCode();
    $('#country-code')[0].innerHTML = defaultCode;
    var phoneCode = server.getCountryInfo();
    countryArray = JSON.parse(phoneCode);
    countryArray.forEach(function(item) {
        if (item.countryPhoneCode == defaultCode) {
            countryId = item.countryId;
            countryCode = item.countryPhoneCode;
            languageId = item.languageId;
        }
    })
    console.log(defaultCode);
    $('#phone').keyup(function(e) {
        var phoneNum = this.value.trim();
        console.log(JSON.stringify(e));
        //如果是删除按键，则什么都不做
        if (e.keyCode === 8) {
            this.value = phoneNum;
            return;
        }
        var len = phoneNum.length;
        if (len === 3 || len === 8) {
            phoneNum += ' ';
            this.value = phoneNum;
        }
    })

    // 安卓手机实现仿ios右滑返回功能
    if (api.systemType == "android") {
      api.addEventListener({
          name:'swiperight'
      }, function(ret, err){
         api.closeWin({
         });

      });
    }
});
//点击区号，切换
function clickPhoneCode() {
    api.openWin({
        name: 'location',
        url: '../location/temp.html',
        pageParam: {
            type: 1,
            pageName: "login",
            selectePhoneCode: $('#country-code')[0].innerHTML
        }
    });

}

//返回
function fnClickBack() {
    api.closeWin({
        name: 'registerStepA'
    });
    api.closeWin();
}

function fnClickPhoneCode() {
    // alert("fnClickPhoneCode");
}




//验证码倒计时
function clock() {
    var ele = $("#request-code")[0];
    console.warn(i18n.t("request"));
    if (ele.innerHTML == i18n.t("request")) {
        countdown = 60;
        ele.innerHTML = countdown + "s";
    } else if (ele.innerHTML == "0s") {
        ele.innerHTML = i18n.t("request");
        // ele.innerHTML = "request";
        $(ele).addClass("enable");
        window.clearInterval(SMSTimer);
    } else {
        // console.log(countdown + "s");
        countdown = countdown - 1;
        ele.innerHTML = countdown + "s";
    }
}


//请求验证码
function fnClickRequest() {
    if (!$("#request-code").hasClass("enable")) {
        console.log("not enable");
        return
    }
    if ($("#request-code")[0].innerHTML != i18n.t("request")) {
        console.log("not enable");
        return;
    }
    if ($("#phone")[0].value == "") {
        app.toast('please enter you phone number');
        return;
    }
    if(api.connectionType == "none") {
        app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
        return;
    }
    // var ele = $('#phone_code')[0];
    // var index = ele.selectedIndex;
    // var phoneCode = ele.options[index].text;
    // var countryId = ele.options[index].getAttribute("countryId");
    var param = {
        phoneCode: trimStr($("#phone")[0].value),
        countryId: countryId,
        countryCode: countryCode,
        languageId: languageId
    }
    console.log("请求验证码参数" + JSON.stringify(param));
    // $('#loading-anim')[0].style.display = "block";
    server.ajax({
        url: appcfg.host+'/v1/api/app/register/getcode.json',
        method: 'get',
        timeout: 20,
        data: param,
        success: function(ret) {
            if (ret.code != 200) {
                app.toast(ret.msg);
                return;
            }
            // $('#loading-anim')[0].style.display = "none";
            app.toast(i18n.t('Send_successfully'));
            $("#request-code").removeClass("enable");
            countdown = 60;
            $("#request-code")[0].innerHTML = countdown + "s"
            SMSTimer = window.setInterval("clock()", 1000);

        },
        error: function(err) {
            // $('#loading-anim')[0].style.display = "none";
            // app.toast(err.body.msg);
            console.log(JSON.stringify(err));
        }
    });
}

function t() {
    app.toast('Please enter your information');
}

//点击登陆
function fnClickComplete() {
    var input = document.getElementById("sms-code");
    input.blur()
    console.log("登录界面————————————click login btn");
    //判断昵称、性别、生日、手机号、验证码是否填写完整
    // if(!$("#nickname")[0].value || $("#gender")[0].innerHTML=="Gender" || $("#birthday")[0].innerHTML=="Birthday" || !$("#phone")[0].value || !$("#sms-code")[0].value){
    if (!$("#phone")[0].value || !$("#sms-code")[0].value) {
        return;
    }
    if(api.connectionType == "none") {
        app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
        return;
    }
    var clientType, deviceId, timeZone;
    deviceId = api.deviceId;
    if (api.systemType == "android") {
        clientType = 0;
    } else {
        clientType = 1;
    }
    var d = new Date();
    timeZone = d.getTimezoneOffset();
    timeZone = timeZone / 60;
    var params = getUserData()
    params.phoneCode = trimStr($("#phone")[0].value);
    params.countryId = countryId;
    params.countryCode = countryCode;
    params.languageId = languageId;
    params.mainDeviceId = deviceId;
    params.clientType = clientType;
    // params.timeZone = timeZone;
    params.timeOffset = d.getTimezoneOffset();
    params.inviterId = inviterId;
    params.smsCode = $("#sms-code")[0].value;
    server.ajax({
        url: appcfg.host+'/v1/api/app/register/login.json',
        method: 'post',
        timeout: 10,
        data: params,
        success: function(ret) {
            console.log("登陆界面，登陆ret——————————" + JSON.stringify(ret));
            if (ret.code != 200) {
                app.toast(ret.msg);
                return;
            }

            var data = ret.data;
            api.removePrefs({    //登录成功清除未登录时已读数据
                key: 'newsReadArrayKey5'
            });
            server.setToken(ret.data.token); //存储 token
            server.setUser(ret.data.userInfo);
            var title = i18n.t("Registration success");
            var text = ret.data.initCredit;
            var loginStatus = ret.data.loginStatus;  //0注册  1老用户更新  2.正常登录
            api.execScript({                                                      //登陆成功，设置循环调用用户信息（me）
                name: 'index',
                frameName: 'member',
                script: 'userInterval();'
            });
            api.execScript({                                                      //登陆成功，刷新me页面积分信息（me）
                name: 'index',
                frameName: 'member',
                script: 'getTotalDtt();'
            });
            // api.execScript({                                                      //刷新新闻缓存数据
            //     name: 'index',
            //     frameName: 'subNews',
            //     script: 'getNewsList(1);'
            // });
            console.log(" login changeUserInfo before 🐄🐄🐄🐄🐄🐄🐄11111");
            app.publish("changeUserInfo", JSON.stringify(ret.data));
            console.log(" login changeUserInfo before 🐄🐄🐄🐄🐄🐄🐄22222");
            api.closeWin({
                name: 'entry'
            });
            console.log("😯😯😯😯😯😯😯😯😯😯😯😯😯 111111111")
            api.execScript({
                // name: 'index',
                // frameName: 'market',
                name: 'root',
                script: 'restartWebSocket();'
            });
            console.log("😯😯😯😯😯😯😯😯😯😯😯😯😯 2222222")

            if (data.userName && data.dateOfBirth && data.gender) {

                api.closeWin({
                    name: 'registerStepA'
                });
                api.closeWin();

            } else {
              var firstLogin;
              // 新注册弹窗
              if(ret.data.loginStatus == 0) {
                openinstall.reportRegister(); //上报注册量
                if (api.pageParam.type == "shoucang") {                //未登录，新闻详情点击收藏，登录成功刷新新闻详情页面
                  api.execScript({
                      name: 'detail',
                      script: "loginToast('"+title+"',"+text+")"
                  });
                }
                if (api.pageParam.type == "airdrop"){                //从airdrop页登录
                  api.execScript({
                      name: 'airdrop',
                      // frameName: 'airList',
                      script: "loginToast('"+title+"',"+text+")"
                  });
                }
                if (api.pageParam.type == "index") {
                  api.execScript({
                      name: 'index',
                      // frameName: 'member',
                      script: "loginToast('"+title+"',"+text+")"
                  });
                }

              }
              // 老用户升级到DTT功能版本弹窗
              if(loginStatus == 1) {

                  if (api.pageParam.type == "shoucang") {                //未登录，新闻详情点击收藏，登录成功刷新新闻详情页面
                    api.execScript({
                        name: 'detail',
                        script: "oldToast()"
                    });
                  }
                  if (api.pageParam.type == "airdrop"){                //从airdrop页登录
                    api.execScript({
                        name: 'airdrop',
                        frameName: 'airList',
                        script:  "oldToast()"
                    });
                  }
                  if (api.pageParam.type == "index") {
                    api.execScript({
                        name: 'index',
                        // frameName: 'member',
                        script:  "oldToast()"
                    });
                  }
              }


              if (api.pageParam.type == "shoucang") {                //未登录，新闻详情点击收藏，登录成功刷新新闻详情页面
                api.execScript({
                    name: 'detail',
                    // frameName: 'frmName',
                    script: "getDetails()"
                });
              }
              if (api.pageParam.type == "airdrop"){                //从airdrop页登录,刷新页面数据
                api.execScript({
                    name: 'airdrop',
                    frameName: 'airList',
                    script:  "reset()"
                });
              }
              if (api.pageParam.type == 1) {
                api.openWin({
                    name: 'userCenter',
                    url: '../userCenter/temp.html',
                    pageParam: {
                        from: 'login',
                        num: ret.data.loginStatus,
                        title: title,
                        text: text
                    }
                });
              }

                api.closeWin({
                    animation: {
                        type: "none"
                    }
                });

                var title = i18n.t("login");
                var text = 8;


            }
        },
        error: function(err) {
            // app.toast(err.body.msg);
            console.log(JSON.stringify(err));
        }
    });
}
//点击注册
function fnClickRegister() {
    api.openWin({
        name: 'registerStepA',
        url: '../registerStepA/temp.html',
        pageParam: {}
    });
}
//检查输入
function check(event) {
    if (isValidPhone($("#country-code").text(), $("#phone")[0].value)) {
        $('#request-code').addClass("enable")
    } else {
        $('#request-code').removeClass("enable")

    }
    if (!isValidPhone($("#country-code").text(), $("#phone")[0].value) || !$("#sms-code")[0].value) {
        $("#complete")[0].classList.remove("enable");
    } else {
        $("#complete")[0].classList.add("enable");
    }
}
/*
| 韩国 | +82 | 9位 |
| 泰国 | +66 | 9位 |
| 日本 | +81 | 10位 |
| 俄罗斯 | +7 | 10位 |
| 中国 | +86 | 11位 |
| 其他国家 | | 8位 |
*/
// 判断手机号是否正确输入
function isValidPhone(pre, num) {
    while (num.indexOf(" ") > 0) {
        num = num.replace(" ", "")
        console.log(num);
        console.log(pre + "," + num.length);
    }
    switch (parseInt(pre)) {
        case 82:
            if (num.length >= 9) {
                return true
            }
            break;
        case 66:
            if (num.length >= 9) {
                return true
            }
            break;
        case 81:
            if (num.length >= 10) {
                return true
            }
            break;
        case 7:
            if (num.length >= 10) {
                return true
            }
            break;
        case 86:
            if (num.length >= 11) {
                return true
            }
            break;
        default:
            if (num.length >= 8) {
                return true
            }
            break;
    }
}

function convertPhoneCode(v) {
    array = JSON.parse(v);
    console.warn(v);
    var obj = [];
    array.forEach(function(item) {
        obj.push({
            value: item.localeCountryName + "(+" + item.countryPhoneCode + ")",
            // name: item.countryPhoneCode,
            countryId: item.countryId,
            code: item.countryPhoneCode,
            languageId: item.languageId
        })
    });
    console.warn(JSON.stringify(obj));
    return obj;
}
//去掉空格
function trimStr(str) {
    return str.replace(/\s+/g, "");
}
//跟踪用户数据
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
        browser: "TODO",
        uiLanguage: server.getUILanguageAABB()
    }
    console.log(JSON.stringify(param));
    return param;
}
