let GROUP_NAME = "marketFrameGroup"
var listUrl = '../marketListEdit/temp.html'
var editExchanges = [] //[{"currencyCode":"BTC","exchangeIds":"148"},{"currencyCode":"ETH","exchangeIds":"148,159"}]
var server;
var i18n;
define(function(require) {
    server = require('sdk/server');
    i18n = require("sdk/i18n")
    i18n.tran()
    var coinArray = [];
    var frameArray = [];
    var currentFrameIndex = 0;
    var pageParam = api.pageParam

    server.removeLaunchView()

    getCoinList()
        //获取货币列表
    function getCoinList() {
        server.ajax({
            url: appcfg.host+'/v1/api/app/currency/list.json',
            data: {
                languageId: server.getLanguageId()
            },
            success: function(ret) {
                coinArray = ret.data.lists
                loadItem(convertTab(coinArray));
                loadFrame()
            },
            error: function(err) {}
        })
    }

    //加载列表页面
    function loadFrame() {
        // var array = [];
        coinArray.forEach(function(item, index) {
            var obj = {
                name: "add" + index + "marketList" + item.virCurrencyCode,
                pageParam: item,
                url: listUrl,
                bgColor: '#fff',
                loaded: false
            }
            frameArray.push(obj)
        })
        var y, bottom

        y = 88
        bottom = 0

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
            index: 0,
            scrollEnabled: true,
            // scrollEnabled: false,
            frames: frameArray,
        }, function(ret, err) {
            var index = ret.index;
            // framegroup页面，第一个监听右滑事件
            setTimeout(function() {
              api.execScript({
                  frameName: ret.name,
                  script: "setEvent('"+index+"');"
              });
            },500)
            switchTab(index)
        });
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
            itemEle.innerHTML = tabArray[i].name
            $(itemEle).attr("tapmode", "xxx")
            var itemInEle = document.createElement("div");
            itemInEle.className = "indicator"
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
            switchTab(index)

            //切换页面
            api.setFrameGroupIndex({
                name: GROUP_NAME,
                index: index,
                scroll: true
            })
        })
    }
    //切换tab
    function switchTab(index) {
        var selectedTab = $('.tab-item')[index]

        //移除所有item选中状态样式，设置当前选中状态样式
        $('.tab-item').removeClass("selected")
        $(selectedTab).addClass("selected")

        //计算滚动位置
        var position = $(selectedTab).position() //item相对父元素位置
        var containerWidth = $('.container').width(); //父元素宽度
        var width = $(selectedTab).width(); //item宽度
        var x = position.left - (containerWidth - width) / 2
            //滚动
        $('.container-wrap').animate({
            scrollLeft: x
        }, 100)

    }
    //转换tab数据格式
    function convertTab(coinArray) {
        var array = [];
        coinArray.forEach(function(item, index) {
            item.index = index
            item.name = item.virCurrencyCode
            array.push(item)
        })
        return array
    }

})

//统一提交
function fnConfirm() {
    var commitEditExchanges = editExchanges
    commitEditExchanges.forEach(function(item) {
        item.exchangeIds = item.exchangeIds.toString()
    })
    server.ajax({
        url: appcfg.host+'/v1/api/app/currency/addCollects.json',
        data: {
            languageId: server.getLanguageId(),
            userId: server.getUser().userId,
            exchanges: commitEditExchanges
        },
        success: function(ret) {
            //取数据
            console.log(JSON.stringify(ret));

            api.execScript({
                name: 'index',
                frameName: '0marketListOptional',
                script: 'clearItems();getData();'
            });
            api.closeWin();
        },
        error: function(err) {
            console.warn(JSON.stringify(err));

        }
    })
}

//交易所列表请求成功后全部添加
function addCoinExchanges(item) {
    editExchanges.push(JSON.parse(item))
    console.log("待提交data：" + JSON.stringify(editExchanges));
}

//标记收藏或取消收藏
function markExchange(bool, currencyName, exchangeId) {
    console.log(bool + "," + currencyName + "," + exchangeId);
    editExchanges.forEach(function(item, index) {
        if (item.currencyCode == currencyName) {
            //添加收藏
            if (bool) {
                item.exchangeIds.push(exchangeId)
            } else { //取消收藏
                var idIndex = item.exchangeIds.indexOf(exchangeId)
                item.exchangeIds.splice(idIndex, 1)
            }
            return
        }
    })
    console.log("待提交data：" + JSON.stringify(editExchanges));
}
