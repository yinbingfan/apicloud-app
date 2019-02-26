/**
 * member
 */
var languageCode;
var server;
define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    var i18n = require('sdk/i18n');
    i18n.tran();
    language = server.getLanguageAABB().substring(0, 2);

    var googlePush = api.require('googlePush');
    var briefNotificationEnable = server.getBriefNotify();
    if (briefNotificationEnable) {
        notification = {
            all: 1,
            brief: 1
        }
    }
    // var all = notification.all;
    // var brief = notification.brief;
    // console.log(JSON.stringify(notification) + ", " + all + ", " + brief);
    app.ready(function() {
      // 安卓手机实现仿ios右滑返回功能
      if (api.systemType == "android") {
        api.addEventListener({
            name:'swiperight'
        }, function(ret, err){
           api.closeWin({
           });

        });
      }
        // if (all == 0) {
        //     $("#onoffswitch").checked = false;
        // } else {
        //     $("#onoffswitch").checked = true;
        // }
        if (!briefNotificationEnable) {} else {
            $("#onoffswitch_brief").click();
        }

        $("#onoffswitch_brief").on('click', function() {
            clickSwitch()
        });
        //点击开关空间切换
        var clickSwitch = function() {
            if ($("#onoffswitch_brief").is(':checked')) {
                server.setBriefNotify("true");
                console.log("在ON的状态下");
                var params = {
                    topic: language + 'Brief' + appcfg.pushTest
                };
                console.log(params.topic);
                googlePush.subscribeToTopic(params);
            } else {
                server.setBriefNotify("false");
                console.log("在OFF的状态下");
                var params = {
                    topic: language + 'Brief' + appcfg.pushTest
                };
                console.log(params.topic);
                googlePush.unsubscribeFromTopic(params);
            }
        };
    });

});
