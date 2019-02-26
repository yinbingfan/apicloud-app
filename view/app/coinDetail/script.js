var data;
var pageParam
var pageData
var server
var data = {}
var i18n;
define(function(require) {
    pageParam = api.pageParam
    pageData = JSON.parse(pageParam.data)
    server = require('sdk/server')
    i18n = require("sdk/i18n")
    i18n.tran()
    console.log("coindetail页面pageParam： " + JSON.stringify(pageParam));
    //加载从上个页面带过来的实时信息
    loadData();
    //获取页面数据
    getCoinDetail();
    // 安卓手机实现仿ios右滑返回功能
    if (api.systemType == "android") {
      api.addEventListener({
          name:'swiperight'
      }, function(ret, err){
         api.closeWin({
         });
      });
    }

})

function getCoinDetail() {
    var param = {
        languageId: server.getLanguageId(),
        currencyCode: pageData.currencyCode,
        exchangeId: pageData.id
    }
    if (server.getUser()) {
        param.userId = server.getUser().userId
    }
    server.ajax({
        url: appcfg.host+'/v1/api/app/currency/getCurrencyDeail.json',
        data: param,
        success: function(ret) {
            //取数据
            data = ret.data
            console.log(JSON.stringify(data));
            loadData2();
        },
        error: function(err) {

        }
    })
}

function loadData() {
    var icon = api.readFile({
        path: 'widget://res/img/coiniconhd/' + pageData.currencyCode + '.png',
        sync: true
    });
    console.log("🔥🔥🔥");
    console.log("🔥🔥🔥" + icon);
    // if (server.isBlank(icon)) {
    //
    // } else {
    $('#coin_icon').attr("src", "../../../res/img/coiniconhd/" + pageData.currencyCode + ".png")
        // }
    var a = pageData.data.changePercent; //暂无参数
    if (server.isBlank(a)) {
        $('#changes').addClass("coin-detail-up");
        $('#changes').addClass("coin-detail-nochange");
        $('#changes').text("——")
    } else {
        if (a < 0) {
            $('#changes').addClass("coin-detail-down");
            a = a + '';
        } else {
            a = "+" + a
        }
        $('#changes').text(a.substring(0, 5) + "%")
    }
    if(pageData.exchange.length>25){
        $('#title').css('fontSize','12px')
    }
    $('#title').text(tOrD(pageData.exchange) + " · " + tOrD(pageData.data.unit) + " / " + tOrD(pageData.data.currency))
    console.log(pageData.localName + "🔥");
    $('#coinName').text(tOrD(pageData.currencyCode))
    if (!server.isBlank(pageData.data.closing_price)) {
        $('#price').text(server.getExchangeRate(pageData.data.unit, pageData.data.closing_price, pageData.localCurrencyMark))
        var priceBTC = server.getExchangeRateBTC(pageData.data.unit, pageData.data.closing_price, pageData.currencyCode);
        if (pageData.currencyCode == "BTC") {
            $('#btcIcon').remove();
            $('#price1').remove();
        } else {
            $('#price1').text(priceBTC);
        }
        $('#price2').text(server.getExchangeRateUSD(pageData.data.unit, pageData.data.closing_price))
    } else {
        $('#price').text("--")
        $('#price1').text("--");
        $('#price2').text("");
    }
    if (!server.isBlank(pageData.data.timestamp)) {
        var timestamp = pageData.data.timestamp;
        console.warn(timestamp.length);
        if (timestamp.length == 10) {
            timestamp = timestamp + "000"
        }
        $('#time').text(i18n.t("updated") + ": " + server.getTimeHHMMSS(parseInt(timestamp)))
    } else {
        $('#time').text("--")
    }
    // $('#changes').text(pageData.change)
    $('#volume').text(i18n.t("Volume") + " " + api.pageParam.mark + BinaryProcess(pageData.data.volume_1day))
    if (server.isBlank(pageData.data.max_price)) {
        $('#high').text("--")
    } else {
        $('#high').text(server.getExchangeRate(pageData.data.unit, pageData.data.max_price, pageData.localCurrencyMark))
    }
    if (server.isBlank(pageData.data.min_price)) {
        $('#low').text("--")
    } else {
        $('#low').text(server.getExchangeRate(pageData.data.unit, pageData.data.min_price, pageData.localCurrencyMark))
    }
}
//加载服务器上获取的货币信息
function loadData2() {
    if (data.isCollect == 1) {
        $('#collect').addClass("collect")
    }
    $('#info').text(data.projectNote)
    $('#rank').text(data.rank)
    $('#exchangeCount').text(data.onlineCount)
    $('#issueCount').text(String(data.issueCount).replace(/(?=(?!^)(\d{3})+$)/g, ','))
    $('#circulationVolume').text(String(data.circulateSum).replace(/(?=(?!^)(\d{3})+$)/g, ','))
    $('#issueTime').text(data.issueTime)
        // <a href="http://www.baidu.com">www.baidu.com</a>
        // $('#website').html("<a href='"+data.officialUrl+"'>"+data.officialUrl+"</a>")
    setUrls("website", data.officialUrl)
    setUrls("whitePaper", data.baipiUrl)
    setUrls("blockQuery", data.blokQuery)
    $('a').on("click", function() {
        event.preventDefault()
        api.openWin({
            name: 'detail',
            url: '../detailPage2/temp.html',
            pageParam: {
                url: $(this).text(),
                type: 'hide'
            }
        });

    })

    $('#relConcept').text(data.relContent)

    // <li class="coin-detail-event-li">
    //   <span class="coin-detail-event-time">2017-11-23</span>
    //   <img class="coin-detail-event-img" src="../../../res/img/coin_detail_event_mark.png"/>
    //   <p  class="coin-detail-event-text" >BCD分叉倒计时</p>
    // </li>
    var eventListEm = $('#list-events')[0]
    var eventList = data.eventList;
    if (eventList.length == 0) {
        $('#list-events').css("display", "none")
        $('.coin-detail-list-title').css("display", "none")
    }
    eventList.forEach(function(item) {
        var li = document.createElement("li")
        $(li).addClass("coin-detail-event-li")

        var timeSpan = document.createElement('span')
        $(timeSpan).addClass("coin-detail-event-time")
        $(timeSpan).text((item.eventTime).substring(0, 10))
        li.appendChild(timeSpan)

        var img = document.createElement('img')
        $(img).addClass("coin-detail-event-img")
        $(img).attr("src", "../../../res/img/coin_detail_event_mark.png")
        li.appendChild(img)

        var text = document.createElement('p')
        $(text).addClass("coin-detail-event-text")
        $(text).text(item.note)
        li.appendChild(text)

        eventListEm.appendChild(li)
    })
}
//显示或隐藏简介
function showOrHideText() {
    $('#info').toggleClass("full")
    $('#show_more').toggleClass("arrow-up")
}

//通用方法，如果没有值就显示--
function tOrD(text) {
    if (server.isBlank(text) || text + "" == "NaN") {
        return "——"
    } else {
        return text
    }
}
//收藏货币-交易所
function fnCollect() {
    if (!server.getUser()) {
        api.openWin({
            name: 'entry',
            url: '../entry/temp.html',
        });
        return
    }
    server.ajax({
        url: appcfg.host+'/v1/api/app/currency/saveOrCancelCollect.json',
        data: {
            languageId: server.getLanguageId(),
            userId: server.getUser().userId,
            exchangeId: pageData.id,
            currencyCode: pageData.currencyCode
        },
        success: function(ret) {
            //取数据
            console.log(JSON.stringify(ret));
            $('#collect').toggleClass("collect")
                // if (pageParam.index == 0)
            api.execScript({
                name: 'index',
                frameName: '0marketListOptional',
                script: 'clearItems();getData();'
            });
        },
        error: function(err) {
            // app.toast(err.body.msg)
            console.warn(JSON.stringify(err));
        }
    })
}

function setUrls(id, urlStr) {
    var blockQueryUrl = urlStr
    var blockQueryUrlArray
    var blockQueryHtml = ""
    if (server.isBlank(urlStr)) {
        $('#' + id + '').html("--")
        return
    }
    blockQueryUrlArray = blockQueryUrl.split(",")
    blockQueryUrlArray.forEach(function(item, index) {
        if (index != 0) {
            // blockQueryHtml += "</br>"
        }
        blockQueryHtml = blockQueryHtml + "<a href='" + item + "'>" + item + "</a>"
    })
    $('#' + id + '').html(blockQueryHtml)
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
