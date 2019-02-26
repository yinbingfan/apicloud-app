/*
 * layout
 */
var footHeight;
var i18n;
var server;
define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    footHeight = server.getFooterHeight()
    app.window.popoverElement({
        id: 'subbrief',
        name: "brief",
        url: '../briefList/tempba.html',
        top: 45,
        bottomMargin: footHeight,
        bounce: true
    });
    server.setBriefTopFrame("brief");
    //点击快讯
    $("#brief-container").click(function() {
        $(".container").removeClass("selected")
        $(this).addClass("selected")
        $("#twitter_bottom").removeClass("selected")
        $("#brief_bottom").addClass("selected")
        loadSubList(0)
    })
    //点击推特
    $("#twitter-container").click(function() {
        $(".container").removeClass("selected")
        $(this).addClass("selected")
        $("#twitter_bottom").addClass("selected")
        $("#brief_bottom").removeClass("selected")
        loadSubList(1)
    })
    //加载子哦页面
    var loadSubList = function(index_) {
        var name;
        var top = 45;
        var url;
        if (index_ == 0) {
            name = "brief";
            url = '../briefList/tempba.html';
        }
        if (index_ == 1) {
            name = "twitter";
            url = '../twitter/temp.html';
        }
        app.window.popoverElement({
            id: 'subbrief',
            name: name,
            url: url,
            top: 45,
            bottomMargin: footHeight,
            bounce: true
        });
        server.setBriefTopFrame(name);
    }

});

// 分类菜单点击的响应函数，切换Frame
function fnSetNavMenuIndex(index_) {
    // 首先更新菜单选中状态


    // if (index_ == 1) {
    //     document.querySelector("#menu-brief").classList.remove("selected");
    //     document.querySelector("#menu-twitter").classList.add("selected");
    // } else {
    //     document.querySelector("#menu-brief").classList.add("selected");
    //     document.querySelector("#menu-twitter").classList.remove("selected");
    // }

    //加载子页面列表
    var name;
    var top = 45;
    var url;
    if (index_ == 0) {
        name = "brief";
        url = '../briefList/tempba.html';
    }
    if (index_ == 1) {
        name = "twitter";
        url = '../twitter/temp.html';
    }
    app.window.popoverElement({
        id: 'subbrief',
        name: name,
        url: url,
        top: 45,
        bottomMargin: footHeight,
        bounce: true
    });
    server.setBriefTopFrame(name);
}
