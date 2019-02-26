var wsUrl = "172.30.10.158:9080"
    // var wsUrl = "172.30.30.14:9080"
var data;
var data = [{
    "id": 10,
    "exchange": "Ascend",
    "localName": "思密达",
    "img": "../../../res/img/ic_me_location@3x.png",
    "isAdd": false
}, {
    "id": 10,
    "exchange": "Brilliant",
    "localName": "思密达",
    "img": "../../../res/img/me_icon_language@3x.png",
    "isAdd": true
}, {
    "id": 10,
    "exchange": "Character",
    "localName": "思密达",
    "img": "../../../res/img/me_icon_clearcache@3x.png",
    "isAdd": false
}]

var server
var ws = null
var type //add 添加自选

var lastDataSeconds = 0
var pageParam
var currencyName
var slideLock = false
var preventOpen = false
define(function(require) {
    pageParam = api.pageParam
    currencyName = pageParam.virCurrencyCode
    server = require('sdk/server')
    console.log("marketListEdit页面pageParam： " + JSON.stringify(pageParam));

    $('#list').height($('#list').height() - 10)
    getData();
    // loadList(data)//测试用

})
//获取列表数据
function getData() {
    var param = {
        userId: server.getUser().userId,
        languageId: server.getLanguageId(),
        currencyCode: currencyName
    }
    server.ajax({
        url: appcfg.host+'/v1/api/app/currency/getCollect.json',
        data: param,
        success: function(ret) {
            data = ret.data
            loadList(data)

            // {
            //     "currencyCode": "ETH",
            //     "exchangeIds": "148,159"
            // }
            var json = {
                currencyCode: currencyName,
                exchangeIds: []
            }
            data.forEach(function(item, index) {
                if (item.collectFlag ==1){
                  json.exchangeIds.push(item.id)
                }
            })
            api.execScript({
                name: 'marketAdd',
                script: "addCoinExchanges('"+JSON.stringify(json)+"');"
            });
        },
        error: function(err) {

        }
    })
}
//加载列表数据
function loadList(data1) {
    // return
    while ($('#list')[0].firstChild) {
        $('#list')[0].removeChild($('#list')[0].firstChild)
    }
    //遍历数据源，每条数据创建一个li
    data1.forEach(function(item, index) {
        // <li>
        //     <img class="image" src="../../../res/img/ic_me_location@3x.png" />
        //     <p class="name">Bitfinex</p>
        //     <div class="isMark"></div>
        // </li>
        var li = document.createElement("li");

        $(li).attr("id", item.id)
        $(li).attr("data", JSON.stringify(item))
        $(li).attr("tapmode", "")

        var image = document.createElement("img");
        $(image).addClass("image")
        $(image).attr("src", item.logo)
        li.appendChild(image)

        var name = document.createElement("p");
        $(name).addClass("name")
        $(name).text(item.exchange)
        li.appendChild(name)

        var isMark = document.createElement("div");
        $(isMark).addClass("isMark")
        li.appendChild(isMark)
        if (item.collectFlag == 1) {
            $(li).addClass("li-selected")
        }

        $('#list')[0].appendChild(li)

    })
    $('li').on('click', function(event) {
        var pageData = JSON.parse($(this).attr("data"))
        $(this).toggleClass("li-selected")
        markExchange($(this).hasClass("li-selected"), currencyName, pageData.id)
    })
}

//标记收藏或取消收藏
function markExchange(bool, currencyName, exchangeId) {
    console.log(bool + "," + currencyName + "," + exchangeId);
    // TODO: 点击后标记收藏或取消
    api.execScript({
        name: 'marketAdd',
        script: "markExchange(" + bool + ",'" + currencyName + "','" + exchangeId + "');"
    });

}

function setEvent(index) {
  var startx,endx,starty,endy;
  // 安卓手机实现仿ios右滑返回功能
  if (api.systemType == "android") {
    if(index == 0){
      api.setFrameGroupAttr({       //
          name: 'marketFrameGroup',
          scrollEnabled: false,
      });
    $('#list').on('touchstart',  function(e) {
         startx = e.touches[0].pageX;
         starty = e.touches[0].pageY;
        //  left = $(this).css("left");
        //  openLock = true;
    }).on('touchend',  function(e) {
          endx = e.changedTouches[0].pageX;
          endy = e.changedTouches[0].pageY;
          // alert(startx-endx)
          // alert(Math.abs(starty-endy))
         if(startx-endx <0 && Math.abs(starty-endy)<20) {      //列表正常状态右滑，退出当前页面

           api.closeWin({

           });

         }else if(startx-endx >0 && Math.abs(starty-endy)<20){

            api.setFrameGroupIndex({
                name: 'marketFrameGroup',
                index: 1,
                scroll: true
            });


         }
        //  left = $(this).css("left");
        //  openLock = true;
    })
    }else{
      api.setFrameGroupAttr({
          name: 'marketFrameGroup',
          scrollEnabled: true,
      });
    }

  }
}
