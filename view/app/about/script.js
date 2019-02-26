var i18n;
var server;
var info;
var clickCount = 0;
define(function(require) {
    require('sdk/common');
    server = require('sdk/server')
    i18n = require('sdk/i18n')
    i18n.tran()
    server.removeLaunchView();
    $('#name').text(api.appName);
    $('#version').text("V" + api.appVersion);
    info = $('#info')[0];
    add("API: " + appcfg.host); //API
    add("LanguageId: " + server.getLanguageId())
    add("CountryId: " + server.getCountryId())
    add("CountryCode: " + server.getCountryCode())
    add("Language: " + server.getLanguageAABB())
    add("UILanguage: " + server.getUILanguageAABB())
    add("api.appVersion: " + api.appVersion)
    add("deviceId：" + api.deviceId)
    add("userId：" + server.getUser().userId)
    add("6-6-14:17"+"本地编译")

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
//添加输出的信息
function add(t) {
    var text1 = info.innerHTML + t + "<br>";
    info.innerHTML = text1
}
//复制显示的信息
function copy(t) {
    var clipBoard = api.require('clipBoard');
    clipBoard.set({
        value: info.innerHTML
    }, function(ret, err) {
        if (ret) {
            app.toast("复制成功")
                // alert(JSON.stringify(ret));
        } else {
            // alert(JSON.stringify(err));
        }
    });
}
//点击logo触发后门
function fnClick() {
    console.log("❤️");
    clickCount += 1
    if (clickCount < 4) {
        return
    } else {
        if (clickCount == 5) {
            $('#info_top')[0].style.display = "block"
            $('#info')[0].style.display = "block"
            $('#infos_top')[0].style.display = "none"
            $('#infos')[0].style.display = "none"
        } else if (clickCount == 10) {
            api.removePrefs({
                key: 'userinfo'
            });
            app.publish("changeUserInfo", "3");
            api.execScript({
                // name: 'index',
                // frameName: 'market',
                name: 'root',
                script: 'restartWebSocket();'
            });
            api.closeWin();
        }

    }
}
