var i18n;
var cacheName;       //缓存数据参数
var firstNewsId;
var inter;            //从其他页面进入

function loadFrame() {       //从其他也页面进入刷新模块
  inter = true;
  app.pull.init(initData);
  api.refreshHeaderLoading();
}

define(function(require) {
    server = require('sdk/server');
    require('sdk/common');
    var render = require('render');
    // var $ = app.util;
    i18n = require('sdk/i18n');
    i18n.tran();
    cacheName = "twitter_" + server.getCountryId();
    // if (api.systemType == "android") {
    //     api.refreshHeaderLoading();
    // }

    pageIndex = 1;
    pageSize = 20;
    listRender = render({
        el: '#view-list',
        callback: function($el, html) {
          console.log('html>>>' + JSON.stringify(html.data))
          $('#view-list').find('.twitter_text').each(function(i, e) {

            var el = $(e)

            // console.warn('content>>>>>>>>>>>' + JSON.stringify(html.data[i].text))
            el.html(html.data[i].text)
            el.find('a').each(function(i, e) {
                var _this = $(this)

                var href = _this.attr('href')
                console.warn("a标签href地址："+href);
                if(!href) {
                    var hrefText = _this.text()
                    if (!hrefText) return
                    href = `http://${hrefText}`
                }
                console.log('href>>>>>>>' + href)
                _this.attr('href', 'javascript:;')
                _this.addClass('twiiter-button')
                _this.on('click', function() {
                    api.openWin({
                        name: "detail",
                        url: "../detailPage2/temp.html",
                        pageParam: {
                            from: "轮播图",
                            index: 0,
                            url: href,
                            type: 'hide',
                            newsId: ""
                        }
                    });
                })
            })
          })
        }
    })

    app.ready(function() {
        app.pull.init(initData);
        api.refreshHeaderLoading();
        url = appcfg.host+'/v1/api/app/twitter/queryTwitter.json';
        //初始化数据
        // initData();

        //滑倒底部加载更多
        api.addEventListener({
            name: 'scrolltobottom'
        }, function(ret, err) {
            if (!noMore) {
                $("#loading")[0].innerHTML = "";
                $("#loading-anim")[0].display = "inline-block";
                pageIndex += 1;
                getTwitter();
            }
        });


    });

});
var server;
var pageIndex = 1;
var pageSize = 20;
var noMore = false;
var listRender;
var listData = [];
var url;
var param;

var initData = function() {
  //无网络状态提示
  if(api.connectionType == "none" ) {
    var cacheV = api.getPrefs({ sync: true, key: cacheName });
    if (cacheV) {
      getData(JSON.parse(cacheV));
    }
    app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
    return;
   }
    console.log("推特生命周期" + "initData");
    pageIndex = 1;
    noMore = false;
    $("#loading")[0].innerHTML = "";
    $("#loading-anim")[0].display = "block";
    getTwitter();
}
//获取推特列表
function getTwitter() {
    param = {
        languageId: server.getLanguageId(),
        page: pageIndex,
        limit: pageSize
    }
    console.log("推特请求参数" + JSON.stringify(param));
    //没有网络连接，不再加载分页数据
    if(api.connectionType == "none") {
      if (pageIndex>1) {
        setTimeout(function () {
              $("#loading-anim")[0].display = "none";
        },1000)
          return;
      }
    }
    server.ajax({
        url: url,
        name: cacheName,
        method: 'post',
        data: param,
        success: function(ret) {
          getData(ret)
        },
        error: function(err) {
            app.pull.stop();

            console.log(JSON.stringify(err));
            // app.toast(err.msg);
        }
    });
}
function getData(ret) {
  app.pull.stop();
  this.loadingAnim = false;
  if(inter){                     //其他页面进入不往下执行代码，
    inter = false;
    return;
  }
  if (ret.code != "200") {
      app.toast(ret.msg);
  }
  if (ret.data.length == 0) {
      noMore = true;
      $("#loading")[0].innerHTML = i18n.t('nomore');
      $("#loading-anim")[0].display = "none";
      //处理结果到缓存
      api.setPrefs({ key: cacheName, value: JSON.stringify(ret) });
      return;
  }
  if (pageIndex == 1) {
      listData = ret.data;
  } else {
      listData = listData.concat(ret.data);
  }
  var firstNewsId1 = ret.data[0].id;
  var j = 0;
  //处理再次进入app后提示数据 更新数量
  var cacheV = api.getPrefs({ sync: true, key: cacheName });
  if (cacheV) {
    cacheV = JSON.parse(cacheV);
    if(cacheV.data.length) {
      firstNewsId = cacheV.data[0].id;
    }else {
      j = ret.data.length;
    }

  }else {
      j = ret.data.length;
  }
  for (var i = 0; i < ret.data.length; i++) {
      if (firstNewsId == ret.data[i].id) {
          j = i;
      }
  }
  if (j == 0) {
      $("#tophint")[0].innerHTML = i18n.t("it's_the_latest");
      $("#tophint")[0].style.color = "#B4B3B3";
  } else {
      $("#tophint")[0].innerHTML = "+" + j + " " + i18n.t("new_content");
      $("#tophint")[0].style.color = "#fec930";
  }
  firstNewsId = ret.data[0].id;
  if (ret.data.length < 5) {
      noMore = true;
      $("#loading")[0].innerHTML = i18n.t("no_more");
      $("#loading-anim")[0].display = "none";
  }
  //储存结果到缓存
  api.setPrefs({ key: cacheName, value: JSON.stringify(ret) });
  listRender.push('data', convert(listData), true);

  $("#tophint")[0].style.display = "block";
  setTimeout(function() {
      $("#tophint")[0].style.display = "none";
  }, 1000);
}
//转化数据格式
function convert(data) {
    var data1 = [];
    data.forEach(function(item) {
        // {
        //       "id": 67,
        //       "twitterId": "FoxNews",
        //       "content": "WITNESS THE ALBUMTHE TOURIT'S ALL HAPPENINGhttp://www.katyperry.com  #WITNESSKPpic.twitter.com/Ulx8VYmjTt",
        //       "imgUrl": null,
        //       "lable1": "13",
        //       "lable2": "22134",
        //       "picUrl": "media.thedbit.com/dailymedia/test/image/97eb7b94f97d4d018d578d982c8b5e35/874d4132-59b8-4c2d-aba9-27be711612fb.jpg",
        //       "publishTime": null,
        //       "timestamp": 1494846390000
        //   },
        // var img;
        // if(null != item.imgUrl){
        //   img =
        // }
        var date = new Date(item.timestamp); //获取一个时间对象

        /**
         1. 下面是获取时间日期的方法，需要什么样的格式自己拼接起来就好了
         2. 更多好用的方法可以在这查到 -> http://www.w3school.com.cn/jsref/jsref_obj_date.asp
         */
        date.getFullYear(); // 获取完整的年份(4位,1970)
        date.getMonth(); // 获取月份(0-11,0代表1月,用的时候记得加上1)
        date.getDate(); // 获取日(1-31)
        date.getTime(); // 获取时间(从1970.1.1开始的毫秒数)
        date.getHours(); // 获取小时数(0-23)
        date.getMinutes(); // 获取分钟数(0-59)
        date.getSeconds();
        var time = date.getFullYear() + "年" + date.getMonth() + "月" + date.getDate() + "日" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var imgDisplay = "none";
        if (!server.isBlank(item.imgUrl)) {
            imgDisplay = "block";
        }
        if (item.lable2 != null && item.lable2 != "") {
            item.markDisplay1 = "visible";
        } else {
            item.markDisplay1 = "none";
        }
        if (item.lable1 != null && item.lable1 != "") {
            item.markDisplay = "visible";
        } else {
            item.markDisplay = "none";
        }
        data1.push({
            id: item.id,
            name: item.twitterName,
            twitterId: item.twitterId,
            avatar: item.picUrl,
            img: item.imgUrl,
            time: server.getTwitterTime(item.timestamp),
            text: item.content,
            tag1: setString(item.lable1,7),
            tag2: setString(item.lable2,7),
            markDisplay1: item.markDisplay1,
            markDisplay: item.markDisplay,
            imgDisplay: imgDisplay
        });
    });

    return data1;
}
/*
* 点击跳转
* */
function twitterHref(index) {
    var param={
        url:'https://twitter.com/'+index+'' ,
    };
    api.openWin({
        name: "twitterHref",
        url: "../twitterHref/temp.html",
        pageParam: param
    });
}
/*
*
* 点击图片放大*/
function twitterImg(index) {
    var photoBrowser = api.require('photoBrowser');
    photoBrowser.open({
        images: [
            index,

        ],
        placeholderImg: index,
        bgColor: '#000'
    }, function(ret, err) {
        if (ret) {
           if(ret.eventType=='click'){
               photoBrowser.close()
           }
        } else {

        }
    });

}


function setString (str, len) {
    var strlen = 0;
    var s = "";
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 128) {
            strlen += 2;
        } else {
            strlen++;
        }
        s += str.charAt(i);
        if (strlen >= len) {
            return s;
        }
    }
    return s;
}


//下拉刷新
function push_down(callbak) {
	api.setRefreshHeaderInfo({
		visible : true,
		loadingImg : 'widget://image/refresh.png',
		bgColor : '#f1f1f1',
		textColor : '#4d4d4d',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		showTime : true
	}, function(ret, err)
	{
		if (callbak)
		{
			callbak();
		}
	});
}

//下拉刷新恢复
function push_down_over ()
{
	api.refreshHeaderLoadDone();
}
