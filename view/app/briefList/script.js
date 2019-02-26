/*
 * layout
 */
var server;
var cacheName;//缓存参数
var i18n;
var clickLock = false;
var firstNewsId;
var listData = [];
var first;
var listRender;

var dayHeight;  //日期归类的数组

var pageIndex = 1;
var pageSize = 8;
var noMore = false;

  function loadFrame() {
    // alert(10101)
    if(first){
          app.pull.init(function () {
            loadData()
          });
      }

}



define(function (require) {

    require('sdk/common');
    i18n = require('sdk/i18n');
    i18n.tran();
    server = require('sdk/server')
    var render = require('render');
    cacheName = "brief_" + server.getCountryId();
    // if (api.systemType == "android") {
    //     api.refreshHeaderLoading();
    // }

    // var $ = app.util;

     listRender = render({
        el: '#view-list',
    })
    var cacheV = api.getPrefs({ sync: true, key: cacheName });
    if(cacheV) {
      cacheV = JSON.parse(cacheV).data;
      listRender.push('data', convert(cacheV), true);
      $(function() {
        dayHeight = [];
        $('.list-time').each(function(i, e) {
              var el = $(e);
              var _this = $(this)
              if(el.text()) {
                dayHeight.push({
                    height:el.offset().top-30,
                    num: _this.text()
                  })
                }

        })
      })
    }
    app.ready(function () {
        first = true;
        var param = app.getParam();
        app.pull.init(loadData);

          api.refreshHeaderLoading();
        var name = 'subbriefs';
        var top = 30;

        // loadData();

        // api.addEventListener({
        //     name: 'swipedown'
        // }, function (ret, err) {
        //     console.log('向下轻扫');
        // });

        api.addEventListener({
            name: 'scrolltobottom'
        }, function (ret, err) {
            if (!noMore) {
                pageIndex += 1;
                loadListData()
            }
        });
        is_scroll();                        //监听上下滑动事件
        window.setInterval("clock()", 2000);
    });

    // $(window).scroll(function() {
    //     // var style = $("#view-list p[ltime]").eq(0).prop("style")
    //     // for (var key in style) {
    //     //   console.log(key+" --  -- "+style[key]);
    //     // }
    //     console.log(" offsettop --->>> " + JSON.stringify($("body").scrollTop()));
    //
    //     // console.log(" offsettop --->>> " + JSON.stringify($("#view-list div[ltime]").eq(0).offset()  ) );
    //     console.log(" scrollTop --->>> " + JSON.stringify($("#view-list div[ltime]").eq(0).prop("scrollTop")));
    // })

});

    // 处理时间
    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    function getDateDiff(DiffTime) {
        //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
        Time = DiffTime.replace(/\-/g, "/");
        return Time;
    };

    function getTime(createtime) {
        // var convetedTime = getDateDiff(createtime);
        var time1 = new Date(createtime);
        var ttt = time1.Format("yyyy-MM-dd");
        var content = "null";
        var minutes = time1.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        content = time1.getHours() + ":" + minutes;
        return content;
    }

    /**
     * 1、将服务端返回数据，转换成前端需要的格式
     * 2、若服务端返回格式和前端所需格式相同，则不需要改功能
     *
     * @param {Array} items
     */


    // 打开详细页事件
    var openLock;
    $('#view-list').on('touchmove', '[data-guid]', function () {
        openLock = true;
        console.log("滑动————————————————————————————");
    }).on('touchend', '[data-guid]', function () {
        if (openLock) {
            return openLock = false;
        }
        var guid = this.getAttribute('data-guid');
        var linkFlag = this.getAttribute("data-flag");                          //是否为广告参数
        if (!guid || guid == "") {
            return;
        }
        var param = {                                                           //把是否为广告参数传到detailPage2页面
            url: guid,
            linkFlag: linkFlag
        }
        // console.log(guid);
        api.openWin({
            name: 'detail',
            url: '../detailPage2/temp.html',
            pageParam: param
        });
    });

    //赞
    //重写
    $('#view-list').on('touchmove', '[data-good]', function () {
        openLock = true;
    }).on('touchend', '[data-good]', function () {
      let listIndex = this.getAttribute('data-index');
        if ($(this).siblings('#bad').hasClass('bad-selected')) {
            return
        }

        if (server.getUser()) {


            let param = {
                    userId: server.getUser().userId,
                    messageId: this.getAttribute('data-good'),
                    type: 0
                },
                that = this

            server.ajax({
                url: appcfg.host+'/v1/api/app/shortMessage/thumbsUp.json',
                method: 'post',
                data: param,
                success: function (ret) {
                  console.warn(JSON.stringify(ret))
                    if ($(that).hasClass('good-selected')) {
                        $(that).removeClass('good-selected')
                        $(that).addClass('good')
                        $(that).children('img').attr('src', '../../../res/img/ic_like@3x.png')
                        listData[listIndex].type = null
                    } else {
                        $(that).addClass('good-selected')
                        $(that).removeClass('good')
                        $(that).children('img').attr('src', '../../../res/img/ic_liked@3x.png')
                        listData[listIndex].type = 0
                    }
                    let num = Number($(that).children('#goodNumber').text())
                    if (ret.data.type) {
                        num += 1
                        $(that).children('#goodNumber').text(num)
                        listData[listIndex].goodNumber = num
                        // 获得积分toast提示
                        if(ret.data.credit) {
                          server.toast1("+ "+ret.data.credit+" DTT")
                        }
                    } else {
                        num -= 1
                        // 防止-1
                        if(num < 0) {
                            num = 0
                        }
                        $(that).children('#goodNumber').text(num)
                        listData[listIndex].goodNumber = num
                    }
                },
                error: (err) => {
                    console.log(err)
                }
            })
        } else {
            api.openWin({
                name: 'entry',
                url: '../entry/temp.html',
                pageParam: {
                    type: 'index'
                }
            });
        }
    });

    //踩
    //重写
    $('#view-list').on('touchmove', '[data-bad]', function () {
        openLock = true;
    }).on('touchend', '[data-bad]', function () {

        let listIndex = this.getAttribute('data-index');
        if ($(this).siblings('#good').hasClass('good-selected')) {
            return
        }

        if (server.getUser()) {


            let param = {
                    userId: server.getUser().userId,
                    messageId: this.getAttribute('data-bad'),
                    type: 1
                },
                that = this

            server.ajax({
                url: appcfg.host+'/v1/api/app/shortMessage/thumbsUp.json',
                method: 'post',
                data: param,
                success: function (ret) {
                    if ($(that).hasClass('bad-selected')) {
                      listData[listIndex].type = null
                        $(that).removeClass('bad-selected')
                        $(that).addClass('bad')
                        $(that).children('img').attr('src', '../../../res/img/ic_dislike@3x.png')
                    } else {
                      listData[listIndex].type = 1
                        $(that).addClass('bad-selected')
                        $(that).removeClass('bad')
                        $(that).children('img').attr('src', '../../../res/img/ic_disliked@3x.png')
                    }
                    let num = Number($(that).children('#badNumber').text())
                    if (ret.data.type) {
                        num += 1
                        $(that).children('#badNumber').text(num)
                        listData[listIndex].badNumber = num
                        // 获得积分toast提示
                        if(ret.data.credit) {
                          server.toast1("+ "+ret.data.credit+" DTT")
                        }
                    } else {
                        num -= 1
                        $(that).children('#badNumber').text(num)
                        listData[listIndex].badNumber = num
                    }
                },
                error: (err) => {
                    console.log(err)
                }
            })
        } else {
            api.openWin({
                name: 'entry',
                url: '../entry/temp.html',
                pageParam: {
                    type: 'index'
                }
            });
        }
    });

    var index = app.getParam();


    var newsList = [];
    for (var i = 0; i < 10; i++) {
        var news = {
            text: 'High Street Crypto Payments Within Two Years:Report' + i,
            time: '21:39',
            day: i + ' March'
        }
        newsList.push(news);
    }
    shuffle(newsList);

function convert(items) {
    var newItems = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var level = "";
        var s = [];
        var text = "";
        var goldenText = "";
        if (item.level == 5) {
            goldenText = item.message;
        } else {
            text = item.message;
        }
        var displayStar = "inline-block";
        if (0 == item.level) {
            displayStar = "none";
        }
        for (var j = 0; j < 5; j++) {
            if (j < item.level) {
                s[j] = "../../../res/img/icon_star_y@3x.png";
            } else {
                s[j] = "../../../res/img/icon_star_g@3x.png";
            }
        }
        var day = server.getBriefTopTime(item.timestamp);
        var k = i - 1;
        if (i != 0) {
            if (day == server.getBriefTopTime(items[k].timestamp)) {
                day = "";
            }
        }
        var goodNumber = item.goodNumber;
        if (goodNumber == null) {
            goodNumber = 0;
        }
        ;
        var badNumber = item.badNumber;
        if (badNumber == null) {
            badNumber = 0;
        }
        ;
        var goodPic = "../../../res/img/ic_like@3x.png";
        var badPic = "../../../res/img/ic_dislike@3x.png";
        var goodClass = "good";
        var badClass = "bad";
        if (item.type != null) {
            if (item.type == 0) {
                goodPic = "../../../res/img/ic_liked@3x.png";
                goodClass = "good-selected"
            } else {
                badPic = "../../../res/img/ic_disliked@3x.png";
                badClass = "bad-selected";
            }
        }
        newItems.push({
            guid: item.url,
            text: text,
            linkFlag: item.linkFlag,                   //  1.广告  0 新闻
            goldenText: goldenText,
            day: day,
            id: item.id,
            time: getTime(item.timestamp),
            time1: server.getDttTime(item.timestamp),
            level: level,
            urlTitle: item.urlTitle,
            displayStar: displayStar,
            star1: s[0],
            star2: s[1],
            star3: s[2],
            star4: s[3],
            star5: s[4],
            goodStr: i18n.t("good") + " ",
            badStr: i18n.t("bad") + " ",
            goodNumber: goodNumber,
            badNumber: badNumber,
            goodPic: goodPic,
            badPic: badPic,
            goodClass: goodClass,
            badClass: badClass,
            index: i
        });
    }
    return newItems;
}

//加载页面数据
var loadData = function () {
   //无网络状态，提示信息
    if(api.connectionType == "none" ) {
      app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
     }
    pageIndex = 1;
    noMore = false;
    $("#loading")[0].innerHTML = "";
    $("#loading-anim")[0].display = "visible";
    $(".list-time-fix").css('display', 'none');    //下拉刷先时，置顶时间先隐藏
    loadListData();
}

//加载列表数据
function loadListData() {
    var user = server.getUser();
    var param = {
        page: pageIndex,
        limit: pageSize,
        countryId: server.getCountryId(),
        languageId: server.getLanguageId()
    }
    if (!(user == null || user == "" || user == undefined)) {
        param.userId = user.userId;
    }
     //没有网络连接，缓存状态不再加载分页数据
    if(api.connectionType == "none") {
      if (pageIndex>1) {
        setTimeout(function () {
            $("#loading-anim")[0].display = "none";
        },1000)
          return;
      }
    }
    //请求列表信息流
    server.ajax({
        url: appcfg.host+'/v1/api/app/shortMessage/list.json',
        name: cacheName,
        method: 'post',
        data: param,
        success: function (rsp) {
            api.removeLaunchView({
                animation: {
                    type: 'fade',
                    duration: 500
                }
            });
            app.pull.stop();
            if (rsp.data.length > 0) {
                if (pageIndex == 1) { //首次加载或刷新
                    var myNode = $('#view-list')[0];
                    while (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                    listData = rsp.data;
                    // listRender.push('data', convert(listData), true);
                    var j = 0;
                    //处理：再次进入app时，提示更新数据的数量
                    var cacheV = api.getPrefs({ sync: true, key: cacheName });
                    if (cacheV) {
                      cacheV = JSON.parse(cacheV);
                      if(cacheV.data.length) {
                        firstNewsId = cacheV.data[0].id;
                      }else {
                        j = rsp.data.length;
                      }
                    }else {
                        j = rsp.data.length;
                    }
                    for (var i = 0; i < rsp.data.length; i++) {
                        if (firstNewsId == rsp.data[i].id) {
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
                    firstNewsId = rsp.data[0].id;

                    $("#tophint")[0].style.display = "block";
                    setTimeout(function () {
                        $("#tophint")[0].style.display = "none";
                        $(".list-time-fix").css('display', 'block');            //置顶时间显示
                        $(".list-time-fix").text(dayHeight[0].num);             //加载置顶时间数据
                    }, 1000);
                    //页面结构加载完毕后处理合并的日期数组
                    $(function() {
                      dayHeight = [];
                      $('.list-time').each(function(i, e) {
                            var el = $(e);
                            var _this = $(this)
                            if(el.text()) {
                              dayHeight.push({
                                  height:el.offset().top-30,
                                  num: _this.text()
                                })
                              }

                      })
                    })
                } else { //加载更多
                    listData = listData.concat(rsp.data);
                      //页面结构加载完毕后处理合并的日期数组
                    $(function() {
                      dayHeight = [];
                      $('.list-time').each(function(i, e) {
                            var el = $(e);
                            var _this = $(this)
                            if(el.text()) {
                              dayHeight.push({
                                  height:el.offset().top,
                                  num: _this.text()
                                })
                              }

                      })
                    })
                }
                api.setPrefs({ key: cacheName, value: JSON.stringify(rsp) });
                listRender.push('data', convert(listData), true);

            } else { //没有消息了
                noMore = true;
                $("#loading")[0].innerHTML = i18n.t("no_more");
                $("#loading-anim")[0].display = "none";
                api.setPrefs({ key: cacheName, value: JSON.stringify(rsp) });
            }
        },
        error: function (err) {
            app.pull.stop();
            // app.toast(err.msg);
        }

    });
}

//判断是否点过赞
function isVote(msgId) {
    var b = false;
    listData.forEach(function (item) {
        console.log(JSON.stringify(item));
        if (item.id == msgId) {
            if (item.type == 0 || item.type == 1) {
                console.log("5467897654534567897867564534");
                b = true;
                return false;
            }
        }
    })
    return b;
}

//设置点赞
function setVoted(msgId, vote) {
    // var listData1 = [];
    listData.forEach(function (item) {
        console.log(JSON.stringify(item));
        if (item.id == msgId) {
            item.type = vote;
            if (vote == 0) {
                item.goodNumber += 1;
            } else {
                item.badNumber += 1;
            }
        }
        // listData1.push(item);
    });
    // listData = listData1;
}

function clock() {
    // var myNode1 = $('#view-list > [index=' + 0 + ']' +" > .list-time");
    // var list = $('#view-list')[0];
    // console.log("list高度"+$(list).height());
    // console.log($(myNode1).height());
    // console.log("滑动距离"+window.scrollY);
}

//滑动页面事件，并处理归类日期置顶
function is_scroll () {
  $.event.add(window, "scroll", function() {
      //计算页面滑动的距离
      var p = $(window).scrollTop();
      if(api.systemType=="ios"){
            $(".list-time-fix").css('display',((p) >0) ? 'block' : 'none');
      }
      // console.log(p);
      // console.log(JSON.stringify(dayHeight));

      if (dayHeight.length == 1) {
          $(".list-time-fix").text(dayHeight[0].num);
      } else {
        for(var i = 0; i<dayHeight.length-1; i++) {
           var height1 = dayHeight[i].height;
           var height2 = dayHeight[i+1].height;
           if(p >= height1 && p < height2) {
               console.log(i);
                 $(".list-time-fix").text(dayHeight[i].num);

           }
           else if(  p >= dayHeight[dayHeight.length-1].height ) {
                var cont = dayHeight[dayHeight.length-1].num;
                $(".list-time-fix").text(cont);
           }
         }
      }

  })
}
// 点击分享快讯
function openShare(index) {
  var content;
  var time = $(".share")[index].getAttribute("data-time");
  var text = $(".share")[index].getAttribute("data-text");            //5星以下文字
  var id = $(".share")[index].getAttribute("data-id");
  var goldenText = $(".share")[index].getAttribute("data-goldenText");  //5星金色文字
  if(goldenText) {
    content = goldenText
  }else {
    content = text
  }
  api.openWin({
      name: 'airdropShare',
      url: '../airdropShare/temp.html',
      pageParam: {
        time:time,
        text:content,
        id:id,
        type:"brief"
      }
  });

}
