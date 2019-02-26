let server,
    i18n;
let shareSuccess;
let shareErr;
define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    var render = require('render');
    shareSuccess = i18n.t("Sharing success");
    shareErr = i18n.t("Sharing failure");
    var listRender = render({
        el: '#view-lists'
    })
    app.ready(function() {


    });

  new Vue({
        el: '#app',
        data: {
          time:"",
          text:""
        },
        mounted() {
          this.time = api.pageParam.time;
          this.text = api.pageParam.text
          //  二维码生成图片
          setTimeout(function() {
            var userId = server.getUser().userId;
            var url = appcfg.shareUrl  + server.getLoadingPageLang() + "/Intermediate_page";  //channelCode=1 openinstore的渠道1参数
                url = url + "?channelCode=2" + "&uid="+userId
           jQuery('#qrcodeCanvas').qrcode({
             render    : "canvas",
               text    : url,
               width : "300",               //二维码的宽度
               height : "300",              //二维码的高度
               background : "#ffffff",       //二维码的后景色
               foreground : "#000000",        //二维码的前景色
               src: '../../../res/img/LOGO@3x.png'             //二维码中间的图片
           });
           setTimeout(function() {
             html2canvas(document.querySelector("#qrcodeCanvas"), {
               allowTaint: true,
               taintTest: false,
               onrendered: function(canvas) {
                 var imgUrl = canvas.toDataURL("image/png");//这里通过canvas的toDataURL方法把它转换成base64编码
                    $("#qrcodeImg").attr("src",imgUrl);
                    // 处理页面克隆
                    var targetDom = $("#app");
                    copyDom = targetDom.clone();
                    copyDom.width(targetDom.width() + "px");
                    copyDom.height(targetDom.height() + "px");
                    copyDom.css({
                         "background-color": "white",
                         "position": "fixed",
                         "top": "0px",
                         "z-index": "-1",
                         "height": targetDom.height()
                     });

                  $("body").append(copyDom);
                   }
               });
           },300)
         },0)

        },
        methods: {
            fnGetList() {
              //生成二维码
              var userId = server.getUser().userId;
              var url = "http://1.dbit.applinzi.com/?channelCode=2&langCode="+ server.getUILanguageAABB()   //channelCode=2 openinstore的渠道2参数
                  url = url + "&uid="+userId
              jQuery('#qrcodeCanvas').qrcode({
                  render    : "canvas",
                  text    : url,
                  width : "88",               //二维码的宽度
                  height : "88",              //二维码的高度
                  background : "#ffffff",       //二维码的后景色
                  foreground : "#000000",        //二维码的前景色
                  src: '../../../res/img/LOGO@3x.png'             //二维码中间的图片
              });
            },
        },

        /*
      * 过滤器
      * */
        filters: {


        }
    })
})

function shareBrief(type) {
  api.requestPermission({
      list:['storage'],
      code:1
  }, function(ret, err){
      // api.alert({
      //     msg:JSON.stringify(ret)
      // });
      if(ret.list[0].granted) {
          toShareBrief(type)
      } else {
        api.hideProgress();
      }

  });
}

function toShareBrief(type) {
    api.showProgress({
          style: 'default',
          animationType: 'fade',
          title: '',
          text: '',
          modal: true
      });
      setTimeout(function() {
        api.hideProgress();
      },30000)
      html2canvas(copyDom, {
        allowTaint: true,
        taintTest: false,
        onrendered: function(canvas) {
            var image = new Image();
            image.src = canvas.toDataURL("image/webp", 1);
            var base64Str = image.src.split('base64,')[1];
            // alert(aaa)
            var imgPath = "fs://qrcode/";
            var imgName = uuid() + ".jpg"
            var trans = api.require('trans');
            trans.saveImage({
                base64Str: base64Str, //base64字符串不能包含data:image/png;base64,前缀
                album: false,
                imgPath: imgPath,
                imgName: imgName
            }, function(ret, err) {
                if (ret.status) {
                  if(type == "save") {
                      saveImgToPhone(imgName);
                  }
                  if(type == "facebook") {
                      shareToFacebook(imgName)
                  }
                  if(type == "twitter") {
                      shareToTwitter(imgName)
                  }
                } else {
                    // alert(JSON.stringify(err));
                }
            });
        }
      });
}
// 保存图片到相册
function saveImgToPhone(url) {
  var savePath =  'fs://juxiang/'+ uuid + ".jpg"
          api.saveMediaToAlbum({
              path: api.fsDir + "/qrcode/" + url,
              groupName: "dbit_imgs"
          }, function(ret, err) {
              api.hideProgress();
              if (ret && ret.status) {
                  server.toast1(i18n.t("Saved successfully"))
              } else {
                  server.toast1(i18n.t("Save failed"))
              }
          });
}

function shareToFacebook(url) {
  var  mobSharePlus = api.require('mobSharePlus');
  var  imgUrl = ["fs://qrcode/" + url];
  mobSharePlus.shareTo({
    target: 'facebook',
    title: "111",
    titleUrl: " ",             //新闻路径
    text: "111 ",
    imgPaths: imgUrl,
    url: " ",
  }, function(ret, err) {
      api.hideProgress();
      if (ret.status) {
          shareDtt("facebook");
      } else {
        if(err.code==0){
            server.toast1(shareErr)
        }
      }
  });
}

function shareToTwitter(url) {
  var  mobSharePlus = api.require('mobSharePlus');
  var  imgUrl = ["fs://qrcode/" + url];
  mobSharePlus.shareTo({
      target: 'twitter',
      // title: "",
      // titleUrl: "",             //新闻路径
      text: " ",
      imgPaths: imgUrl,
      // url: "",
  }, function(ret, err) {
      api.hideProgress();
      if (ret.status) {
          shareDtt("twitter");
      } else {
        if(err.code==0){
          server.toast1(shareErr)
        }
      }
  });
}
  // 分享成功弹窗
function shareDtt(name) {
  var uid = server.getUser().userId;
  if(!uid) {
    server.toast1(shareSuccess)
    return;
  }
  server.ajax({
      url: appcfg.host+'/v1/api/app/shortMessage/shareBrief.json',
      method: 'post',
      data: {
        userId: uid,
        messageId: api.pageParam.id,
        shareUrl: "",
        social: name
      },
      success:(ret)=>{
        console.warn("分享快讯信息"+JSON.stringify(ret));
          if(ret.code == 200 ) {
            if(ret.data) {
                server.toast2(shareSuccess,ret.data)
            }else {
                server.toast1(shareSuccess)
            }
          }
      },
      error: function(err) {
        server.toast1(shareSuccess)
      }
    })
}

function uuid() {
     var s = [];
     var hexDigits = "0123456789abcdef";
     for (var i = 0; i < 36; i++) {
         s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
     }
     s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
     s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
     s[8] = s[13] = s[18] = s[23] = "-";

     var uuid = s.join("");
     return uuid;
 }
