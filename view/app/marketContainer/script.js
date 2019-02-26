var server;
var i18n;
var open = false;
define(function (require) {
    server = require('sdk/server');
    $('#view').height($('#view').height() - 45);
    // return
    i18n = require('sdk/i18n');
    i18n.tran();
    loadFrame();
})

function loadFrame() {

    var tabPrice = $('.top-bar-item')[0];
    var tabAssets = $('.top-bar-item')[1];
    if ($(tabPrice).hasClass("active")) {
        switchFrame(0)
    } else {
        switchFrame(1)
    }
}



function switchFrame(index) {

    var tabPrice = $('.top-bar-item')[0];
    var tabAssets = $('.top-bar-item')[1];
    switch (index) {
        case 0:

            $(tabPrice).addClass("active")
            $(tabAssets).removeClass("active")
            // api.closeFrameGroup({             隐藏该代码目的：解决行情页面每次进入刷新问题
            //     name: 'marketFrameGroup'
            // });
            app.window.popoverElement({
                id: 'view',
                name: 'market',
                url: '../market/temp.html',
                bounces: false,
                scrollEnabled: false,
                vScrollBarEnabled: false,
                hScrollBarEnabled: false,
                scaleEnabled: false,
                overScrollMode: 'never',
                reload: false
            });
            if(open == true) {
              api.execScript({
                  //TODO 这里不是应该写成name=market么，咋写成这个样子了
                  name: 'index',
                  frameName: 'market',

                  script: 'try{loadFrame();}catch(e){console.warn(JSON.stringify(e))}'
              });
            }
            open = true;
            break;
        case 1:

            if (server.getUser().userId == null || server.getUser().userId==''||server.getUser().userId==undefined) {

                api.openWin({
                    name: 'entry',
                    url: '../entry/temp.html',
                    pageParam: {
                      type:"index"
                    }
                });

            }else {


                $(tabAssets).addClass("active")
                $(tabPrice).removeClass("active")
                app.window.popoverElement({
                    id: 'view',
                    name: 'assets',
                    url: '../assets/temp.html',
                    bounces: false,
                    scrollEnabled: false,
                    vScrollBarEnabled: false,
                    hScrollBarEnabled: false,
                    scaleEnabled: false,
                    overScrollMode: 'never',
                    reload: false
                });

                setTimeout(()=>{                              //bug资产页重新加载
                    api.execScript({
                        name: 'index',
                        frameName: 'assets',
                        script: 'socket()'
                    });

                },400)
            }

            break;
    }
}

// 第一次登录成功弹窗
function loginToast(title,text) {
   server.toast2(title,text)
}
// 老用户升级到DTT版本登录提示
function oldToast(title,text) {
   server.toastBig()
}
