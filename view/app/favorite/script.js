/*
 * layout
 */
var server;
var i18n;
var user;
var listData1 = [];
define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    user = server.getUser();

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
    var openLock,startx,endx,starty,endy,left="0px";
    $('#controlList').on('touchstart', '[data-guid]', function(e) {
         startx = e.touches[0].pageX;
         starty = e.touches[0].pageY;
         left = $(this).css("left");
        //  openLock = true;
    }).on('touchmove', '[data-guid]', function() {
        if(left != 0){                  //列表拉开状态，开始右侧滑动时取消api的滑动监听，1秒后重新打开
            api.removeEventListener({
                name: 'swiperight'
            });
            setTimeout(function() {
              api.addEventListener({
                  name:'swiperight'
              }, function(ret, err){
                 api.closeWin({
                 });

              });
            },1000)
        }
        openLock = true;              //openLock = true代表是滑动，否则是点击

    }).on('touchend', '[data-guid]', function(e) {
          endx = e.changedTouches[0].pageX;
          endy = e.changedTouches[0].pageY;
        if (openLock) {
           if(startx-endx <0 && left== "0px" && Math.abs(starty-endy)<15) {      //列表正常状态右滑，退出当前页面;y轴滑动距离超过15认为是上下滑动列表
             api.closeWin({

             });

           }
            return openLock = false
        }
        var id = this.getAttribute('data-id');
        var url = this.getAttribute('data-url');
        var title = this.querySelector("#title").innerHTML.trim();
        var param = {
            url: "http:" + url,
            title: title,
            newsId: id,
            type: 0,
            isMarked: 1
        }
        api.openWin({
            name: "detail",
            url: "../detailPage2/temp.html",
            pageParam: param,
        });
    });
    //加载列表数据
    function loadListData() {
        server.loading(0,api.frameName);
        $("#loading")[0].innerHTML = "";
        $("#loading-anim")[0].display = "visible";

        server.ajax({
            url: appcfg.host+'/v1/api/app/user/queryUserFavorites.json',
            method: 'post',
            data: {
                userId: user.userId,
                page: pageIndex,
                limit: pageSize
            },
            success: function(ret) {
                server.loading(1,api.frameName);
                console.log("获取收藏列表————————————" + JSON.stringify(ret));
                var listData = ret.data; //侧滑操作列表
                if (listData.length == 0) {
                    $('.page-hint')[0].style.display = "block";
                    noMore = true;
                    $("#loading")[0].innerHTML = i18n.t("no_more");
                    $("#loading-anim")[0].display = "none";
                    return;
                }
                if (listData.length < pageSize) {
                    noMore = true;
                    $("#loading")[0].innerHTML = i18n.t("no_more");
                    $("#loading-anim")[0].display = "none";
                }
                listData.forEach(function(item) {
                    item.listImgUrl = "http:" + item.listImgUrl;
                    item.newsTime = server.getNewsTime(item.timestamp);
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
                    // item.storeUrl = "http://www.baidu.com";
                    listData1.push(item);
                });
                console.warn(JSON.stringify(listData1));
                require.async('option-list', function(optionList) {
                    var demo = optionList({
                        selector: '#controlList',
                        data: listData1,
                        buttons: [{
                            className: 'btn-danger',
                            text: i18n.t('cancel')
                        }],
                        onClick: function(button, itemIndex, itemLength) {
                            console.log($(button).data);
                            var optionIndex = $(button).data('index');
                            var newsId = listData1[itemIndex].id;
                            console.log("itemIndex" + itemIndex + ",  " + newsId);
                            console.log("optionIndex" + optionIndex + ",  " + newsId);
                            switch (optionIndex) {
                                case 0:
                                    server.ajax({
                                        url: appcfg.host+'/v1/api/app/user/deleteUserFavorites.json',
                                        method: 'post',
                                        data: {
                                            userId: user.userId,
                                            newsId: newsId
                                        },
                                        success: function(ret, err) {
                                            console.log(itemIndex);
                                            demo.delete(itemIndex);
                                            console.log(listData1.length);
                                            listData1.splice(itemIndex,1);
                                            if(listData1.length==0){
                                              $('.page-hint')[0].style.display = "block";
                                            }
                                            console.log(listData1.length);
                                            console.log(demo);
                                            // alert(JSON.stringify(ret));
                                        },
                                        error: function(err) {
                                            // app.toast(JSON.stringify(err));
                                            console.log(JSON.stringify(err));
                                        }
                                    });

                                    break;
                                default:
                                    console.log('optionlist:error');
                            }

                        }
                    });
                });

            },
            error: function(err) {
              server.loading(0,api.frameName);
                // alert(JSON.stringify(err));
            }
        });
    }
    //滑倒底部自动加载
    api.addEventListener({
        name: 'scrolltobottom'
    }, function(ret, err) {
        if (!noMore) {
            pageIndex += 1;
            loadListData();
            console.log("加载更多");
        } else {
            console.log("没有更多了");
        }
    });

    function refresh() {
        console.log("收藏页面刷新todo");
        setTimeout(function() {
            app.pull.stop();
        }, 300);
    };

});
var pageIndex = 1;
var pageSize = 20;
var noMore = false;
