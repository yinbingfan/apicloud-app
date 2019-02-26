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




var url;


define(function(require) {
    require('sdk/common');
    // $ = app.util;
    app.ready(function() {
        url = api.pageParam.url;
        api.openFrame({
            name:'twitterHref',
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


        //返回拦截
        app.key('keyback', function() {
            $("#title")[0].innerHTML = "";
            // document.querySelector('#title').innerHTML=''
            clickBack();
        });

    });

});


//点击后退，判断后退历史还是关闭页面
function clickBack() {
    api.historyBack({
        frameName: 'wikiDetailPage'
    }, function(ret, err) {
        isClickBack = true;
        $("#title")[0].innerHTML = "";

        if (!ret.status) {
            api.closeWin();
        }
    });
}

