/**
 * member
 */
var $;
var user;
var i18n;
var server;
var frameName;

// //绑定邮箱

$('.email-bind').click(function () {                          //绑定邮箱页面
    api.openWin({
        name: 'emailBind',
        url: '../emailBind/temp.html'
    });
})


function UserInfo() {

    server.ajax({
        url: appcfg.host+'/v1/api/app/user/getUserInfo.json',
        method: 'post',
        data: {
            userId: server.getUser().userId,
            token: server.getToken(),
            systemLanguage: navigator.language,
            uiLanguage: server.getUILanguageAABB(),
            contentArea: server.getCountryId()
        },
        success: (ret) => {

            if (ret.data.email != null) {
                if (ret.data.email.binded == 1) {
                    $('.email-bind').hide();
                    $('.email-unbind').show()
                    $('.email-text')[1].innerHTML = ret.data.email.emailAddress
                    $('.email-text-bind').hide()
                } else {
                    $('.email-bind').show();
                    $('.email-unbind').hide()
                    $('.email-text')[0].innerHTML = ret.data.email.emailAddress
                    $('.email-text-bind').show()
                }
            } else {
                $('.email-bind').hide();
            }
        },
        error: (err) => {
            console.log(err)
        }
    })
}

define(function (require) {
    require('sdk/common');
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    frameName = api.frameName;
    if (server.getUser().phoneCode != undefined && server.getUser().phoneCode != null) {
        $('.email-bind').hide();
    } else {
        this.UserInfo()
    }

    // 安卓手机实现仿ios右滑返回功能
    if (api.systemType == "android") {
      api.addEventListener({
          name:'swiperight'
      }, function(ret, err){
         api.closeWin({
         });

      });
    }


    var pageParam = api.pageParam;
    console.log(api.pageParam + "🐻🐻🐻🐻🐻🐻🐻🐻🐻");
    console.log(JSON.stringify(pageParam) + "  " + pageParam.from);
    if (pageParam.from == "login") {
        console.log("__________________________");
        app.publish("closeLoginWin", "login");
        api.closeWin({
            name: 'login'
        });

        //手机号第一次登录成功弹窗
        if(pageParam.num == 0) {
            loginToast(pageParam.title,pageParam.text);
        }
        // 手机号老用户升级DTT版本弹窗
        if(pageParam.num == 1) {
            oldToast();
        }
    }
    //为空判断
    var isBlank = function (obj) {
        if (obj == undefined || obj == null || obj.length == 0 || obj == '') {
            return true;
        }
        return false;
    };
    user = server.getUser();
    console.log("个人中心本地获取用户信息————————————" + JSON.stringify(user.userId));
    console.log("个人中心本地获取用户信息————————————" + JSON.stringify(user.phoneCode));
    if (!isBlank(user.userName)) {
        $('#nickname-text').text(user.userName);
    } else {


        // var phone = user.phoneCode;
        // s = phone.substr(0, 3) + "****" + phone.substr(7);
        // $('#nickname-text').text(s);

        if (server.getUser().phoneCode != undefined) {
            var phone = user.phoneCode;
            s = phone.substr(0, 3) + "****" + phone.substr(7);
            $('#nickname-text').text(s);
        } else if (server.getUser().email != undefined) {
            $('#nickname-text').text(server.getUser().email.emailAddress);

            if (server.getUser().email.binded == 0) {
                $('.email-text')[0].innerText = 'unverified'
            } else {
                $('.email-text')[1].innerText = server.getUser().email.emailAddress
            }
        }
    }
    if (null != user.userIconUrl) {
        $('#avatar')[0].src = appcfg.imgHead + user.userIconUrl;
    }
    if (user.gender == "female") {
        $('#male')[0].classList.remove("selected");
        $('#female')[0].classList.add("selected");
    } else if (user.gender == "male") {
        $('#male')[0].classList.add("selected");
        $('#female')[0].classList.remove("selected");
    }
    if (null != user.dateOfBirth) {
        $('#birthday-text').text(user.dateOfBirth);
        $('#birthday-point')[0].style.display = "none";
    }
    if (null != user.email) {
        $('#email-text').text(user.email.emailAddress);
    }

    $('#nickname').off('click').on('click', $.proxy(updateNickname, this));

    $('#birthday').off('click').on('click', $.proxy(updateBirthday, this));

    $('#email').off('click').on('click', $.proxy(updateEmail, this));
    //修改用户昵称
    function updateNickname() {
        app.prompt(function (text) {
            var $item = $('#nickname>right');
            var val = text.trim();
            if (isBlank(val)) {
                // $item.text('');
                api.toast({              //修改昵称为空时，给予提示
                    msg: i18n.t("the content can not be blank"),
                    duration: 2000,
                    location: 'bottom'
                });

                return;
            }
            $item.text(text);
            changeUserInfo("userName", text);
        }, function () {
            console.log('取消输入的回调');
        }, {
            title: i18n.t("nickname")
        });
    }


    function updateBirthday() {
        console.log($('#birthday>right').text() + "++++++++++++++++++");
        api.openPicker({
            type: 'date',
            date: $('#birthday>right').text().trim(),
            title: i18n.t('birthday')
        }, function (ret, err) {
            if (ret) {
                var $item = $('#birthday>right');
                if (isBlank(ret)) {
                    $item.text('');
                    return;
                }
                $item.text(ret.year + "-" + ret.month + "-" + ret.day);
                changeUserInfo("dateOfBirth", ret.year + "-" + ret.month + "-" + ret.day);
            } else {
                // alert(JSON.stringify(err));
            }
        });
    }

//更新用户邮箱地址
    function updateEmail() {
        app.prompt(function (text) {
            var $item = $('#email-text');
            if (!isEmail(text)) {
                app.toast(i18n.t('Email_format_is_incorrect'));
                // updateEmail();
                return;
            }
            $item.text(text);
            changeUserInfo("email", text);
        }, function () {
            console.log('取消输入的回调');
        }, {
            title: i18n.t("email")
        });
    }
});

//点击头像，选择头像
function fnClickPic() {
    api.actionSheet({
        title: i18n.t('set_avatar'),
        cancelTitle: i18n.t('cancel'),
        buttons: [i18n.t('camera'), i18n.t('album')]
    }, function (ret, err) {
        if (ret) {
            switch (ret.buttonIndex) {
                case 1:
                    console.log("getPic 1");
                    getCamera("camera");
                    break;
                case 2:
                    console.log("getPic 2");
                    getAlbum("album");
                    break;
                case 3:
                    // console.log("getPic 3");
                    // getPic("library");
                    break;
                default:

            }
        } else {
            // alert(JSON.stringify(err));
        }
    });


}
//相机权限
function getCamera(type){
  api.requestPermission({
      list:['camera'],
      code:1
  }, function(ret, err){
      // api.alert({
      //     msg:JSON.stringify(ret)
      // });
      if(ret.list[0].granted) {
        getAlbum(type)
      } else {

      }

  });
}
//存储权限
function getAlbum(type) {
  api.requestPermission({
      list:['storage'],
      code:2
  }, function(ret, err){
      // api.alert({
      //     msg:JSON.stringify(ret)
      // });
      if(ret.list[0].granted) {
          getPic(type);
      } else {

      }

  });
}

//点击性别
function fnClickMale() {
    $('#male')[0].classList.add("selected");
    $('#female')[0].classList.remove("selected");
    changeUserInfo("gender", "male");
}

//点击性别
function fnClickFemale() {
    $('#male')[0].classList.remove("selected");
    $('#female')[0].classList.add("selected");

    changeUserInfo("gender", "female");
}

/**
 0:nickname
 1:gender
 2:birthday
 3:email
 **/
//修改用户信息
function changeUserInfo(key, val) {
    user = server.getUser();
    var userId = user.userId;
    console.log("用户中心界面————————修改信息userId" + userId + ", key: " + key + ", value: " + val);
    server.ajax({
        url: appcfg.host+'/v1/api/app/user/updateUser.json',
        method: 'post',
        data: {
            value: val,
            userId: userId,
            type: key
        },
        success: function (ret) {
            console.log("用户中心界面————————修改信息ret：" + JSON.stringify(ret));
            server.setUser(ret.data)
            app.publish("changeUserInfo", "6");
            if (ret.code != 0) {
                // app.toast(ret.msg);
                return;
            }
        },
        error: function (err) {
            // app.toast(JSON.parse(err.msg).data);
        }
    });
}

//从本季获取图片
function getPic(from) {
    api.getPicture({
        sourceType: from,
        encodingType: 'jpg',
        mediaValue: 'pic',
        destinationType: 'url',
        allowEdit: true,
        quality: 100,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
    }, function (ret, err) {

        // alert("234rtf54w5tw4");
        if (!(server.isBlank(ret) || server.isBlank(ret.data))) {
          if(api.systemType == 'android'){
            var pars = {
                  fName : api.frameName,
                  wName: api.winName,
                  srcPath : ret.data,
                  x1 : 0,
                  y1 : 0,
                  w1 : api.winWidth,
                  h1 : api.winHeight - 45,
                  x2 : (api.winWidth - api.winWidth * 0.8) * 0.5,
                  y2 : (api.winHeight - 45 - api.winWidth * 0.8) * 0.5,
                  w2 : api.winWidth * 0.8,
                  h2 : api.winWidth * 0.8
              };
              openFrameFull('imageClip', {pars:pars});
              return;
          }
            console.log("获取图片成功" + JSON.stringify(ret));
            // alert(JSON.stringify(ret));
            setTimeout(function () {
                console.log("获取图片成功" + "userid: " + user.userId + "    " + JSON.stringify(ret));
                savePic(ret.data);
            }, 500);

        } else {
            // console.log("获取图片成功" + JSON.stringify(err));
            // alert(JSON.stringify(err));
        }
    });
}

function savePic(pic) {
  server.loading(0,api.frameName);
  api.setWinAttr({
      slidBackEnabled: false
  });
   uploadFile(pic);//上传图片到服务器
 }

 function uploadFile(filePath) {

     var param = {
         userId: user.userId,
         token: server.getToken()
     };
     console.log(JSON.stringify(param));
     api.ajax({
         url: appcfg.host+'/v1/api/app/user/uploadPic.json',
         method: 'post',
         data: {
             // stream: ret.data,
             values: param,
             files: {
                 file: filePath
             }
         }
     }, function (ret, err) {
         server.loading(1,frameName);
         api.setWinAttr({
             slidBackEnabled: true
         });
         if (ret.data) {
             api.execScript({
               name: 'index',
               frameName: 'member',
               script: "setUserImage('" + ret.data + "')"
             });
             $('#avatar')[0].src = filePath;
             fnGetUserInfo();
             console.log("修改头像成功————————" + JSON.stringify(ret));
         } else {
             console.log(JSON.stringify(err));
             // alert(JSON.stringify(err));
         }
     });

 }

//退出登录
function fnClickLogout() {
    let param = {
        userId: server.getUser().userId,
    }

    server.ajax({
        url: appcfg.host+'/v1/api/app/tp/loginOut.json',
        method: 'post',
        data: param,
        success: (ret) => {

            api.removePrefs({
                key: 'portfolio_id'
            });
            api.removePrefs({
                key: 'userinfo'
            });
            api.removePrefs({    //登录成功清除未登录时已读数据
                key: 'newsReadArrayKey5'
            });
            var valKey = "marketList_Optional"  +  server.getCountryId()
            api.removePrefs({    //登录成功清除未登录时已读数据
                key: valKey
            });
            api.execScript({
                name: 'index',
                frameName: 'market',
                script: "closeFrame()"
            });
            api.removePrefs();
            api.clearCache(function() {
              // api.toast({
              //     msg: '清除完成'
              // });
          });
            app.publish("changeUserInfo", "7");
            api.execScript({
                name: 'root',
                script: 'restartWebSocket();'
            });

            api.execScript({
                name: 'index',
                frameName: 'member',
                script: 'init()'
            });
            api.execScript({
                name: 'index',
                frameName: 'briefList',
                script: 'loadData()'
            });
            // api.execScript({                                                      //刷新新闻缓存数据
            //     name: 'index',
            //     frameName: 'subNews',
            //     script: 'getNewsList(1);'
            // });
            setTimeout(function() {
                  api.closeWin();
            },1000)


        },
        error: (err) => {
            console.log(err)
        }
    })
}

function fnClickFake() {
    app.window.close('login')
    app.window.close('memeber')

}

//获取用户信息
function fnGetUserInfo() {
    api.ajax({
        url: appcfg.host+'/v1/api/app/user/getUserInfo.json',
        method: 'post',
        data: {
            values: {
                userId: user.userId,
                token: server.getToken(),
                systemLanguage: navigator.language,
                uiLanguage: server.getUILanguageAABB(),
                contentArea: server.getCountryId()
            }
        }
    }, function (ret, err) {
        if (ret) {
            console.log(JSON.stringify(ret));
            server.setUser(ret.data);
            // app.publish("changeUserInfo", "8");
        } else {
            console.log(JSON.stringify(err));
            // app.toast(JSON.stringify(err));
        }
    });

}

//判断邮箱格式
function isEmail(str) {
    return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/i.test(str)
}

//全屏打开frame
function openFrameFull(url,pageParam) {
	name = url.substring(url.lastIndexOf('/') + 1);
	url = 'image/'+ url + ".html";

		var bgColor = 'rgba(0,0,0,0.6)';

		var pageParam = pageParam;

	api.openFrame({
		name : name,
		url : url,
		pageParam : pageParam,
		rect : {
			x : 0,
			y : 0,
			w : 'auto',
			h : api.winHeight
		},
		bounces : false,
		bgColor : bgColor,
		vScrollBarEnabled : true,
		hScrollBarEnabled : true,
		reload : false
	});
}
// 第一次登录成功弹窗
function loginToast(title,text) {
   server.toast2(title,text)
}

// 老用户升级到DTT版本登录提示
function oldToast(title,text) {
   server.toastBig()
}
