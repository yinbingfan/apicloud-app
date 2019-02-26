var server;
var i18n;
var footHeight;
var open=false;
define(function (require) {
    server = require('sdk/server');
    $('#view').height($('#view').height() - 44);
    // return

    i18n = require('sdk/i18n');
    i18n.tran();
    loadFrame();
    footHeight = server.getFooterHeight();
})

function loadFrame() {
    var tabPrice = $('.top-bar-item')[0];
    var tabAssets = $('.top-bar-item')[1];
      var tabset = $('.top-bar-item')[2];
    if ($(tabPrice).hasClass("active")) {
        switchFrame(0)
    } else if($(tabAssets).hasClass("active")) {
        switchFrame(1)
    }else if($(tabset).hasClass("active")){
        switchFrame(2)
    }
}


//新闻、快讯、twitter之间切换
function switchFrame(index) {
    var param2 = {
        // channelId: channelId1,
        index: index
    }
    var paramString = JSON.stringify(param2);
    var tabPrice = $('.top-bar-item')[0];
    var tabAssets = $('.top-bar-item')[1];
    var tabset = $('.top-bar-item')[2];
    switch (index) {
        case 0:
            $(tabPrice).addClass("active")
            $(tabAssets).removeClass("active")
              $(tabset).removeClass("active")
            // api.closeFrameGroup({
            //     name: 'marketFrameGroup'
            // });
            app.window.popoverElement({
                id: 'view',
                name: 'subNews',
                param:paramString,
                url: '../subNews/tempa.html',
                bounces: false,
                scrollEnabled: false,
                vScrollBarEnabled: false,
                hScrollBarEnabled: false,
                scaleEnabled: false,
                overScrollMode: 'never',
                // bottomMargin: server.getFooterHeight(),
                reload: false
            });
            api.setPrefs({
                key: 'pages',
                value: 'newsHome'
            })
            //切换到其他页面再切换回来，显示新闻rrame组
            if(open == true){
              api.execScript({
                  //TODO 这里不是应该写成name=market么，咋写成这个样子了
                  name: 'index',
                  frameName: 'subNews',
                  script: 'show()'
              });
            }
            open = true;    //进入app之后，open=true表明时切换过来的，flase:第一次进来
          break;
          case 1:
            $(tabPrice).removeClass("active")
            $(tabAssets).addClass("active")
              $(tabset).removeClass("active")
                // api.closeFrameGroup({
                //     name: 'marketFrameGroup'
                // });
                api.setPrefs({
                    key: 'newsHome',
                    value: 'market'
                });
                app.window.popoverElement({
                    id: 'view',
                    name: 'briefList',
                    url: '../briefList/tempba.html',
                    bounces: false,
                    param:paramString,
                    scrollEnabled: false,
                    vScrollBarEnabled: false,
                    hScrollBarEnabled: false,
                    scaleEnabled: false,
                    overScrollMode: 'never',
                      // bottomMargin: 188,
                    reload: false
                });
                //  api.bringFrameToFront({
                //      from: "briefList"
                //  });

                api.setPrefs({
                    key: 'pages',
                    value: 'briefList'
                })
                 if(api.systemType == "ios") {
                   setTimeout(function(){
                     api.execScript({
                         name: 'index',
                         frameName: 'briefList',

                         script: 'loadFrame()'
                     });
                   },500)
                 }
              break;
              case 2:
                $(tabPrice).removeClass("active")
                $(tabAssets).removeClass("active")
                  $(tabset).addClass("active")
                    // api.closeFrameGroup({
                    //     name: 'marketFrameGroup'
                    // });
                    api.setPrefs({
                        key: 'newsHome',
                        value: 'assets'
                    });
                    app.window.popoverElement({
                        id: 'view',
                        name: 'twitter',
                        url: '../twitter/temp.html',
                            param:paramString,
                        bounces: false,
                        scrollEnabled: false,
                        vScrollBarEnabled: false,
                        hScrollBarEnabled: false,
                          // bottomMargin: footHeight,
                        scaleEnabled: false,
                        overScrollMode: 'never',
                        reload: false,

                    });
                    api.setPrefs({
                        key: 'pages',
                        value: 'twitter'
                    })
                    if(api.systemType == "ios") {
                      setTimeout(function(){
                        api.execScript({
                            name: 'index',
                            frameName: 'twitter',

                            script: 'loadFrame()'
                        });
                      },500)
                    }
                    break;
    }
}
//index页面收到快讯通知点击后切换到快讯页面
function funcGoto(type) {
  if(type == "news") {
    switchFrame(0)
  }else if(type == "brief") {
    switchFrame(1)
  }

}
