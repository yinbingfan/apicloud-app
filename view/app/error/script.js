var i18n;
var server;
var info;
var clickCount = 0;
define(function(require) {
    require('sdk/common');
    server = require('sdk/server')
    i18n = require('sdk/i18n')
    i18n.tran()
    app.ready(function() {
      var  ls_Old = appcfg.host;
      var ls_New = ""
      var  li_Index = 0 ; //变量声明
      li_Index = ls_Old.indexOf("com")+3;//获得.的位置
      ls_New = ls_Old.substring(0, li_Index ) ;//获得目标字符串
      var url = ls_New.replace('http:','https:');
      api.openFrame({
          name: 'error',
          url: url+"/404.html",
          rect: {
              x: 0,
              y: $(".title-bar").height(),
              w: "auto",
              h: api.frameHeight
          },
          pageParam: {
              name: 'test'
          },
          bounces: false,
          bgColor: '#ffffff',
          vScrollBarEnabled: true,
          hScrollBarEnabled: true
      });

    })

});
