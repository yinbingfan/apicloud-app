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
var type = 1; // 0 news 1 其他 2
var isMarked = false;
var server;
var url;
var title;
var pageName = "";
var iOSUrlChangedOnce = false;
var isClickBack=false;
var tagTitles = {
    count: 0
}
define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    var render = require('render');
    // $ = app.util;
    app.ready(function() {
        mParam = api.pageParam;
        console.log("打开详情页参数" + JSON.stringify(mParam));
        if (mParam.type == 0) {
            newsId = mParam.newsId;
            isMarked = mParam.isMarked;
            type = 0;
            // fnLogServer();
        }
        user = server.getUser();
        if (type == 0 ||type==1) {
            getDetails()
        } else {
            // $("#top-right")[0].style.display = "none";
        }
        url = mParam.url;
        var langCode = server.getLanguageAABB().substring(0, 2);
        // if (langCode == "zh") {
        //     langCode = "en";
        // }
        // alert(type)
        if (type == 0||type==1) {
            url = mParam.url + "?env=app&wikiPage=wiki&langCode=" + langCode + "&version="
                //  + "20180408001";
                +
                server.getWapVersionCode() + "&pageType=details"
            var clientType;
            if (api.systemType == "android") {
                clientType = 0;
            } else {
                clientType = 1;
            }
            url = url + "&clientType=" + clientType;
            url = url + "&deviceId=" + api.deviceId;
            url = url + "&newsId=" + mParam.newsId;
            if (server.getUser()) {
                url = url + "&userId=" + server.getUser().userId;
            }

        }
        console.log("🐒🐒🐒🐒🐒🐒🐒"+url);

        api.openFrame({
            name: 'wikiDetailPage',
            // url: "../detailpageexample/temp.htm",
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
            //, useWKWebView: true
        });

        if (type == 0||type==1) {

            api.setFrameClient({
                frameName: 'wikiDetailPage'
            }, function(ret, err) { //0-开始加载；1-加载进度发生变化；2-结束加载；3-title发生变化；4-url发生变化
                hideTitlebar();

                switch (ret.state) {
                    case 0:
                        console.log("00000000"+ret.url);
                        // if(isClickBack){
                        //     url = ret.url
                        //     if (ret.url.indexOf("pageType=wiki") > 0) {
                        //         type = 2
                        //         $("#title")[0].innerHTML = "";
                        //         if (ret.url.indexOf("tagsName=") > 0) {
                        //             var sub1 = ret.url.substring(ret.url.indexOf("tagsName=") + 9)
                        //             var tag;
                        //             // console.log("00000000"+sub1);
                        //             if (sub1.indexOf("&") > 0) {
                        //                 tag = sub1.substring(0, sub1.indexOf("&"))
                        //             } else {
                        //                 tag = sub1
                        //             }
                        //             alert(tag)
                        //             $("#title")[0].innerHTML = decodeURI(tag);
                        //         }
                        //     }
                        //     isClickBack = false;
                        //     $("#title")[0].innerHTML = "";
                        // }
                        if(api.systemType == "android"){
                          url = ret.url
                          if (ret.url.indexOf("wiki_detail.html") > 0) {
                               $("#title")[0].innerHTML = "";
                          }else if(ret.url.indexOf("wikiTag.html") > 0) {
                               var sub1 = ret.url.substring(ret.url.indexOf("tagsName=") + 9)
                               var tag;
                               // console.log("00000000"+sub1);
                               if (sub1.indexOf("&") > 0) {
                                   tag = sub1.substring(0, sub1.indexOf("&newsType"))
                               } else {
                                   tag = sub1
                               }
                               $("#title")[0].innerHTML = decodeURI(tag);
                          }
                        }
                        break;
                    case 1:
                          console.log("11111111"+ret.url);
                        break;
                    case 2:
                          console.log("22222222"+ret.url);
                          if(api.systemType == "ios"){
                            url = ret.url
                            if (ret.url.indexOf("wiki_detail.html") > 0) {
                                 $("#title")[0].innerHTML = "";
                            }else if(ret.url.indexOf("wikiTag.html") > 0) {
                                 var sub1 = ret.url.substring(ret.url.indexOf("tagsName=") + 9)
                                 var tag;
                                 // console.log("00000000"+sub1);
                                 if (sub1.indexOf("&") > 0) {
                                     tag = sub1.substring(0, sub1.indexOf("&newsType"))
                                 } else {
                                     tag = sub1
                                 }
                                 $("#title")[0].innerHTML = decodeURI(tag);
                            }
                          }
                        break;
                    case 3:
                            console.log("3333333333"+ret.url);
                        break;
                    case 4:
                        console.log("4444444444"+url);
                        if (ret.url.indexOf("pageType=details") > 0 || ret.url.indexOf("details=details") > 0) {
                            type = 0;
                            // var url = location.search; //获取url中"?"符后的字串
                            url = ret.url;
                            $("#title")[0].innerHTML = "";
                            var newsIdIndex = url.indexOf("newsId") + 7;
                            var substring1 = url.substring(newsIdIndex);
                            var newsIdEndIndex = substring1.indexOf("&");
                            if (newsIdEndIndex == -1) {
                                newsId = substring1.substring(0);
                            } else {
                                newsId = substring1.substring(0, newsIdEndIndex);
                            }
                            getDetails();

                        } else if (ret.url.indexOf("pageType=wiki") > 0) {
                            type = 2;
                            $("#title")[0].innerHTML = "";
                            if (ret.url.indexOf("tagsName=") > 0) {
                                var sub1 = ret.url.substring(ret.url.indexOf("tagsName=") + 9)
                                var tag;
                                console.log(sub1);
                                if (sub1.indexOf("&") > 0) {
                                    tag = sub1.substring(0, sub1.indexOf("&"))
                                } else {
                                    tag = sub1
                                }
                                $("#title")[0].innerHTML = decodeURI(tag);
                            }

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
//隐藏标题栏
function hideTitlebar() {
    console.log(55555);
    console.log(55555);
    console.log(55555);
    console.log(55555);
    console.log(55555);
    api.execScript({
        frameName: 'wikiDetailPage',
        script: 'try{if($(".chead-wrap")[0].style.display!="none"){$(".chead-wrap")[0].style.display="none"};if($("section")[0].style.marginTop!="0"){$("section")[0].style.marginTop="0";}console.log("hello");$("#loadApp").hide()}catch(e){}'
    });
    api.execScript({
        frameName: 'wikiDetailPage',
        script: 'try{$("#loadApp").hide();$(".header-gap").hide();$(".tagList").css({margin:0})}catch(e){}'
    });
}


//点击后退，判断后退历史还是关闭页面
function clickBack() {
    api.historyBack({
        frameName: 'wikiDetailPage'
    }, function(ret, err) {
        isClickBack = true;
        $("#title")[0].innerHTML = "";
        // $("#title").html(document.title)
        if (!ret.status) {
            api.closeWin();
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
                    userId: user.userId
                }
            }
        }, function(ret, err) {
            if (ret) {
                if (ret.data.isFavorite == "1") {
                    isMarked = true;
                } else if(ret.data.isFavorite == "0"||ret.data.isFavorite ==null||ret.data.isFavorite ==''){
                    isMarked = false;

                }else {
                    isMarked = false;
                }
                console.log(JSON.stringify(ret));
            } else {

                console.log(JSON.stringify(err));
            }
        });
        if (!server.isBlank(server.getNewsMark(newsId))) {
            isMarked = server.getNewsMark(newsId);
        }

    }
}
