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
var shareSuccess;
var shareErr;
var uid;
define(function (require) {
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    require('sdk/common');

      app.ready(function(){
      mobSharePlus = api.require('mobSharePlus');
      mParam = api.pageParam;
      console.log(api.pageParam.imgUrl)
      // url = mParam.url;
      uid = server.getUser().userId;
      url = api.pageParam.url;
      title = api.pageParam.title;
      id = api.pageParam.id;
      shareSuccess = i18n.t("Sharing success");
      shareErr = i18n.t("Sharing failure");
      newUrl = appcfg.shareUrl + "news/"+id+".html";
      //有大图片，分享大图片，否则分享小图片
      if(api.pageParam.bigImg) {
        imgUrl.push(api.pageParam.bigImg);
      }else{
        imgUrl.push(api.pageParam.imgUrl);
      }

      console.log(JSON.stringify(mParam));
    })


  })



  function share(type){
    api.showProgress({
          style: 'default',
          animationType: 'fade',
          title: '',
          text: i18n.t("loading"),
          modal: true
      });
      setTimeout(function() {
        api.hideProgress();
      },30000)
    var url1 = url.replace("&env=app", "")
    url1 = url1.replace("env=app&", "")
    jQuery.ajax({
        type: "POST",
        url: "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBywXos_rbpZbaI6XA0B0JdlKDdWNvy_m8",
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            longUrl: newUrl
        }),
        dataType: 'json',
        success: function(ret) {
            path = ret.id;
            console.log(path);
            var sharedModule = api.require('shareAction');
            text = title + " " + path;
            text = text.replace(/&amp;nbsp/g, " ");
            text = text.replace(/&nbsp;/g, " ");
            text = text.replace(/&nbsp/g, " ");
            text = text.replace(/&amp;#160;/g, " ");
            text = text.replace(/&#160/g, " ");
            if(type == "facebook"){
                shareToFacebook()
            }else if(type == "twitter"){
                shareToTwitter()
            }else if( type == "more"){
                feixiang()
            }
        },
        error: function(err) {
            console.log(JSON.stringify(err));
        }
    });
  }

  $(document).on('touchend',function(e){
    // alert(0);
    var _con = $('#sys-info');
     if(!_con.is(e.target) && _con.has(e.target).length === 0){
        api.closeFrame({
            name: 'share'
        });

     }
  });

  //分享到facebook
  function shareToFacebook() {
  mobSharePlus.shareTo({
      target: 'facebook',
      title: title,
      titleUrl: path,             //新闻路径
      text: " ",
      imgPaths: imgUrl,
      url: path,
  }, function(ret, err) {
     api.hideProgress();
      if (ret.status) {
          shareDtt("facebook");
      } else {
        if(err.code==0){
          api.execScript({
              name: 'detail',
              script: "toast1('"+shareErr+"')"
          });
        }
      }
  });

  }


  //分享到其他平台
  function feixiang() {
        api.hideProgress();
        var sharedModule = api.require('shareAction');
        sharedModule.share({
            // path: mParam.title + " " + path,
            text: text,
            type: 'text',
            // path:text
        }, function(ret, err) {

            if (ret.status) {
                shareDtt("other");
            } else {
              if(err.code==0){
                api.execScript({
                    name: 'detail',
                    script: "toast1('"+shareErr+"')"
                });
              }
            }
        });
    }


  //分享到twitter
  function shareToTwitter() {
      mobSharePlus.shareTo({
          target: 'twitter',
          title: '111',
          titleUrl: path,
          // text: setString(title,30)+" "+url,                  //新闻路径
            text: text,                  //新闻路径
          imgPaths:imgUrl,           //图片路径
          url:path,
      }, function(ret, err) {
         api.hideProgress();
          if (ret.status) {
              shareDtt("twitter");
          } else {
            if(err.code==0){
              api.execScript({
                  name: 'detail',
                  script: "toast1('"+shareErr+"')"
              });
            }
          }
      });
  }
//截取字符
  function  setString(str, len) {
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

  function  shareDtt(name) {
    // 没登陆时，只提示分享成功
    if(!uid){
      api.toast({
        msg: i18n.t('shared'),
        duration: 2000,
        location: 'bottom'
      });
      return;
    }
      // 已陆时，调后台接口返回奖励积分
    server.ajax({
        url: appcfg.host+'/v1/api/app/news/shareNews.json',
        method: 'post',
        data: {
          userId: uid,
          newsId:id,
          shareUrl:path,
          social:name
        },
        success:(ret)=>{
          console.warn("分享新闻信息"+JSON.stringify(ret));
            if(ret.code == 200 ) {
              if(ret.data) {
                api.execScript({
                    name: 'detail',
                    script: "loginToast('"+shareSuccess+"',"+ret.data+")"
                });
              }else{
                api.execScript({
                    name: 'detail',
                    script: "toast1('"+shareSuccess+"')"
                });
              }

            }
        },
        error: function(err) {

        }
      })
  }
