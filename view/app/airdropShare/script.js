let server,
    i18n;
define(function (require) {
    require('sdk/vue.min');
    server = require('sdk/server');
      require('sdk/qrcode');
    i18n = require('sdk/i18n');
    i18n.tran();
    var render = require('render');
    var listRender = render({
        el: '#view-lists'
    })
      app.ready(function(){
        api.parseTapmode();
        var h = $("#sys-info").height();
        var type = api.pageParam.type;
        if(type == "friends") {
          api.openFrame({
              name: 'airdropShareFriends',
              url: '../airdropShareFriends/temp.html',
              rect: {
                  x: 0,
                  y: 0,
                  w: 'auto',
                  h: api.winHeight-h
              },
              pageParam: api.pageParam,
              bounces: false,
              bgColor: '#fff',
              vScrollBarEnabled: false,
              hScrollBarEnabled: false
          });
        }else {
          api.openFrame({
              name: 'airdropShareBrief',
              url: '../airdropShareBrief/temp.html',
              rect: {
                  x: 0,
                  y: 0,
                  w: 'auto',
                  h: api.winHeight-h
              },
              pageParam:api.pageParam,
              bounces: false,
              bgColor: '#fff',
              vScrollBarEnabled: false,
              hScrollBarEnabled: false
          });
        }


        mobSharePlus = api.require('mobSharePlus');
        mParam = api.pageParam;
        console.log(api.pageParam.imgUrl)
        // url = mParam.url;



        console.log(JSON.stringify(mParam));
    })


  })



  function share(type){

    var name = api.pageParam.type;
    if(name == "friends") {
       api.execScript({
           frameName: 'airdropShareFriends',
           script: "shareFriends('"+type+"');"
       });

    } else if (name == "brief"){
      api.execScript({
          frameName: 'airdropShareBrief',
          script: "shareBrief('"+type+"');"
      });
    }

  }

  // $(document).on('touchend',function(e){
  //   // alert(0);
  //   var _con = $('#sys-info');
  //    if(!_con.is(e.target) && _con.has(e.target).length === 0){
  //       api.closeFrame({
  //           name: 'share'
  //       });
  //
  //    }
  // });

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
      if (ret.status) {
          api.toast({
            msg: i18n.t('shared'),
            duration: 2000,
            location: 'bottom'
          });
        } else {
          if(err.code==0){
            api.toast({
              msg: i18n.t('shared_error'),
              duration: 2000,
              location: 'bottom'
            });
          }
        }
  });

  }


  //分享到其他平台
  function feixiang() {
        var sharedModule = api.require('shareAction');

        sharedModule.share({
            // path: mParam.title + " " + path,
            text: text,
            type: 'text',
            // path:text
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
        if (ret.status) {
          api.toast({
            msg: i18n.t('shared'),
            duration: 2000,
            location: 'bottom'
          });
        }else{
      // alert(JSON.stringify(errs))
        if(err.code==0){
          api.toast({
            msg: i18n.t('shared_error'),
            duration: 2000,
            location: 'bottom'
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
        return
  }
