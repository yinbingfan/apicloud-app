var $;
var pageParam;
var i18n;
var server;
var countryStr;
var countryArray;
var countryId, countryCode, languageId; //变量名不能改，在location页面有调用
define(function(require) {
    server = require('sdk/server');
    require('sdk/common');
    // $ = app.util;
    i18n = require('sdk/i18n');
    i18n.tran();
    pageParam = api.pageParam;
    console.log(JSON.stringify(pageParam));
    var phoneCode = server.getCountryInfo();
    // console.error("___________"+phoneCode);
    var defaultCode = server.getCountryCode();
    console.log(defaultCode);
    $('#country-code')[0].innerHTML = defaultCode;
    countryArray = JSON.parse(phoneCode);
    countryArray.forEach(function(item) {
        if (item.countryPhoneCode == defaultCode) {
            countryId = item.countryId;
            countryCode = item.countryPhoneCode;
            languageId = item.languageId;
        }
    })
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
});
//点击选择区号
function clickPhoneCode() {
    api.openWin({
        name: 'location',
        url: '../location/temp.html',
        pageParam: {
            type: 1,
            pageName: "registerStepB",
            selectePhoneCode: $('#country-code')[0].innerHTML
        }
    });

}
//没用
function createOption2() {
    countryStr = [];
    countryArray.forEach(function(item) {
        var str = item.localeCountryName + "(+" + item.countryPhoneCode + ")"
        countryStr.push(str);
    })

    api.actionSheet({
        title: 'Select a Country',
        cancelTitle: "cancel",
        buttons: countryStr
    }, function(ret, err) {
        if (ret) {
            if (0 < ret.buttonIndex && ret.buttonIndex <= countryStr.length) {
                $('#country-code')[0].innerHTML = countryArray[ret.buttonIndex - 1].countryPhoneCode;
                countryId = countryArray[ret.buttonIndex - 1].countryId;
                languageId = countryArray[ret.buttonIndex - 1].languageId;
                countryCode = countryArray[ret.buttonIndex - 1].countryPhoneCode;
            }
        } else {
            //  alert( JSON.stringify( err ) );
        }
    });
}
//没用
function createOption(parentId, data, defaultCode1) {
    var parentId = document.getElementById(parentId);
    for (var i = 0; i < data.length; i++) {
        var opt = document.createElement('option');
        //设置option的值
        opt.innerHTML = data[i].code;
        opt.value = data[i].value;
        //定义option的自定义值
        opt.setAttribute('countryId', data[i].countryId);
        opt.setAttribute('languageId', data[i].languageId);
        opt.setAttribute('countryCode', data[i].code);
        parentId.appendChild(opt);
        if (data[i].code == defaultCode1) {
            opt.selected = true;
        }
    }
}
//没用
function convertPhoneCode(v) {
    array = JSON.parse(v);
    console.warn(v);
    var obj = [];
    array.forEach(function(item) {
        obj.push({
            value: item.localeCountryName + "(" + item.countryPhoneCode + ")",
            // name: item.countryPhoneCode,
            countryId: item.countryId,
            code: item.countryPhoneCode,
            languageId: item.languageId
        })
    });
    console.warn(JSON.stringify(obj));
    return obj;
}

var SMSTimer
var countdown;
//验证码倒计时器
function clock() {
    var ele = $("#request-code")[0];
    console.log(ele.innerHTML);
    if (ele.innerHTML == i18n.t("request")) {
        countdown = 60;
        ele.innerHTML = countdown + "s";
        console.log("request");
    } else if (ele.innerHTML == "0s") {
        console.log("0s");
        ele.innerHTML = i18n.t("request");
        $(ele).addClass("enable");
        window.clearInterval(SMSTimer);
    } else {
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
        console.log("not enable");
        return;
    }
    // var ele = $('#phone_code')[0];
    // var index = ele.selectedIndex;
    // var phoneCode = ele.options[index].text;
    // countryId = ele.options[index].getAttribute("countryId");
    // languageId = ele.options[index].getAttribute("languageId");
    var param = {
        phoneCode: trimStr($("#phone")[0].value),
        countryId: countryId,
        countryCode: countryCode,
        languageId: languageId
    }
    console.log("请求验证码参数" + JSON.stringify(param));
    server.ajax({
        url: appcfg.host+'/v1/api/app/register/getcode.json',
        method: 'get',
        timeout: 20,
        data: param,
        success: function(ret) {
            console.warn(JSON.stringify(ret));

            if (ret.code == "200") {

                // app.toast(ret.msg);
                $("#request-code").removeClass("enable");
                countdown = 60;
                $("#request-code")[0].innerHTML = countdown + "s"
                SMSTimer = window.setInterval("clock()", 1000);
            } else {
                // app.toast(ret.msg);
            }
        },
        error: function(err) {
            // app.toast(JSON.parse(err.msg).msg);
            console.log(JSON.stringify(err));
        }
    });
}

function t() {
    app.toast('Please enter your information');
}
//点击完成
function fnClickComplete() {
    //判断昵称、性别、生日、手机号、验证码是否填写完整
    console.log("登录界面————————————click login btn");
    //判断昵称、性别、生日、手机号、验证码是否填写完整
    // if(!$("#nickname")[0].value || $("#gender")[0].innerHTML=="Gender" || $("#birthday")[0].innerHTML=="Birthday" || !$("#phone")[0].value || !$("#sms-code")[0].value){
    if (!$("#phone")[0].value || !$("#sms-code")[0].value) {
        return;
    }
    var params = getUserData();

    params.phoneCode = trimStr($("#phone")[0].value);
    params.countryId = countryId;
    params.countryCode = countryCode;
    params.languageId = languageId;
    params.mainDeviceId = deviceId;
    params.clientType = clientType;
    params.timeZone = timeZone;
    params.smsCode = $("#sms-code")[0].value;
    params.userName = pageParam.userName;
    params.gender = pageParam.gender.toLowerCase();
    params.dateOfBirth = pageParam.dateOfBirth;
    params.email = pageParam.email;

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
            server.setToken(ret.msg);
            server.setUser(data);
            app.publish("changeUserInfo", "5");
            console.log("🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚55555555555555555555555555555")
            api.execScript({
                // name: 'index',
                // frameName: 'market',
                name: 'root',
                script: 'restartWebSocket();'
            });
            console.log("🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚🈚55555555555555555555555555555")
            if (data.userName && data.dateOfBirth && data.gender) {
                api.closeWin({
                    name: 'registerStepA'
                });
                api.closeWin({
                    name: 'login'
                });
                api.closeWin();
            } else {
                api.openWin({
                    name: 'userCenter',
                    url: '../userCenter/temp.html',
                    pageParam: {
                        from: 'registerStepB'
                    }
                });
            }
        },
        error: function(err) {
            // app.toast(JSON.stringify(err));
            console.log(JSON.stringify(err));
        }
    });
}

function fnClickLogin() {
    api.openWin({
        name: 'login',
        url: '../login/temp.html',
        pageParam: {}
    });
}
//检查输入是否正确
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
//判断手机号格式是否正确
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

function trimStr(str) {
    return str.replace(/\s+/g, "");
}
//统计用户数据
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
