var mobSharePlus;
var mParam;
var url;
var newUrl;
var title;
var text;
var imgUrl= [ ];
var $;
var i18n;
var server;
var path;
var imgLink;
var id;
define(function (require) {
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    require('sdk/common');

      app.ready(function(){

      mParam = api.pageParam;
      console.log(api.pageParam.imgUrl)
      // url = mParam.url;
      url = api.pageParam.url;
      title = api.pageParam.title;
      id = api.pageParam.id;
      newUrl = appcfg.shareUrl + "news/"+id+".html";
      imgUrl.push(api.pageParam.imgUrl);
      console.log(JSON.stringify(mParam));

      var time = Date.parse(new Date());
      $(".time").html(server.getTime(time));
      $("#info").html(api.pageParam.name);
      $(".btn").html(i18n.t("got_it"));
    })

      // $(".time").html(new Date().Format("yyyy-MM-dd hh:mm"));

      $(document).on('touchend',function(e){
        var _con = $('#main');
         if(!_con.is(e.target) && _con.has(e.target).length === 0){
            api.closeFrame({

            });

         }
      });

      $(".btn").click("on",function() {
        // app.storage.val("briefNotification", true);
        // app.publish("briefNotification", "")
        api.closeFrame({

        });
      })
  })


  Date.prototype.Format = function (fmt) {
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
// new Date(data[i].updateDate).Format("yyyy-MM-dd hh:mm")
