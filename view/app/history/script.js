/*
 * layout
 */
var server;
var user;
var pageIndex = 1;
var pageSize = 20;
var noMore = false;
var loadMoreLock = true;
var listData1 = [];
define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    var $ = app.util;
    user = server.getUser();
    //加载列表数据
      server.loading(0);
    var loadListData = function() {
        server.ajax({
            url: appcfg.host+'/v1/api/app/user/queryReadHistory.json',
            method: 'post',
            data: {
                userId: user.userId,
                page: pageIndex,
                limit: pageSize
            },
            success: function(ret) {
                server.loading(1);
                $("#loading-anim")[0].style.display = "none";
                console.log(JSON.stringify(ret))
                // loadMoreLock = false;
                if (ret.code != 200) {
                    // alert(ret.msg);
                    return;
                }
                var listData = ret.data; //侧滑操作列表
                if (listData.length < pageSize) {
                    noMore = true;
                    // $("#loading")[0].innerHTML = i18n.t("no_more");
                    // $("#loading-anim")[0].style.display = "none";
                    if (listData.length == 0 ) {
                        if(loadMoreLock){
                          $('.page-hint')[0].style.display = "block";
                          return;
                        }else{
                          $("#loading-anim")[0].style.display = "none";
                          $("#loading")[0].innerHTML = i18n.t("no_more");
                            loadMoreLock = true;
                        }

                    }

                }
                // var leng=listData.length;
                listData.forEach(function(item, index) {
                    item.listImgUrl = "http:" + item.listImgUrl;
                    item.newsTime = server.getNewsTime(item.timestamp);
                    //若当前inde !=0，判断和上一个date是否一致，如果一致则跳过
                    if (index == 0 ) {
                       if(pageIndex==1){
                           item.date = server.getTimeMMDDYYYY(item.readTime);
                       }else if(server.getTimeMMDDYYYY(listData1[listData1.length-1].readTime) != server.getTimeMMDDYYYY(item.readTime)){
                          item.date = server.getTimeMMDDYYYY(item.readTime);
                       }

                    }else if(server.getTimeMMDDYYYY(listData[index-1].readTime) != server.getTimeMMDDYYYY(item.readTime)) {
                          item.date = server.getTimeMMDDYYYY(item.readTime);
                    }
                    //若当前index！=length，判断和下一个date是否一致，如果不一致则隐藏边界
                    // if (index == listData.length-1 ||server.getTimeMMDDYYYY(listData[index+1].timestamp) != server.getTimeMMDDYYYY(item.timestamp)) {
                    //     item.border = "0px solid #d9d9d9"
                    // }

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
                    item.mutliMedia = mutliMedia;
                    item.displayMedia = displayMedia;
                    listData1.push(item);

                });
                document.getElementById('controlList').html=""
                console.warn(JSON.stringify(listData1));
                if (listData1.length > 0) {
                    require.async('option-list', function(optionList) {
                        var demo = optionList({
                            selector: '#controlList',
                            data: listData1,
                            buttons: []
                        });
                    });
                    imageCache();
                }
                  loadMoreLock = false;
            },
            error: function(err) {
                server.loading(1,api.frameName);
                loadMoreLock = false;
                // alert(JSON.stringify(err));
            }
        });
    }

    loadListData();
    // 安卓手机实现仿ios右滑返回功能
    if (api.systemType == "android") {
      api.addEventListener({
          name:'swiperight'
      }, function(ret, err){
         api.closeWin({
         });

      });
    }
    //打开详细页事件
    var openLock;
    $('#controlList').on('touchmove', '[data-guid]', function() {
        openLock = true;
    }).on('touchend', '[data-guid]', function() {
        if (openLock) {
            return openLock = false;
        }
        var id = this.getAttribute('data-id');
        var url = this.getAttribute('data-url');
        var title = this.querySelector("#title").innerHTML.trim();
        var param = {
            url: "http:" + url,
            title: title,
            newsId: id,
            type: 0
        }
        api.openWin({
            name: "detail",
            url: "../detailPage2/temp.html",
            pageParam: param,
        });
    });

    api.addEventListener({
        name: 'scrolltobottom'
    }, function(ret, err) {
        if (loadMoreLock) {
            // $("#loading-anim")[0].style.display = "none";
            // $("#loading")[0].innerHTML = i18n.t("no_more");
            return;
        }
        $("#loading-anim")[0].style.display = "inline-block";
        if (!noMore) {
            // $('#loading-anim')[0].display = "visible";
            // loadMore = true;
            pageIndex += 1;
            loadListData();
        }else{
          $("#loading-anim")[0].style.display = "none";
          $("#loading")[0].innerHTML = i18n.t("no_more");
        }
    });

    function refresh() {
        console.log("收藏页面刷新todo");
        setTimeout(function() {
            app.pull.stop();
        }, 300);
    };

});
//清除历史
function fnClear() {
    api.confirm({
        title: i18n.t('confirm'),
        msg: i18n.t('Whether_to_clear_all_the_history') + "?",
        buttons: [i18n.t('Clear'), i18n.t('cancel')]
    }, function(ret, err) {
        if (ret) {
            if (ret.buttonIndex == 1) {
                server.ajax({
                    url: appcfg.host+'/v1/api/app/user/deleteUserReadHistory.json',
                    data: {
                        userId: user.userId,
                    },
                    success: function(ret) {
                        listData1 = [];
                        $('#controlList')[0].style.display = "none";
                        $('.page-hint')[0].style.display = "block";
                    },
                    error: function(err) {
                        // alert(err);
                    }
                });
            }
        } else {
            //  alert( JSON.stringify( err ) );
        }
    });
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
