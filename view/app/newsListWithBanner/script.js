/*
 * layout
 */
var paramString;
var mParam;
var cacheName;//新闻列表缓存参数
var slideCacheName; //轮播图缓存数据
var slideDatas = [];
var dailyUrl = "";
var dailyText = "";
var dailyId = "";
var dailyAd = "";
var dailyNewsId = "";
var loadMoreLock = true;
var user;
var server;
var i18n;
var firstNewsId;
var open = false;          //false 第一次进入轮播     true 刷新页面进入轮播

var listRender;
var slide;

var loadMore = false;
var noMore = false;
var pageIndex = 1;
var pageSize = 20;
var listData;

define(function(require) {
    server = require('sdk/server');
    var render = require('render');
    i18n = require('sdk/i18n');
    i18n.tran();
    var $ = app.util;
      mParam = api.pageParam;
      cacheName = 'slide_'+ server.getCountryId() + "_"+ mParam.channelId;
      slideCacheName = "slide_" + server.getCountryId();
    // paramString = app.getParam();
    // alert(JSON.stringify(paramString))
    // mParam = JSON.parse(paramString);
    user = server.getUser()

    listRender = render({
        el: '#view-list'
    })
    slide = require('slide');

    //打开详细页事件
    var openLock;
    var cacheV = api.getPrefs({ sync: true, key: cacheName });
    var UIScrollPicture = api.require('UIScrollPicture');
    slideDatas = api.getPrefs({ sync: true, key: slideCacheName });
    if(slideDatas) {
       slideDatas = JSON.parse(slideDatas);
    }
    if (cacheV) {
      if (mParam.index == 0) {
        $('#slideWrap')[0].style.display = 'block';
        $('#banner-bottom-divider')[0].style.display = 'block';
        $('#daily-bottom-divider')[0].style.display = 'block';
        openSlides(slideDatas)
      }

      listData = {
        item:convert(JSON.parse(cacheV).data)
      };
      $('#view-list')[0].innerHTML=(bt('main',listData));
          imageCache();
    }
    app.ready(function() {
        if(api.connectionType == "none") {
          api.execScript({
              name: 'index',
              frameName: 'subNews',
              script: "setTopInfo('noNet');"
          });
        }
        var param = app.getParam();
        // mParam = api.pageParam;
          app.pull.init(loadData);
          api.refreshHeaderLoading();


        var name = 'subNews';
        var top = 30;

        api.addEventListener({
            name: 'scrolltobottom'
        }, function(ret, err) {
            if (loadMoreLock) {
                return;
            }
            loadMoreLock = true;
            //refresh event callback
            // api.showProgress({
            //     title: '数据加载中',
            //     modal: true
            // });
            if (!noMore) {
                $("#bottom-loading")[0].style.display = "block";
                loadMore = true;
                loadListData();
            }
        });

    });
    $('#view-list').on('touchmove', '[data-url]', function() {
        openLock = true;
    }).on('touchend', '[data-url]', function() {
        if (openLock) {
            return openLock = false;
        }
        var index = this.getAttribute('index');
        var id = this.getAttribute('data-id');
        var url = this.getAttribute('data-url');
        var bigImg = this.getAttribute('data-big');
        var title = this.querySelector("#title").innerHTML.trim();
        var author = this.querySelector("#media").innerHTML;
        var cover = this.querySelector("img").getAttribute("src");
        var isMarked = this.getAttribute('data-isFavorite');
        // var isMarked = listData.item[index].isFavorite;
        var adFlag = this.getAttribute('data-adFlag');
        //有大图片则传递大图片（解决twitter分享图片问题）
        if(!server.isBlank(bigImg)) {
            bigImg = appcfg.imgHead + bigImg
        }else {
            bigImg =  ""
        }
        var param = {
            url: "http:" + url,
            title: title,
            author: author,
            cover: cover,
            bigImg: bigImg,
            newsId: id,
            type: 0,
            isMarked: isMarked
        }
        this.querySelector("#title").className = "";
        this.querySelector("#title").style.color='#B4B3B3';
        // if(api.connectionType != "none") {
        //
        //       server.setNewsRead(id + "");
        // }

        api.openWin({
            name: "detail",
            url: "../detailPage2/temp.html",
            pageParam: param,
            slidBackEnabled: false
        });
        // var user = server.getUser();
        // if (user) {
        //     console.warn("标记用户阅读过");
        //     var isHistory = this.getAttribute('data-isHistory');
        //     server.ajax({
        //         url: appcfg.host+'/v1/api/app/user/saveUserReadHistory.json',
        //         method: 'post',
        //         data: {
        //             newsId: id,
        //             userId: user.userId
        //         },
        //         success: function(ret) {
        //             // console.log("标记阅读过_______" + JSON.stringify(ret));
        //         },
        //         error: function(err) {
        //             console.warn("err");
        //             // alert(JSON.stringify(err));
        //         }
        //     });
        // }
    });



});

var loadData = function() {
  //无网络状态提示
    if(api.connectionType == "none" ) {
      app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
     }
    pageIndex = 1;
    loadMore = false;
    noMore = false;
    listData = [];
    loadListData();
    //如果不是首栏目，不加载轮播图和日推位
    if (mParam.index != 0) {
      // $("#tophint").show();                                  //解决收起 gif 后又弹出结果，之后再收起
        $('#slideWrap')[0].style.display = 'none';
        $('#banner-bottom-divider')[0].style.display = 'none';
        $('#daily-bottom-divider')[0].style.display = 'none';
        // $('#daily-message')[0].style.display = 'none';
    } else {
        $('#slideWrap')[0].style.display = 'block';
        $('#banner-bottom-divider')[0].style.display = 'block';
        $('#daily-bottom-divider')[0].style.display = 'block';
        //请求轮播图
        server.ajax({
            url: appcfg.host+'/v1/api/app/slide/list.json',
            name: slideCacheName, //轮播图缓存参数
            method: 'post',
            data: {
                countryId: server.getCountryId(),
                languageId: server.getLanguageId()
            },
            success: function(rsp) {
              console.warn(JSON.stringify(rsp))
              //保存缓存数据
              api.setPrefs({ key: slideCacheName, value: JSON.stringify(rsp) });
                if (rsp.code != 200) {
                    return;
                }
                  //保存缓存数据
                api.setPrefs({ key: slideCacheName, value: JSON.stringify(rsp) });
                openSlides(rsp)
                // app.pull.stop();

            },
            error: function(err) {
                console.log(JSON.stringify(err));
                // alert(JSON.stringify(err));
            }
        });

        //请求日推位
        // server.ajax({
        //     url: appcfg.host+'/v1/api/app/daily/list.json',
        //     method: 'post',
        //     data: {
        //         languageId: server.getLanguageId(),
        //         countryId: server.getCountryId()
        //     },
        //     success: function(rsp) {
        //         if (rsp.code != 200) {
        //             return;
        //         }
        //         // app.pull.stop();
        //         if (rsp && rsp.data.length > 0) {
        //             // $('#daily-message')[0].style.display = 'block';
        //             dailyUrl = rsp.data[0].url;
        //             dailyText = rsp.data[0].title;
        //             dailyId = rsp.data[0].id;
        //             dailyAd = rsp.data[0].adFlag;
        //             $('#banner-bottom-divider')[0].style.display = 'block';
        //             $('#daily-bottom-divider')[0].style.display = 'block';
        //             // $('#daily-message')[0].style.display = "block";
        //             // $('#daily-content')[0].innerHTML = rsp.data[0].title;
        //             // $('#daily-img')[0].src = "http:" + rsp.data[0].imgUrl;
        //             if (dailyAd == 0) {
        //                 dailyUrl = "http:" + dailyUrl;
        //                 dailyNewsId = rsp.data[0].newsId;
        //             }
        //         } else {
        //             $('#daily-bottom-divider')[0].style.display = 'none';
        //             // $('#daily-message')[0].style.display = "none";
        //         }
        //     },
        //     error: function(err) {
        //         $('#daily-bottom-divider')[0].style.display = 'none';
        //         // $('#daily-message')[0].style.display = "none";
        //         console.log(JSON.stringify(err));
        //     }
        // });
    }

}

function  openSlides(rsp) {
  if (rsp && rsp.data.length > 0) {
      slideDatas = rsp.data;
      var slideDatas1 = [];
      var imgUrls = [];
      var titles = [];
      for (var i = 0; i < slideDatas.length; i++) {
          var l = server.getLanguageId();
          imgUrls.push(appcfg.imgHead + slideDatas[i].imgUrl);
          if(l == 204) {
              titles.push(setString(slideDatas[i].title,66));      //解决俄语省略过短的问题
          }else {
              titles.push(setString(slideDatas[i].title,40));
          }
      }
      var UIScrollPicture = api.require('UIScrollPicture');
       //第一次加载轮播图
      if(!open){
        UIScrollPicture.open({
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: $("#slideWrap").outerHeight(true)
            },
            data: {
                paths:imgUrls,
                captions: titles
            },
            styles: {
                caption: {
                    height: 35,
                    color: '#FFFFFF',
                    size: 15,
                    bgColor: 'rgba(0,0,0,0.3)',
                    position: 'overlay',
                     alignment: 'center'
                },
                indicator: {
                  align: 'center',
                  color: 'rgba(248,248,248,0.82)',
                  activeColor: '#ffffff'
                }
            },
            placeholderImg: 'widget://res/img/ic_slide_default@2x.png',
            contentMode: 'scaleToFill',
            interval: 5,
            fixedOn: api.frameName,
            loop: true,
            fixed: false
        }, function(ret, err) {
            if (ret) {
              if(ret.eventType == "click"){
                var index_ = ret.index;

                var newsId1 = "";
                var url = slideDatas[index_].url;
                       if(!url){
                         api.openWin({
                             name: "error",
                             url: "../error/temp.html",
                             pageParam: ""
                         });
                         return;
                       }

                console.warn("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^" + JSON.stringify(slideDatas[index_]));
                console.warn("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^" + index_);
                if (slideDatas[index_].adFlag == 0) {
                    newsId1 = slideDatas[index_].newsId;
                    url = "http:" + slideDatas[index_].url;
                }
                console.warn("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^" + url);
                param1 = {
                    from: "轮播图",
                    index: index_,
                    url: url,
                    title: slideDatas[index_].title,
                    type: 0,                         //type0--新闻
                    linkFlag: slideDatas[index_].adFlag,     //linkFlag：1---广告
                    newsId: newsId1,
                    cover: appcfg.imgHead+slideDatas[index_].imgUrl       //轮播图传给分享页面的图片参数
                }
                server.ajaxTrack({
                    url: appcfg.host+'/v1/api/app/eventTrack/sendTrackSliding.json',
                    data: {
                        slidingId: slideDatas[index_].id
                    },
                    success: function(ret) {
                        console.log(JSON.stringify(ret));
                    },
                    error: function(err) {
                        console.log(JSON.stringify(err));
                    }
                })
                api.openWin({
                    name: "detail",
                    url: "../detailPage2/temp.html",
                    pageParam: param1
                });
              }

            } else {
                // alert(JSON.stringify(err));
            }
        });
        open = true;
      //刷新页面，加载轮播图数据
      }else{
        UIScrollPicture.reloadData({
            data: {
                paths: imgUrls,
                captions: titles
            }
        });
      }
      //下拉刷新刷新列表数据
      api.execScript({
          name: 'index',
          frameName: 'subNews',
          script: 'reloadList()'
      });
  }
}

function clickDaily() {
    server.ajaxTrack({
        url: appcfg.host+'/v1/api/app/eventTrack/sendTrackDaily.json',
        data: {
            dailyId: dailyId
        },
        success: function(ret) {},
        error: function(err) {
            // alert(JSON.stringify(err));
        }
    });
    var param2 = {
        from: "日推",
        title: dailyText,
        url: dailyUrl,
        newsId: dailyNewsId,
        type: dailyAd
    }
    paramString = JSON.stringify(param2);
    api.openWin({
        name: "detail",
        url: "../detailPage2/temp.html",
        pageParam: param2
    });
}

var loadListData = function() {
    if (loadMore) {
        pageIndex = pageIndex + 1;
    } else {}
    var param;
    var user = server.getUser();
    if (null != user) {
        param = {
            channelId: mParam.channelId,
            page: pageIndex,
            limit: pageSize,
            countryId: server.getCountryId(),
            userId: user.userId
        }
    } else {
        param = {
            channelId: mParam.channelId,
            page: pageIndex,
            limit: pageSize
        }
    }
    // 请求列表信息流
    server.ajax({
        url: appcfg.host+'/v1/api/app/news/list.json',
        name: cacheName,    //新闻列表缓存参数
        method: 'post',
        data: param,
        success: function(ret) {
            $('#view-list')[0].style.display = "block";
            api.removeLaunchView({
                animation: {
                    type: 'fade',
                    duration: 500
                }
            });

            if (ret.code != 200) {
                return;
            }
            $("#loading")[0].innerHTML = "";
            app.pull.stop();


            if (loadMore) {
              //没有网络连接，不再加载分页数据
              // if (api.connectionType == "none") {
              //   setTimeout(function () {
              //     $("#loading-anim")[0].display = "none";
              //       $("#bottom-loading")[0].style.display = "none";
              //   },1000)
              // return;
              // }

                var data1 = ret.data;
                // for (var i = 0; i < data1.length; i++) {
                //     listData.push(data1[i]);
                // }
                listData = {
                  item:convert(ret.data)
                };
                loadMore = false;
                // listRender.push('data', convert(data1), false);
                if (listData.item.length == ret.count || data1.length == 0) {
                    noMore = true;
                    $("#bottom-loading")[0].style.display = "block";
                    $("#loading")[0].innerHTML = i18n.t("no_more");
                    $("#loading-anim")[0].display = "none";
                }
                $('#view-list').append(bt('main',listData));
            } else {
              api.setFrameGroupAttr({
                  name: 'group1',
                  rect: {
                       x: 0,
                       y: 122,
                       w: 'auto',
                       h: api.winHeight-122-server.getFooterHeight()
                  },
              });
                if (ret.data.length == 0) {
                    noMore = true;
                    $("#bottom-loading")[0].style.display = "block";
                    $("#loading")[0].innerHTML = i18n.t("no_more");
                    $("#loading-anim")[0].display = "none";
                    api.execScript({
                        name: 'index',
                        frameName: 'subNews',
                        script: "setTopInfo('clear');"
                    });
                    //数据时空时，进行缓存结果
                    api.setPrefs({ key: cacheName, value: JSON.stringify(ret) });
                    return;
                }
                // var firstNewsId1 = ret.data[0].id;
                // var myNode = $('#view-list')[0];
                // while (myNode.firstChild) {
                //     myNode.removeChild(myNode.firstChild);
                // }
                var j = 0;
                //处理：再次进入app后，提示数据更新数量
                var cacheV = api.getPrefs({ sync: true, key: cacheName });
                if (cacheV) {
                  cacheV = JSON.parse(cacheV);
                  if(cacheV.data.length) {
                    firstNewsId = cacheV.data[0].id;
                  }else {
                    j = ret.data.length;
                  }
                }else{
                    j = ret.data.length;
                }
                for (var i = 0; i < ret.data.length; i++) {
                    if (firstNewsId == ret.data[i].id) {
                        j = i;
                    }
                }
                //数据缓存处理
                api.setPrefs({ key: cacheName, value: JSON.stringify(ret) });
                // if (j == 0) {
                //     $("#tophint")[0].innerHTML = i18n.t("it's_the_latest");
                //     $("#tophint")[0].style.color = "#B4B3B3";
                //     // return;
                // } else {
                //     $("#tophint")[0].innerHTML = "+" + j + " " + i18n.t("new_content");
                //     $("#tophint")[0].style.color = "#fec930";
                // }
                api.execScript({
                    name: 'index',
                    frameName: 'subNews',
                    script: "setTopInfo('"+j+"');"
                });

                firstNewsId = ret.data[0].id;
                listData = {
                  item:convert(ret.data)
                };
                // listRender.push('data', convert(listData), true);
                if (listData.item.length == ret.count || listData.item.length == 0 || listData.item.length < pageSize) {
                    noMore = true;
                    $("#bottom-loading")[0].style.display = "block";
                    $("#loading")[0].innerHTML = i18n.t("no_more");
                    $("#loading-anim")[0].display = "none";
                }

                $('#view-list').html(bt('main',listData));
                //图片缓存处理
                imageCache();
            }
               // listRender.push('data', convert(listData), true);




            loadMoreLock = false;
        },
        error: function(err) {
            console.log(JSON.stringify(err));
        }
    });
    server.ajaxTrack({
        url: appcfg.host+'/v1/api/app/eventTrack/sendTrackChannel.json',
        data: {
            channelId: mParam.channelId
        },
        success: function(ret) {

        },
        error: function(err) {

        }
    });
}

/**
 * 1、将服务端返回数据，转换成前端需要的格式
 * 2、若服务端返回格式和前端所需格式相同，则不需要改功能
 *
 * @param {Array} items
 */
function convert(items) {
    // console.log("convert(items)");
    var newItems = [];
    // console.log(JSON.stringify(items));
    items.forEach(function(item, index) {
        var titleClass1 = "title";
      console.warn(item.isHistory)
        if (server.getNewsRead(item.id + "") || item.isHistory == "1") {
            titleClass1 = "title-readed";
        };
        var markDisplay1 = "";
        if (item.conermarkTitle != null && item.conermarkTitle != "") {
            markDisplay1 = "visible";
        } else {
            markDisplay1 = "none";
        }
        var mutliMedia = "";
        var displayMedia = "visible";
        if (item.mutlimedia == 1) {
            displayMedia = "block";
            mutliMedia = "../../../res/img/radio@3x.png"
        } else if (item.mutlimedia == 2) {
            displayMedia = "block";
            mutliMedia = "../../../res/img/video@3x.png"
        } else {
            displayMedia = "none";
        }
        var rowStyle = "row news"
        if (index == items.length - 1) {
            rowStyle = "row news-last"
        }
        // console.log("标记显示：" + markDisplay1 + ",  " + item.conermarkTitle);
        newItems.push({
            url: item.storeUrl,
            id: item.id,
            title: item.title,
            media: item.name,
            markDisplay: markDisplay1,
            mark: item.conermarkTitle,
            cover: appcfg.imgHead + item.listImgUrl,
            big: item.detailImgUrl,
            time: server.getNewsTime(item.timestamp),
            titleClass: titleClass1,
            isHistory: item.isHistory,
            isFavorite: item.isFavorite,
            mutliMedia: mutliMedia,
            displayMedia: displayMedia,
            adFlag: item.adFlag,
            index: index,
            rowstyle: rowStyle
        });
    });
    return newItems;
}
function TrimAll(str) {
    return str.replace(/\s/g,"");
}

//截取字符
function setString(str, len) {
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

//图片缓存处理
function imageCache(){
    var srcs = $("img.newsImg");
    if (srcs.length > 0) {
       for(var i=0;i<srcs.length;i++){
         (function(imgObj){
                 var imgUrl = imgObj.attr("src");
               api.imageCache({
               url: imgUrl
           },function(ret,err){
               if (ret) {
                    imgObj.attr("src", ret.url);
               }
           });
         })($(srcs[i]));
       }
    }
}
