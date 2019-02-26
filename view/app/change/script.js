var $;
var server;
define(function(require) {
    server = require('sdk/server')
    var i18n = require('sdk/i18n');
    i18n.tran();
    require('sdk/common');
    var render = require('render');
    //选中下标
    var fontSize = server.getFontSize();

    $("#font-size1")[0].classList.remove("selected");
    $("#font-size3")[0].classList.remove("selected");
    //判断之前保存的选中，设置样式
    switch (fontSize) {
        case "0":
            $("#font-size1")[0].classList.add("selected");
            $("#font-size2")[0].classList.remove("selected");
            break;
        case "1":
            $("#font-size2")[0].classList.add("selected");
            break;
        case "2":
            $("#font-size3")[0].classList.add("selected");
            $("#font-size2")[0].classList.remove("selected");
            break;
        default:
            break;
    }
    $('#container')[0].style.display = "inline-block";

});
var clickLock = false;

//修改字体
function changeFontSize(size) {
    // clickLock = true;
    $("#font-size1")[0].classList.remove("selected");
    $("#font-size2")[0].classList.remove("selected");
    $("#font-size3")[0].classList.remove("selected");
    switch (size) {
        case 0:
            $("#font-size1")[0].classList.add("selected");
            break;
        case 1:
            $("#font-size2")[0].classList.add("selected");
            break;
        case 2:
            $("#font-size3")[0].classList.add("selected");
            break;
        default:
            break;
    }
    app.publish("changeFontSize", size);
    server.setFontSize(size + "");
    // api.closeFrame();
    stopBubble($('#container')[0]);
}

//防止点击事件穿透
function fnClickContainer() {
    console.warn("fnClickContainer");
    clickLock = true;
}
//点击空白处，关闭页面
function fnClickBlack() {
    console.warn("fnClickBlack");
    console.warn(clickLock);
    if (clickLock) {
        clickLock = false;
        return;
    }
    api.closeFrame();
}

//防止点击事件穿透
function stopBubble(e) {
    if (e && e.stopPropagation)
        e.stopPropagation()
    else
        window.event.cancelBubble = true
}
