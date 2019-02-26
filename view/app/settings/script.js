/**
 * member
 */
var languageCode;
var server;
var i18n;
define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    i18n = require('sdk/i18n');
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
      api.getCacheSize(function (ret) {
          var size = parseInt((ret.size) / 1000);
          if (size < 1000) {
              $('#cache-size')[0].innerHTML = size + "K";
          } else {
              $('#cache-size')[0].innerHTML = parseInt(size / 1000) + "M";
          }
      });

    });

});

//清除缓存
function fnClickClearCache() {
    api.removePrefs({
        key: 'portfolio_id'
    });
    api.confirm({
        title: i18n.t('clear_cache')+"?",       //确认弹窗的标题改为“Clear cache?”；删除原正文（Clear cache）内容
        // msg: i18n.t('clear_cache'),
        buttons: [i18n.t('Clear'), i18n.t('Cancel')]
    }, function (ret, err) {
        console.log(JSON.stringify(ret));
        if (ret.buttonIndex == 1) {
            api.clearCache(function () {
                $('#cache-size')[0].innerHTML = "0 B";
            });
        } else {
        }
    });
};

// 通知
function fnClickNotificaion() {
    api.openWin({
        name: 'notification',
        url: '../notification/temp.html',
        pageParam: {}
    });
};

//关于页面
function fnClickAbout() {
    api.openWin({
        name: 'about',
        url: '../about/temp.html',
        pageParam: {}
    });
};
