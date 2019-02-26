let GROUP_NAME = "marketFrameGroup"
var listUrl = '../marketList/temp.html'
var coinArray = [];
var server;
var cacheName;
var i18n;
var frameArray = [];
var currentFrameIndex = 0;
var pageParam;
var hasCollect = false;

var openFrameGroup = false;    //true:行情frameGroup已经打开    false:未打开
var open_index;                //当前打开的tab标签的下标数
var y=88
var bottom
var num=1;

define(function(require) {

    server = require('sdk/server');
    i18n = require("sdk/i18n")
    // 必须注掉，否则会引起iOS日文白屏问题
    // if(app.device.os().name == 'android') {
    if( navigator.language !== 'ja-JP') {
            i18n.tran();
    }

    pageParam = api.pageParam
    console.warn(api.winName);
    console.warn(api.frameName);
    cacheName = "market_"+ server.getCountryId();
    console.log(JSON.stringify(pageParam));
    $('.container-wrap').width($('.container-wrap').width() - 44)
    server.removeLaunchView()
    //无网络状态提示
    if(api.connectionType == "none" ) {
      // app.toast(i18n.t("Network_error_please_try_again_later"), 1500);
      var cacheV = api.getPrefs({ sync: true, key: cacheName });
      if(cacheV) {
        loadData(JSON.parse(cacheV))
      }
    }else{
        getCoinList()
    }
     //监听网络断开连接
     api.addEventListener({
         name:'offline'
     }, function(ret, err){
         api.setFrameGroupAttr({
             name: GROUP_NAME,
             rect: {
                 x: 0,
                 y: y+33,
                 w: 'auto',
                 h: 'auto',
                 marginBottom: server.getFooterHeight()
             },
         });
         $("#noNet")[0].style.display = "block";
     });
     //监听网络重新连接
     api.addEventListener({
         name:'online'
     }, function(ret, err){
       api.setFrameGroupAttr({
           name: GROUP_NAME,
           rect: {
               x: 0,
               y: y,
               w: 'auto',
               h: 'auto',
               marginBottom: server.getFooterHeight()
           },
       });
       $("#noNet")[0].style.display = "none";
     });


    // 网络请求获取货币列表，东部tab栏
    function getCoinList() {
        var param = {
            languageId: server.getLanguageId()
        }
        if (server.getUser()) {
            param.userId = server.getUser().userId
        }
        // i18n.t('optional')
        server.ajax({
            url: appcfg.host+'/v1/api/app/currency/list.json',
            name: cacheName,
            data: param,
            success: function(ret) {
              loadData(ret)
            },
            error: function(err) {
                console.log(err);
            }
        })
    }
    function loadData(ret) {
      api.setPrefs({ key: cacheName, value: JSON.stringify(ret) });
      coinArray = []
      if(navigator.language == 'ja-JP') {
          coinArray.push({"virCurrencyCode":forceTrans(server.getCountryCode())})
      } else {
          coinArray.push({"virCurrencyCode":i18n.t('optional')})
      }
      console.warn('coinArray>>>>>>>' + JSON.stringify(coinArray[0]))
      coinArray = coinArray.concat(ret.data.lists);
      if (ret.data.isCollect == 1) {
          hasCollect = true
      } else {
          hasCollect = false
      }
      loadItem(convertTab(coinArray));
      if (pageParam.from == "preLoad") {
          return
      }

      loadFrame()
    }
    function forceTrans(countryCode) {
        switch (countryCode) {
            case '81':
                return '選択可'
                break;
            case '82':
                return '선택 가능'
                break;
            case '7':
                return 'Необязательно'
                break;
            case '86':
                return '可选'
                break;
            default:
                return 'optional'
                break;
        }
    }
    //加载顶部tab item
    function loadItem(tabArray) {
        for (var i = 0; i < tabArray.length; i++) {
            var itemEle = document.createElement("div");
            if (i == 0) {
                itemEle.className = "tab-item selected"
            } else {
                itemEle.className = "tab-item"
            }
            // if(tabArray[i].name =="Optional"){
            // itemEle.innerHTML = i18n.t("Optional")
            // }else{
            itemEle.innerHTML = tabArray[i].name;
            // }
            $(itemEle).attr("tapmode", "xxx")
            //这里的dom是为了增加选项底部的小黄条
            var itemInEle = document.createElement("div");
            itemInEle.className = "indicator";
            itemEle.appendChild(itemInEle);
            $('.container')[0].appendChild(itemEle);
        }
        //给tab-item绑定点击事件
        var lock = false;
        $('.tab-item').on("touchmove", function(event) {
            lock = true;
        })
        $('.tab-item').on("touchend", function(event) {
            if (lock) {
                lock = false
                return
            }
            //当前点击下标
            var index = $('.tab-item').index(this);
            clickTab(index)
        })
    }
    //转化数据格式
    function convertTab(coinArray) {
        var array = [];
        coinArray.forEach(function(item, index) {
            item.index = index
            item.name = item.virCurrencyCode
            if(index==0){
                item.id = "Optional"
            }else{
                item.id = item.virCurrencyCode
            }
            array.push(item)
        })
        return array
    }
    resetButton()
})
/*
* 点击右上角更多
* */
$('#market_tab_more_nor').on('touchend',function () {
    if(num==1){
        $("#market_tab_more_nor img").attr({ src: "../../../res/img/market_tab_more_sel.png", alt: "../../../res/img/market_tab_more_sel.png" });

        api.openFrame({
            name: 'popup',
            url: './popup.html',
            rect: {
                x: 0,
                y: y,
                w: 'auto',
                h: 'auto'
            },
            pageParam: {
                coinArray: coinArray
            },
            bounces: false,
            bgColor: 'rgba(0,0,0,0)',
            vScrollBarEnabled: true
        });
        num=0;
    }else if(num==0){
        $("#market_tab_more_nor img").attr({ src: "../../../res/img/market_tab_more_nor.png", alt: "../../../res/img/market_tab_more_nor.png" });

        api.closeFrame({
            name: 'popup',
        });
        num=1
    }
});
/*
* 点击右上角更多
* 已废弃
* */
function clickMore() {
    console.log("clickMore");
    if(num==1){
        $("#market_tab_more_nor").attr({ src: "../../../res/img/market_tab_more_sel.png", alt: "../../../res/img/market_tab_more_sel.png" });

        api.openFrame({
            name: 'popup',
            url: './popup.html',
            rect: {
                x: 0,
                y: y,
                w: 'auto',
                h: 'auto'
            },
            pageParam: {
                coinArray: coinArray
            },
            bounces: false,
            bgColor: 'rgba(0,0,0,0)',
            vScrollBarEnabled: true
        });
        num=0;
    }else if(num==0){
        $("#market_tab_more_nor").attr({ src: "../../../res/img/market_tab_more_nor.png", alt: "../../../res/img/market_tab_more_nor.png" });

        api.closeFrame({
            name: 'popup',
        });
        num=1
    }



}
/*
* 点击空白更好图标页面收起
* */
function resetButton() {
    num=1;
    $("#market_tab_more_nor").attr({ src: "../../../res/img/market_tab_more_nor.png", alt: "../../../res/img/market_tab_more_nor.png" });
}

//切换货币tab
function switchTab(index) {
    var selectedTab = $('.tab-item')[parseInt(index)]

    //移除所有item选中状态样式，设置当前选中状态样式
    $('.tab-item').removeClass("selected")
    $(selectedTab).addClass("selected")

    //计算滚动位置
    var position = $(selectedTab).position() //item相对父元素位置
    var containerWidth = $('.container').width(); //父元素宽度
    var width = $(selectedTab).width(); //item宽度
    var x = position.left - (containerWidth - width) / 2;
    //滚动
    $('.container-wrap').animate({
        scrollLeft: x
    }, 100)
    api.closeFrame({
        name: 'popup'
    });
}
//点击tab
function clickTab(index) {
    num=1;
    $("#market_tab_more_nor").attr({ src: "../../../res/img/market_tab_more_nor.png", alt: "../../../res/img/market_tab_more_nor.png" });

    switchTab(index);
    //切换页面
    api.setFrameGroupIndex({
        name: GROUP_NAME,
        index: index,
        scroll: true
    })
}
//加载列表frameGroup
function loadFrame() {
    console.warn("🔥loadFrame");
      coinArray.forEach(function(item, index) {

          var obj = {
              name: index + "marketList" + item.id,

              pageParam: item,
              useWKWebView: true,
              url: listUrl,
              bgColor: '#fff',
              loaded: false
          }
          frameArray.push(obj)

      })
        console.warn(JSON.stringify(frameArray));

      bottom = server.getFooterHeight()
      var firstLoadIndex = 1;
      if (hasCollect) {
          firstLoadIndex = 0
      }
      api.openFrameGroup({
          name: GROUP_NAME,
          rect: {
              x: 0,
              y: y,
              w: 'auto',
              h: 'auto',
              marginBottom: bottom
          },
          preload: 0,
          index: firstLoadIndex,
          scrollEnabled: true,
          frames: frameArray,
      }, function(ret, err) {
        if(api.getPrefs({
            key: 'pages',
            sync: true
        })!="market"){
          api.bringFrameToFront({
              from: api.getPrefs({
                  key: 'pages',
                  sync: true
              })
          });
        }
          open_index = ret.index;
          openFrameGroup = true;
          setTimeout('switchPage(' + open_index + ')', 300);
          switchTab(open_index)
      });
      /*
      *行情界面打开状态下，重新启动行情的websorket链接*********
      * 1.点击footer里市场按钮再次进入行情页面
      * 2.上面上方行情按钮进入行情页面
      */
      if(openFrameGroup) {
        switchPage(open_index)
      }
  }
//切换列表页面
function switchPage(index) {
    console.log("switchPage");

    console.log(frameArray[index].name+ '<<<<<<<<<<<<<<<<<<<<<<<<')
    // api.execScript({
    //     frameName: frameArray[index].name,
    //     script: 'setTimeout("getData()",300);'
    // })

    frameArray[index].loaded = true
    currentFrameIndex = index
}

//切换列表页面
function closeFrame(index) {
  api.closeFrameGroup({
      name: GROUP_NAME
  });

    // if(api.getPrefs({
    //         key: 'pages',
    //         sync: true
    //     })!="newsHome"){
    //       api.bringFrameToFront({
    //           from: api.getPrefs({
    //               key: 'pages',
    //               sync: true
    //           })
    //       });
    // }

}

function noNet() {
    api.setFrameGroupAttr({
        name: GROUP_NAME,
        rect: {
            x: 0,
            y: y+33,
            w: 'auto',
            h: 'auto',
            marginBottom: server.getFooterHeight()
        },
    });
    $("#noNet")[0].style.display = "block";
}
