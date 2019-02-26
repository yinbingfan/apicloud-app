var data = [];
var mark;
var localData = [];
var showData = [];
var server
var cacheName
var ws = null
var wsOpenUrl;
var loadMoreLock = true;

var lastDataSeconds = 0
var pageParam
var currencyName
var slideLock = false
var skipOnce = false
var preventOpen = false
var firstFetch = true
var i18n;
define(function(require) {
    pageParam = api.pageParam
    console.warn("🐯🐯🐯🐯🐯🐯🐯"+JSON.stringify(pageParam));
    currencyName = pageParam.id;
    server = require('sdk/server')
    i18n = require("sdk/i18n")
    cacheName = "marketList_" + currencyName +  server.getCountryId();

    var cacheVlue = api.getPrefs({ sync: true, key: cacheName });
    if(cacheVlue){
      cacheVlue = JSON.parse(cacheVlue);
      onMessage(cacheVlue);

    }else {
        // app.pull.stop();
        // server.loading(1,api.frameName);
        // app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
    }
    app.ready(function() {
      // if(api.connectionType == "none" ) {
      //   setTimeout(function() {
      //     api.execScript({
      //         frameName: 'market',
      //         script: 'noNet();'
      //     });
      //   },500)
      //
      //  }
        // server.loading(-1);
        server.loading(0,api.frameName);       //bug453
        // if (api.systemType != "ios") {
            app.pull.init(getData)
            // getData();
            api.refreshHeaderLoading();
        // }

        api.addEventListener({
            name: 'scrolltobottom'
        }, function() {
            console.log('scrollBottom>>>>>>>>>>>>>>>>')
            if (loadMoreLock) {
                return;
            }
            loadMoreLock = true;
            $("#bottom-loading")[0].style.display = "block";
            getLocalData()
        });

    })


    i18n.tran()
    $('#titleExchanges').text(i18n.t("Exchanges") + "/24h")
    console.log("marketList页面pageParam： " + JSON.stringify(pageParam));
    console.log("🐯" + currencyName);
    if (currencyName == "Optional") {
        server.loading(1,api.frameName);
        $('#add')[0].style.display = "block"
        $('#add').show()
    }

    $('#list').height($('#list').height() - 80)
})

//websocket发送数据
function getData() {
    var param = {};
    //userId
    if (server.getUser()) {
        param.userId = server.getUser().userId
    } else {
        param.userId = api.deviceId
    }
    var param1 = {
        "languageId": server.getLanguageId(),
        "unit" :server.getCurrency()[0]
    }
    if (currencyName == "Optional") {                    //自选页面的话，未登录不执行其他操作
        if(server.getUser().userId){
          param.pushFlag = 'currency_send_collect'
          param1.userId = server.getUser().userId
        }else{
          app.pull.stop();
          $('#list')[0].innerHTML = " "
          $('#add_big')[0].style.display = "block"
          return;
        }
    }else{
      param1.currencyCode = currencyName
      param.pushFlag = 'currency_send_all'
    }

    param.param = JSON.stringify(param1)
    console.warn(JSON.stringify(param));
    //无网络时，有缓存数据加载缓存数据
    if(api.connectionType == "none" ) {
      // var cacheVlue = api.getPrefs({ sync: true, key: cacheName });
      // alert(JSON.stringify(cacheVlue))
      // if(cacheVlue){
      //   cacheVlue = JSON.parse(cacheVlue);
      //   app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
      //   onMessage(cacheVlue);
      //
      // }else {
      //     app.pull.stop();
      //     server.loading(1,api.frameName);
      //     app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
      // }
      api.execScript({
          name: 'index',
          frameName: 'market',
          script: 'noNet();'
      });

      app.pull.stop();
      server.loading(1,api.frameName);
      app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
      return;
     }
    api.execScript({
        name: 'root',
        //frameName: "market",
        // frameName: "market",
        script: 'send(' + JSON.stringify(param) +',"'+api.frameName+'","index"'+ ');'
    });
}
//websocket收到数据加载列表
function loadList() {
  // alert(0)/
  server.loading(1,api.frameName);                  //bug453
  $("#bottom-loading")[0].style.display = "none";
    var data1 = data;
    // sortList(data1);
    var updateData = false;
    //遍历数据源，检测列表是否已有数据，如果有就修改值，如果没有就创建一个li
    data1.forEach(function(item, index) {
        var ele = $("li[id='" + item.id + "" + "']")
        $(ele).attr("data", JSON.stringify(item))
        if (ele.length > 0) { //如果已有该条目
            updateData = true;

            //最新价格
            if (server.isBlank(item.data) || JSON.stringify(item.data) == "{}") {
                return
            }
            var priceEle = $("li[id='" + item.id + "']" + " .latest");
            var latestPrice1 = $("li[id='" + item.id + "']" + " .latest").attr("price")
            $(priceEle).attr("price", item.data.closing_price)

            var newPrice = item.data.closing_price;
            if (!server.isBlank(latestPrice1)) {
                while (!(0 <= latestPrice1[0] && latestPrice1[0] <= 9)) {
                    latestPrice1 = latestPrice1.substring(1)
                }
                if (newPrice > latestPrice1) {
                    $(priceEle).css("color", "#8CE26A")
                } else if (newPrice < latestPrice1) {
                    $(priceEle).css("color", "#F86464")
                }
            }
            setTimeout('$(".latest").css("color","#202020")', 1000);

            $(priceEle).text(server.getExchangeRate(item.data.unit, item.data.closing_price, mark))

            //涨幅
            var changeEle = $("li[id='" + item.id + "']" + " #changes");
            var a = item.data.changePercent;
            if (server.isBlank(a)) {
                $(changeEle).addClass("change-up");
                $(changeEle).addClass("change-no");
                $(changeEle).text("——")
            } else {
                $(changeEle).addClass("change-up");
                if (a < 0) {
                    $(changeEle).addClass("change-down");
                    a = a + '';
                } else {
                    a = "+" + a
                }
                $(changeEle).text(a.substring(0, 5) + "%")
            }
            //成交量
            $("li[id='" + item.id + "']" + " .volume").text("VOL " +  mark+ BinaryProcess(item.data.volume_1day))
            return
        }

        //-----初次渲染页面加载数据------
        if (server.isBlank(item.data)) {
            item.data = {}
        }
        var li = document.createElement("li");
        $(li).attr("id", item.id + "")
        $(li).attr("data", JSON.stringify(item))
        $(li).attr("tapmode", "")

        var name = document.createElement("p");
        $(name).addClass("name");
        if(item.exchange.length>15 && item.exchange.length<25){
            $(name).css('fontSize','8px')
        }else if(item.exchange.length>=25){
            $(name).css({'fontSize':'8px','overflow':'hidden','textOverflow': 'ellipsis'})
        }
        $(name).text(item.exchange);
        var currency = document.createElement("span");
        $(currency).addClass("currency")
        if(item.exchange.length>15 && item.exchange.length<25){
            $(currency).css('fontSize','5px')
        }
        if (currencyName == "Optional") {
            $(currency).text(" · " + item.currencyCode)
        } else {
            if (server.isBlank(item.data) || JSON.stringify(item.data) == "{}") {
                $(currency).text(" · " + "--")
            } else {
                $(currency).text(" · " + item.data.baseUnit);
                // $(currency).text(" · " + item.currencyCode + " · " + item.data.unit)
            }
        }
        name.append(currency)

        li.appendChild(name)

        //最新价格
        var price = document.createElement("p")

        if (server.isBlank(item.data) || JSON.stringify(item.data) == "{}") {
            $(price).text("--")
        } else {                                            //bug464
            var priceText = server.getExchangeRate(item.data.unit, item.data.closing_price, mark);
            // $(price).text(item.localCurrencyMark + item.data.closing_price)
            $(price).attr("price", item.data.closing_price)

            $(price).text(priceText)
            var thing = item.data.changePercent;            //涨幅情况
            if(thing<0){
              $(price).css("color", "#F86464")
            }else{
              $(price).css("color", "#8CE26A")
            }
            setTimeout(function(){
              $(price).css("color", "#202020")
            }, 2000);

        }
        $(price).addClass("latest second-column")
        li.appendChild(price)

        //最新价格转BTC
        var btnPriceParent = document.createElement("div")
        $(btnPriceParent).addClass("latest2 second-column");

        var priceBTC = document.createElement("p")
        $(priceBTC).addClass("btcPrice");
        if (server.isBlank(item.data) || JSON.stringify(item.data) == "{}") {
            $(priceBTC).text("--")
        } else {
            $(priceBTC).text(item.localCurrencyMark + item.data.closing_price)
            $(priceBTC).attr("price", item.data.closing_price)
            var priceText;
            if (item.currencyCode != "BTC") {
                priceText = server.getExchangeRateBTC(item.data.unit, item.data.closing_price, mark);
                //插入btc符号
                var btcIcon = document.createElement("img")
                $(btcIcon).attr("src", "../../../res/img/iconfont_btc.svg");
                $(btcIcon).addClass("btcIcon");
                btnPriceParent.appendChild(btcIcon)
                $(priceBTC).css("margin-left", "-0.3rem");
            } else {
                priceText = server.getExchangeRateUSD(item.data.unit, item.data.closing_price, mark);
            }
            $(priceBTC).text(priceText)
        }
        btnPriceParent.appendChild(priceBTC)
        li.appendChild(btnPriceParent)

        var volume = document.createElement("p");
        $(volume).text("VOL " + mark+ BinaryProcess(item.data.volume_1day))
        $(volume).addClass("volume")
        li.appendChild(volume)

        var change = document.createElement("p");
        $(change).attr("id", "changes");
        // var a = item.change; //暂无参数
        var a = item.data.changePercent;
        if (server.isBlank(a)) {
            $(change).addClass("change-up");
            $(change).addClass("change-no");
            $(change).text("——")
        } else {
            $(change).addClass("change-up");
            if (a < 0) {
                $(change).addClass("change-down");
                a = a + '';
            } else {
                a = "+" + a
            }
            $(change).text(a.substring(0, 5) + "%")
        }

        li.appendChild(change)

        if (currencyName == "Optional") {
            var stick = document.createElement("p");
            $(stick).attr("tapmode", "")
            $(stick).addClass("stick")
            $(stick).text(i18n.t("Stick"))
            li.appendChild(stick)

            var del = document.createElement("p");
            $(del).attr("tapmode", "")
            $(del).addClass("delete")
            $(del).text(i18n.t("Delete"))
            li.appendChild(del)
        }
        $('#list')[0].appendChild(li) // iOS在上面这行代码崩溃
    })
    if (updateData) {
        return
    }


    $('li').unbind('click').on('click', function(event) {
        var pageData = $(this).attr("data");
        if ($(this).scrollLeft() > 0) {
            return
        }
        if (preventOpen) {
            preventOpen = false
            return
        }
        // var detailPageData = pageData
        api.openWin({
            name: 'coinDetail',
            url: '../coinDetail/temp.html',
            pageParam: {
                index: pageParam.index,
                data: pageData,
                mark: mark
            }
        });

    })
    $('li').on('click', '.stick', function(event) {
        console.log('置顶》》》》》》》》》》》》')
        preventOpen = true
        var data1 = JSON.parse($(this).parent().attr("data"));
        var id = data1.id;

        data.forEach(function(item) {
            if (item.id == id) {
                console.log("id>>>>>>>>>>>>>>>" + item.id + "," + id);
                item.stickTime = $.now()
                console.log("👺" + item.stickTime);
                setExchangesStickTime(item.id, item.stickTime)
            } else if (server.isBlank(item.stickTime)) {
                item.stickTime = 0
            }
        })

        // loadList();
        clearItems();
        getLocalData(true)

        console.log("Stick");
        $(this).parent().animate({
            scrollLeft: 0
        }, 100);
        slideLock = false
    });

    $('li').on('click', '.delete', function(event) {
        var data1 = JSON.parse($(this).parent().attr("data"));
        // console.error(" 刪除的 數據 "+$(this).parent().attr("data"))
        var parent = $(this).parent();
        api.confirm({
            title: i18n.t('delete')+"?",                              //，确认弹窗的标题改为“Delete?”；删除原正文（delete?）内容
            // msg: i18n.t('delete') + "?",
            buttons: [i18n.t('confirm'), i18n.t('cancel')]
        }, function(ret, err) {
            if (ret.buttonIndex == 1) {
                preventOpen = true
                var id = data1.id;
                parent.remove()
                    // clearItems()

                cancelCollect(currencyName, id)

                slideLock = false
                skipOnce = true;
            } else {
                $(parent).animate({
                    scrollLeft: 0
                }, 100);
                slideLock = false
            }
        });
        return
    });

    $('li').on('touchstart', function(event) {
      // 解决可选页面滑动列表和滑动页面冲突问题
      if(currencyName == "Optional"){
        api.setFrameGroupAttr({
            name: "marketFrameGroup",
            scrollEnabled:false
        });

        setTimeout(function() {
          api.setFrameGroupAttr({
              name: "marketFrameGroup",
              scrollEnabled: true
          });
        },500)
      }

        console.log("touchstart");
        slideLock = true
        $('li').addClass("not_selected")
        $(this).removeClass("not_selected")
        $('.not_selected').animate({
            scrollLeft: 0
        }, 100)

    });
    $('li').on('touchend', function(event) {
      let   scrollLeft = $(this).scrollLeft();
        if (!$(this).hasClass("slided")) {
            if (scrollLeft > 40) {
                $(this).animate({
                    scrollLeft: 1000
                }, 100)
                $(this).addClass("slided")
            } else {
                $(this).animate({
                    scrollLeft: 0
                }, 100)
                slideLock = false
            }
        } else if ($(this).hasClass("slided")) {
            if (scrollLeft < 100) {
                $(this).animate({
                    scrollLeft: 0
                }, 100)
                $(this).removeClass("slided")
                slideLock = false
            } else {
                $(this).animate({
                    scrollLeft: 1000
                }, 100)
                slideLock = false
            }
        }
    })
}
//websocket收到数据
function onMessage(message) {
    console.log("💎marketList, " + currencyName + ", " + JSON.stringify(message));
    console.log("💎marketList, " + currencyName);
    api.setPrefs({ key: cacheName, value: JSON.stringify(message) });
    if(!server.isBlank(message.lists) ){
          if(currencyName == "Optional"){
            $('#add_big').hide();
            mark = message.mark
          }else{
            mark = message.currency.mark
          }
    }else{
      if(currencyName == "Optional"){
        $('#add_big').show();
      }
    }
                                               //货币符号
    // app.pull.stop()
    if (message.isCollect == "1") {
        if (currencyName != "Optional") {
            return
        }
    } else {
        if (currencyName != message.currencyCode) {
            return
        }
    }
    app.pull.stop()

    // if(firstFetch) {
    localData = message.lists
    //     firstFetch = false
    // }
    console.log("onMessagegetData")

    // vm.dataList = data1.lists

    // check()
    // if (slideLock) {
    //     console.warn("slideLock");
    //     return
    // }
    if (skipOnce) {
        console.warn("skipOnce");
        skipOnce = false
        return
    }
    var i = 1;

  //  ==排除错乱数据==
  localData.forEach(function(item, index) {
        if (currencyName != "Optional" && item.currencyCode != currencyName) {
            console.log(item.currencyCode + ", " + currencyName);
            localData.splice(index, 1)
            return
        }
        item.defaultSort = index
        item.stickTime = getExchangesStickTime(item.id);
        // console.log("🔥" + item.stickTime);
    })
    clearItems();
    getLocalData(true, true)
    // loadList()

}
//
let SORT_DEFAULT = "0"
let SORT_CHANGES_UP = "1"
let SORT_CHANGES_DOWN = "2"
let SORT_LATEST_UP = "3"
let SORT_LATEST_DOWN = "4"
var sort = SORT_DEFAULT
//按涨跌幅排序
function sortChanges() {
    clearItems()
    $("#sortLatest").removeClass("up down")
    if ($("#sortChanges").hasClass("up")) {
        $("#sortChanges").removeClass("up").addClass("down")
        sort = SORT_CHANGES_DOWN
    } else if ($("#sortChanges").hasClass("down")) {
        sort = SORT_DEFAULT
        $("#sortChanges").removeClass("down")
    } else {
        sort = SORT_CHANGES_UP
        $("#sortChanges").addClass("up")
    }

    getLocalData(true)
    // loadList()
}
//按最新价格排序
function sortLatest() {
    clearItems()
    $("#sortChanges").removeClass("up down")
    if ($("#sortLatest").hasClass("up")) {
        $("#sortLatest").removeClass("up").addClass("down")
        sort = SORT_LATEST_DOWN
    } else if ($("#sortLatest").hasClass("down")) {
        $("#sortLatest").removeClass("down")
        sort = SORT_DEFAULT
    } else {
        sort = SORT_LATEST_UP
        $("#sortLatest").addClass("up")
    }
    getLocalData(true)
    // loadList()
}
//排序列表
function sortList(data1) {
    console.log('排序》》》》》》》》》》》》》》》》》》》》》》》》》')
    data1.forEach(function(item, index) {
        item.stickTime = getExchangesStickTime(item.id)
    })

    data1.forEach(function(item, index) {
        if (server.isBlank(item.data)) {
            item.data = {}
        }
        //遇到数据是null的，转为0
        if(item.data.volume_1day== null){
          item.data.volume_1day=0
        }
    })
    switch (sort) {
        case SORT_DEFAULT:  //默认按24小时成交额排序
            // data.sort((a, b) => (a.exchange.sunstring(0,1).toLowerCase() - b.exchange.sunstring(0,1).toLowerCase()))
            // data1.sort((a, b) => (a.defaultSort - b.defaultSort));
            data1.sort((a, b) => (parseFloat(b.data.volume_1day) - parseFloat(a.data.volume_1day)))
          console.warn(JSON.stringify(data1));
            break;
        case SORT_CHANGES_UP:
            data1.sort((a, b) => (parseFloat(a.data.changePercent) - parseFloat(b.data.changePercent)))
            break;
        case SORT_CHANGES_DOWN:
            data1.sort((a, b) => (parseFloat(b.data.changePercent) - parseFloat(a.data.changePercent)))
            break;
        case SORT_LATEST_UP:
            data1.sort((a, b) => (parseFloat(a.data.closing_price) - parseFloat(b.data.closing_price)))
            break;
        case SORT_LATEST_DOWN:
            data1.sort((a, b) => (parseFloat(b.data.closing_price) - parseFloat(a.data.closing_price)))
            break;
        default:
    }
    if (currencyName == "Optional") {
        data1.sort((a, b) => (b.stickTime - a.stickTime))
    }
}
//取消收藏
function cancelCollect(currencyCode, exchangeId) {
    //这里约定的exchangeId的格式是[5b3debb2179f1471280ec1c2_BTC]
    // 是数据库的exchangeid与currencyCode的组合
    //记得里面有下划线
    var json = {
       languageId: server.getLanguageId(),
       userId: server.getUser().userId,
       exchangeId: exchangeId,
       currencyCode: exchangeId.split("_")[1]
     }
    console.warn("給後臺傳輸的數據是-》》》》》" + JSON.stringify(json))
    server.ajax({
        url: appcfg.host+'/v1/api/app/currency/saveOrCancelCollect.json',
        data: json,
        success: function(ret) {
            //取数据
            // console.log(JSON.stringify(ret));
            getData()
        },
        error: function(err) {
            // console.warn(JSON.stringify(err));
        }
    })
}

//如果值为空，则显示--
function tOrD(text) {
    if (server.isBlank(text) || text + "" == "NaN") {
        return "——"
    } else {
        return text
    }
}
// 点击添加收藏
function clickAdd() {
    slideLock = false
    if (!server.getUser()) {
        api.openWin({
            name: 'entry',
            url: '../entry/temp.html',
            slidBackEnabled: true,
            pageParam: {
              type:"index"
            }
        });
        return
    }
    api.openWin({
        name: 'marketAdd',
        url: '../marketEdit/temp.html',
        pageParam: {
            type: 'add'
        }
    });
}
//设置置顶时间，按置顶时间排序
function setExchangesStickTime(exchangeId, time) {
    var stickedExchanges;
    var str = api.getPrefs({
        key: 'stickedExchanges',
        sync: true
    })
    if (server.isBlank(str)) {
        stickedExchanges = {}
    } else {
        stickedExchanges = JSON.parse(str)
    }
    stickedExchanges[exchangeId] = time
    api.setPrefs({
        key: 'stickedExchanges',
        value: stickedExchanges
    });

}
//获取置顶时间
function getExchangesStickTime(exchangeId) {
    var stickedExchanges;
    var str = api.getPrefs({
        key: 'stickedExchanges',
        sync: true
    })
    if (server.isBlank(str)) {
        return 0;
    } else {
        stickedExchanges = JSON.parse(str)
    }
    if (server.isBlank(stickedExchanges[exchangeId])) {
        return 0;
    } else {
        return stickedExchanges[exchangeId]
    }

}
//清除列表
function clearItems() {
    console.log("clearItems");
    while ($('#list')[0].firstChild) {
        $('#list')[0].removeChild($('#list')[0].firstChild)
    }
}
//检查是不是自选页面的数据
function check() {
    if (data.length == 0) {
        if (currencyName == "Optional") {
            $('#add_big')[0].style.display = "block"
        }
        app.pull.stop()
    } else {
        if (currencyName == "Optional") {
            $('#add_big')[0].style.display = "none"
        }
    }
}

// 分页加载本地数据
function getLocalData(sort, onMessage) {

    if(sort) {
        if(!onMessage) {
            localData = localData.concat(showData)
        }
        // 获取到websocket信息
        showData = []
        sortList(localData)
    }
    let len = localData.length
    if (!localData.length) {
        if(sort) { // 自选全部清除
            data = []
        }
        return
    }
    if(currencyName == "Optional") {
        data = localData.splice(0,len)
    } else {
        if(len > 10) {
            loadMoreLock = false
            data = localData.splice(0,10)
        } else {
            data = localData.splice(0,len)
        }
    }
    showData = showData.concat(data)
    loadList()

}
/*
* 字符限制
* */
function setString (str, len) {
    var strlen = 0;
    var s = "";
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            strlen += 2;
        } else {
            strlen++;
        }
        s += str.charAt(i);
        if (strlen >= len) {
            return s+"...";
        }
    }
    return s;
}

/*
* 24H交易额处理
* */

function BinaryProcess(str) {
        var str=Number(str);
        if (server.isBlank(str) || str + "" == "NaN") {
          str = "——"
        }else if(0<=str && str<=999.994){
            // str = str
            str = str.toFixed(2)
        }else if(999.995<=str && str<=999994) {
            str = (str/1000).toFixed(2)+'K'
        }else if(999995<=str && str<=999994999){
            str = (str/1000000).toFixed(2)+'M'
        }else if(999995000<=str){
            // str = (str/1000000000)+'B'
            str = (str/1000000000).toFixed(2)+'B'
        }
        return str
    }
