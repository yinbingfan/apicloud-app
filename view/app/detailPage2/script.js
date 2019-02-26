/*
2018-05-04
APP-WAP交互约定：
App调用wap详情页时传递参数：
&env=app
&langCode={两位数内容语言码如ru}
&userId={userId}
&pageType=details
&deviceId={deviceId}
&newsId={newsId}
&clientType={clientType}
&version={version}
*/
var mParam;
var slideDatas = [];
var browser;
var user;
var newsId = "";
var type = 0;                             // 0 news 1 wiki 3链接
var isMarked = false;
var server;
var url;
var title;
var pageName = "";
var iOSUrlChangedOnce = false;
var isClickBack=false; //返回时，变为true
var back_list = false;
var tagTitles = {
    count: 0
}
var error = 0;               //1 进入错误页面

define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    var render = require('render');
    // $ = app.util;
    app.ready(function() {

        mParam = api.pageParam;
        console.warn("打开详情页参数" + JSON.stringify(mParam));
        if (mParam.type == 0 || mParam.type == 1) {
            newsId = mParam.newsId;
            isMarked = mParam.isMarked;
            // type = 0;
            // fnLogServer();
        }
        user = server.getUser();
        type = mParam.type;
        var linkFlag = mParam.linkFlag;                                        // brife页面带过来的参数 bug#638
        if(linkFlag==1){
          type = 3 //取值大于1，进行处理
        }
        if (type == 0 ||type==1) {

            getDetails()
            if(mParam.type == 'hide') {
              $("#top-right")[0].style.display = "none";
            }
        } else {
            $("#top-right")[0].style.display = "none";
        }
        url = mParam.url.trim();
        var langCode = server.getLanguageAABB().substring(0, 2);
        console.log("server.getLanguageAABB____________".langCode);
        // if (langCode == "zh") {
        //     langCode = "en";
        // }

        if (type==0) {    //新闻页面(静态页面，参数env=app用户wap端隐藏上下头部)
            url = appcfg.shareUrl + "news/" + newsId +".html"+"?env=app";

        }else if(type == 1) {               //wiki页面
            $("#top-right")[0].style.display = "none";
            url = appcfg.shareUrl + "wiki/" + newsId +".html"+"?env=app"
        }
        api.openFrame({
            name: 'detailPage',
            // url: "detailPage.html",
            url: url,
            progress: {
                type: "page", //加载进度效果类型，默认值为default，取值范围为default|page，default等同于showProgress参数效果；为page时，进度效果为仿浏览器类型，固定在页面的顶部
                // title: "", //type为default时显示的加载框标题
                // text: "", //type为default时显示的加载框内容
                color: "#fec930" //type为page时进度条的颜色，默认值为#45C01A，支持#FFF，#FFFFFF，rgb(255,255,255)，rgba(255,255,255,1.0)等格式
            },
            rect: {
                x: 0,
                y: 45,
                w: 'auto',
                h: 'auto'
            },
            bounces: true
                // ,useWKWebView: true
        });

      //9.11打开侧边栏隐藏模块：功能：滑动返回
        api.openFrame({
            name: 'detailPage_left',
            url: "detailPage.html",
            rect: {
                x: 0,
                y: 40,
                w: 30,
                h: "auto"
            },
            bounces: false,
            bgColor: 'rgba(0,0,0,0.0)',
            vScrollBarEnabled: true,
            hScrollBarEnabled: true
        });

        if(type == 3){
            api.setFrameClient({
             frameName: 'detailPage'
         }, function(ret, err) {
            hideTitlebar();
             switch (ret.state) {
                 case 0:
                     break;
                 case 1:
                     break;
                 case 2:
                    if(ret.url.indexOf("error.html") > 0){
                        error = 1
                    }
                     break;
                 case 3:
                     break;
                 case 4:
                     break;
                 default:
                     break;
             }
         });
        }
        if (type == 0 || type ==1) {
            api.setFrameClient({
                frameName: 'detailPage'
            }, function(ret, err) { //0-开始加载；1-加载进度发生变化；2-结束加载；3-title发生变化；4-url发生变化
                console.warn("FrameClient State_____________________________________________________" + ret.state);

                hideTitlebar();
                switch (ret.state) {
                    case 0:
                        hideTitlebar();
                        hideRightButton(ret.url)
                        break;
                    case 1:
                        break;
                    case 2:
                        url = ret.url
                        if(type == 0) {
                          var newsUrl;
                          if(url.indexOf('/news/') >= 0) {
                            var index = url.lastIndexOf("/news/");
                              newsUrl = url.substring(index+6,url.length);
                              newsUrl = parseInt(newsUrl)
                              newsId = newsUrl;
                              getDetails();
                              readToGetDtt(newsUrl);
                            //  console.log(obj);
                              // newsUrl = url.split('/').splice(-1)[0].split('.')[0]
                          } else {
                              // newsUrl = url.split('?')[0].split('/').slice(-2)[0].split('_')[0]
                          }
                        }
                        fnChangeFontSize(server.getFontSize());

                        /*
                        * 点击分享
                        * */
                        $('#ic_news_share').on('touchstart',function () {   //页面加载完成执行点击分享
                            api.openFrame({
                                name : 'share',
                                url : "share/temp.html",
                                rect :  {
                                  x : 0,
                                  y : 0,
                                  w : api.winWidth,
                                  h : api.winHeight
                                },
                                bounces : false,
                                opaque : false,
                                pageParam:{
                                  url:url,
                                  title:title,
                                  imgUrl:mParam.cover,
                                  bigImg:mParam.bigImg,
                                  id: mParam.newsId
                                },
                                allowEdit : false,
                                useWKWebView:true,
                                bgColor : 'rgba(0,0,0,0.5)',//主要是这里起作用哦
                                vScrollBarEnabled : true,
                                hScrollBarEnabled : true,
                                reload : false
                            });
                        });
                        console.warn('ret>>>>>' + JSON.stringify(ret))
                        if (api.systemType == "ios") {
                            url = ret.url
                        }
                        // hideRightButton(url)

                        break;
                    case 3:
                        pageTitle = ret.title;
                        title = ret.title;
                        break;
                    case 4:
                        if (ret.url.indexOf('/news/') >= 0||ret.url.indexOf('/wiki/') >= 0) {
                            type = 0;
                            url = ret.url;
                            if(url.indexOf('/news/') >= 0) {
                                newsId = url.split('/').splice(-1)[0].split('.')[0]
                            } else {
                                newsId = url.split('?')[0].split('/').slice(-2)[0].split('_')[0]
                            }
                            getDetails();

                            $("#title")[0].innerHTML = "";

                        } else {
                            newsId = ''
                        }
                        if (api.systemType == "ios") { //iOS的URL第一次打开就会改变一次
                            if (back_list) {
                              titles.pop();
                              if(titles.length == 1){
                                    $("#top-right")[0].style.display = "block";
                              }
                            }
                            back_list = false;
                        }
                        break;
                    case 5:
                        break;
                    case 6:
                        break;
                    default:
                        break;
                }
            });
            app.subscribe("changeFontSize", function(msg) {
                console.log("改变字体大小" + msg);
                setTimeout(fnChangeFontSize(msg), 10000);
            });
        }
        //返回拦截
        app.key('keyback', function() {
            $("#title")[0].innerHTML = "";
            clickBack();
        });

    });

});

var hided = false;
// 隐藏右上角按钮
function hideRightButton (url) {
    if (!url) return
    tagTitles[url] = {
        tag: '',
        hideRightBtn: ''
    }
    if (url.indexOf('/tag') >= 0 || url.indexOf('/wiki_tag') >= 0) {
        type = 2
        $("#title")[0].innerHTML = "";
        if (url.indexOf("tagName=") > 0) {
            var tag = url.substring(url.indexOf("tagName=")).split('=')[1]
            $("#title")[0].innerHTML = decodeURI(tag);
            tagTitles[url].tag = decodeURI(tag)

        }else{
            tagTitles[url].tag = ""
            // titles.push(decodeURI("false"))
        }
            // back_list.push("true")
    } else {
        $("#title")[0].innerHTML = ""
        tagTitles[url].tag = ""
    }
    // 判断是否详情页 显示右上角
    if(url.indexOf('/detail.html') >=0 || url.indexOf('/news/')>=0) {
        tagTitles[url].hideRightBtn = false
        // $("#favorite").attr("src","../../../res/img/ic_news_mark@3x.png")
          getDetails();
        $("#top-right")[0].style.display = "block";
    } else {
        tagTitles[url].hideRightBtn = true
        $("#favorite").attr("src","../../../res/img/ic_news_mark@3x.png")
        $("#top-right")[0].style.display = "none";
    }
    tagTitles[url].newsId = newsId
    if(!isClickBack) {
        tagTitles.count++
    } else {
        isClickBack = false
    }
    if(url.indexOf("error.html") > 0){
        error = 1
    }

    console.log($("#title")[0].innerHTML);
    console.log(tagTitles[url].tag);
}
//隐藏标题栏
function hideTitlebar() {
    api.execScript({
        frameName: 'detailPage',
        script: 'try{$(".chead-wrap")[0].style.display="none";$("#news_details_content")[0].style.marginTop="0";$(".load-app").hide()}catch(e){}'
    });
    api.execScript({
        frameName: 'detailPage',
        script: 'try{$(".load-app").hide();$(".chead-wrap").hide();$(".news-main-container")[0].style.marginTop="0";$("#news_details_content")[0].style.marginTop="0";console.log("hello");}catch(e){}'
    });
}
//修改字号大小弹窗
function changeFontSizePopup() {
    api.openFrame({
        name: 'changeFontSize',
        url: '../change/changesize.html',
        rect: {
            x: 0,
            y: 0,
            w: "auto",
            h: "auto"
        },
        pageParam: {
            name: 'test'
        },
        bgColor: 'rgba(0,0,0,0.4)',
        bounces: false,
        vScrollBarEnabled: false,
        hScrollBarEnabled: false
    });
    api.bringFrameToFront({
        from: 'changeFontSize'
    });
}
//修改字号大小
function fnChangeFontSize(size) {
    var scriptStr;
    var fontSize;
    var style;
    size = size + "";
    switch (size) {
        case "0":
            fontSize = ".24";
            style = "env-s";
            break;
        case "1":
            fontSize = ".36";
            style = "env-m";
            break;
        case "2":
            fontSize = ".48";
            style = "env-l";
            break;
        default:
            break;
    }
    console.log(fontSize);
    scriptStr = '$(".Editor-body p").removeClass("env-s");$(".Editor-body p").removeClass("env-m");$(".Editor-body p").removeClass("env-l");$(".Editor-body p").addClass("'+style+'");console.log("haha")'
    if(url.indexOf('/news/') >= 0){
        api.execScript({
            name: "detail",
            frameName: 'detailPage',
            script: scriptStr
        });
    }

}
//收藏新闻
$("#favorite").on("touchstart",function() {
  var user = server.getUser();
  if (!server.isBlank(user)) {
      var param;
      var url1;
      // url1: false ? 'user/saveUserFavorites.json' : 'user/deleteUserFavorites.json';
      url1 = isMarked ? appcfg.host+'/v1/api/app/user/deleteUserFavorites.json' : appcfg.host+'/v1/api/app/user/saveUserFavorites.json';

      if (isMarked == 0) {
          url1 =  appcfg.host+'/v1/api/app/user/saveUserFavorites.json';
      } else {
          url1 =  appcfg.host+'/v1/api/app/user/deleteUserFavorites.json';
      }
      server.setNewsMark(newsId, isMarked ? 0 : 1);
      param = {
          userId: user.userId,
          newsId: newsId
      }
      console.log("点击收藏 isMarked" + isMarked + "url: " + url1);
      console.warn("param>>>>>>>" + JSON.stringify(param));
      //收藏/取消收藏news
      server.ajax({
          url: url1,
          method: 'post',
          data: param,
          success: function(ret) {
              console.log(JSON.stringify(ret))
              if (isMarked == false) {
                  console.log("收藏成功 newsId: " + newsId);
                  // $("#favorite").src = "../../../res/img/ic_news_marked@3x.png";
                    $("#favorite").attr("src","../../../res/img/ic_news_marked@3x.png")
                  isMarked = true;

              } else {
                  console.log("取消收藏成功 newsId: " + newsId);
                  // $("#favorite").src = "../../../res/img/ic_news_mark@3x.png";
                  $("#favorite").attr("src","../../../res/img/ic_news_mark@3x.png")
                  isMarked = false;
              }
          },
          error: function(err) {
              console.log(JSON.stringify(err))
              // alert(JSON.stringify(err));
              // app.toast(err.body.data);
          }
      });
  } else {
      api.openWin({
          name: 'entry',
          url: '../entry/temp.html',
          pageParam: {
            type:"shoucang"
          }
      });

  }

})

//点击分享，调用APICloud默认分享模块
function clickShare() {
    var url1 = url.replace("&env=app", "")
    url1 = url1.replace("env=app&", "")
    jQuery.ajax({
        type: "POST",
        url: "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBywXos_rbpZbaI6XA0B0JdlKDdWNvy_m8",
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            longUrl: url1
        }),
        dataType: 'json',
        success: function(ret) {
            var path = ret.id;
            console.log(path);
            var sharedModule = api.require('shareAction');
            var text = title + " " + path;
            text = text.replace(/&amp;nbsp/g, " ");
            text = text.replace(/&nbsp;/g, " ");
            text = text.replace(/&nbsp/g, " ");
            text = text.replace(/&amp;#160;/g, " ");
            text = text.replace(/&#160/g, " ");
            text = sharedModule.share({
                // path: mParam.title + " " + path,
                text: text,
                type: 'text'
            });
        },
        error: function(err) {
            console.log(JSON.stringify(err));
        }
    });
}

//数据埋点
function fnLogServer() {
    var clientType, deviceId, userId;
    deviceId = api.deviceId;
    if (api.systemType == "android") {
        clientType = 0;
    } else {
        clientType = 1;
    }
    if (server.getUser()) {
        userId = server.getUser().userId;
    }
    server.ajax({
        url: appcfg.host+'/v1/api/app/eventTrack/sendTrackNews.json',
        data: {
            clientType: clientType,
            newsId: newsId,
            deviceId: deviceId,
            userId: userId
        },
        success: function(ret) {
            console.log(JSON.stringify(ret));
        },
        error: function(err) {
            console.log(JSON.stringify(err));
        }
    })
}
//点击后退，判断后退历史还是关闭页面
function clickBack() {
    api.historyBack({
        frameName: 'detailPage'
    }, function(ret, err) {
        if (!ret.status || error==1) {
            api.closeWin();
        }else{
            let lastKey = Object.keys(tagTitles).pop()
            isClickBack = true
            delete tagTitles[lastKey]
            let lastVal = Object.values(tagTitles).pop()
            tagTitles.count--

            if(lastVal.newsId) {
                newsId = lastVal.newsId
                getDetails()
            }

            if(lastVal.hideRightBtn) {
                $("#top-right")[0].style.display = "none";
            } else {
                $("#top-right")[0].style.display = "block";
            }

            tagTitles.count--
            if(tagTitles.count <= 1) {
                iOSUrlChangedOnce = false
                $("#top-right").show();
            }
        }
    });
}
//网络请求新闻详情
function getDetails() {
    if (server.getUser()) {
        api.ajax({
            url: appcfg.host+'/v1/api/app/news/queryDetails.json',
            method: 'post',
            data: {
                values: {
                    id: newsId,
                    userId: server.getUser().userId
                }
            }
        }, function(ret, err) {
            if (ret) {


                if(ret.data!=null){
                    if (ret.data.isFavorite == true) {                          // 收藏
                        isMarked = true;
                        $("#favorite")[0].src = "../../../res/img/ic_news_marked@3x.png";
                    } else if(ret.data.isFavorite == false||ret.data.isFavorite ==null||ret.data.isFavorite ==''){
                        isMarked = false;
                        $("#favorite")[0].src = "../../../res/img/ic_news_mark@3x.png";
                    }else {
                        isMarked = false;
                        $("#favorite")[0].src = "../../../res/img/ic_news_mark@3x.png";
                    }
                }


                console.log(JSON.stringify(ret));
            } else {
                //

                (JSON.stringify(err));
                // app.toast(err.body.data);
                console.log(JSON.stringify(err));
            }
        });
        // if (!server.isBlank(server.getNewsMark(newsId))) {
        //     isMarked = server.getNewsMark(newsId);
        // }
        // if (isMarked == true) {
        //     $("#favorite")[0].src = "../../../res/img/ic_news_marked@3x.png";
        // } else {
        //     $("#favorite")[0].src = "../../../res/img/ic_news_mark@3x.png";
        // }
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

// 老用户升级到DTT版本登录提示
function toast1(title) {
   server.toast1(title)
}
//阅读文章获取积分
function readToGetDtt(ID) {
  var uid = server.getUser().userId;
  if(!uid) {
    return;
  }
  console.warn("标记用户阅读过");
  // var isHistory = this.getAttribute('data-isHistory');
  server.ajax({
      url: appcfg.host+'/v1/api/app/user/saveUserReadHistory.json',
      method: 'post',
      data: {
          newsId: ID,
          userId: uid
      },
      success: function(ret) {
          console.log("标记阅读过_______" + JSON.stringify(ret));
      },
      error: function(err) {
          console.warn("err");
          // alert(JSON.stringify(err));
      }
  });
  server.ajax({
      url: appcfg.host+'/v1/api/app/news/addNewsReadCredit.json',
      method: 'post',
      data: {
        userId: uid,
        newsId: ID,
      },
      success:(ret)=>{
        console.warn("阅读新闻信息"+JSON.stringify(ret));
          if(ret.code == 200 && ret.data) {
            server.toast1("+  "+ret.data+"  DTT")
          }
      },
      error: function(err) {

      }
    })
}
