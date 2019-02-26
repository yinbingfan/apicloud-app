var $;
var i18n;
var first = false;
var server;
var Email;
var user_info;        //定时器
var languageStr = ["English", "Pусский", "한국어", "简体中文", "日本語"];
// var languageStr = ["English", "Russian", "Korean", "Chinese", "Japanese"];
var languageCode = ["en_US", "ru_RU", "ko_KR", "zh_CN", "ja_JP"];
var _languageCode = ["en-US", "ru-RU", "ko-KR", "zh-CN", "ja-JP"];
var new_detail = false;
var new_use = false;

define(function (require) {
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    require('sdk/common');

    app.ready(function () {
      //  alert(new Date().getTimezoneOffset())
        console.log("📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚")
        console.log(server.getUser())
        switch (server.getUILanguageAABB().substring(0, 2)) {
            case "en":
                $(".share_banner img").attr("src",'../../../res/img/en_airdrop_banner.png');
                break;
            case "zh":
                $(".share_banner img").attr("src",'../../../res/img/zh_airdrop_banner.png');
                break;
            case "ko":
                $(".share_banner img").attr("src",'../../../res/img/kr_airdrop_banner.png');
                break;
            case "ru":
                $(".share_banner img").attr("src",'../../../res/img/ru_airdrop_banner.png');
                break;
            case "ja":
                $(".share_banner img").attr("src",'../../../res/img/jp_airdrop_banner.png');
                break;
            default:
                $(".share_banner img").attr("src",'../../../res/img/zh_airdrop_banner.png');
                break;
        }


        getBannerDtt()
        if (server.getUser().phoneCode != undefined) {
            getTotalDtt();
            loadData();
            userInterval();                    //登陆状态，打开进入me页面时，打开监听
        } else if (server.getUser().email != undefined) {
            getTotalDtt();
            isEmail();
            userInterval();                     //登陆状态，打开进入me页面时，打开监听
        }

        app.subscribe("changeUserInfo", function (msg) {

            if (server.getUser().phoneCode != undefined) {
                loadData();
            } else if (server.getUser().email != undefined) {
                isEmail()
            }

        });
       //判断不是首次点击me页面，重新加载DTT数据
        api.addEventListener({
            name: 'clickMe'
        }, function(ret, err) {
          if(first){
            getTotalDtt();
          }
        });
        first = true;
        let price_key = api.getPrefs({
            key: 'price_key',
            sync: true
        });


        let language_key = server.getUILanguageAABB();                          //获取当前的UI语言
        $('.language-text')[0].innerHTML = getLanguageStr(language_key)

        let country_key = server.getCountryId();
        $('.position-text')[0].innerHTML = getcountryStr(country_key)

        if(price_key) {
            $('.price-text')[0].innerHTML = price_key
        } else {
            $('.price-text')[0].innerHTML = 'USD'
        }
    })
})

function  userInterval () {
    user_info =  setInterval(() => {
        this.UserInfo();
    }, 5000)
}

function openLoginOrTarget(target) {
    if (server.getUser()) {
        api.openWin({
            name: target,
            url: '../' + target,
            pageParam: {}
        });
    } else {
        api.openWin({
            name: 'entry',
            url: '../entry/temp.html',
            pageParam: {
              type:"index"
            }
        });
    }
}

//加载页面数据
function loadData() {

    console.log(JSON.stringify(server.getUser()))

    if (!server.getUser()) {
        // console.log("我的页面loadData未登陆");

        $('#phone')[0].innerHTML = $.i18n.prop("login");
        $('#info')[0].innerHTML = $.i18n.prop("login_to_explore_more");
        $('#avatar')[0].src = "../../../res/img/me_icon_select@3x.png";
    } else {
        var user = server.getUser();
        // console.log(JSON.stringify(user));
        console.log("userid -> " + user.userId);
        console.log("phoneCode -> " + user.phoneCode);
        if (null != user.userIconUrl) {
            $('#avatar')[0].src = "http://" + user.userIconUrl;
        }
        $('#info')[0].innerHTML = $.i18n.prop("edit_user_information");
        if (null == user.userName || "" == user.userName || undefined == user.userName) {
            var phone = user.phoneCode;
            s = phone.substr(0, 3) + "****" + phone.substr(7);
            $('#phone')[0].innerHTML = s;
        } else {
            var name = user.userName;
            s = name;
            $('#phone')[0].innerHTML = s;
        }
    }

}

function init() {
    console.log('1111' + '📚📚📚📚📚📚📚📚📚📚📚📚')
    $('#isIphone').show()
    $('#isEmail').hide()
    $('#phone')[0].innerHTML = $.i18n.prop("login");
    $('#info')[0].innerHTML = $.i18n.prop("login_to_explore_more");
    $('#avatar')[0].src = "../../../res/img/me_icon_select@3x.png";
    $("#cache-size").text(0)
     clearInterval(user_info);
}

//邮箱登录数据
function isEmail() {
    let email = server.getUser().email
    Email = server.getUser().email;
    $('#isIphone').hide()
    $('#isEmail').show()

    if (email.binded == 0) {
        $('.is-email-tips').show()
    } else {
        $('.is-email-tips').hide()
    }
    let emailAddress = email.emailAddress
    let reg = /(.{2}).+(.{2}@.+)/g;

    if (server.getUser().userIconUrl != null) {
        $(".is-email-header").attr("src", "http://" + server.getUser().userIconUrl);
    }else{
        $(".is-email-header").attr("src","../../../res/img/me_icon_select@3x.png")
    }

        $('.is-email-text')[0].innerText = emailAddress.replace(reg, "$1****$2")
}

//点击顶部区域，如果登录打开usercenter，没登录打开login
function fnClickLogin() {

    //如果登录
    if (server.getUser()) {
        api.openWin({
            name: 'userCenter',
            url: '../userCenter/temp.html',
            pageParam: {}
        })
    } else {
        api.openWin({
            name: 'entry',
            url: '../entry/temp.html',
            pageParam: {
                type: 1
            }
        });
    }
};

//打开收藏
function fnClickFavorite() {
    openLoginOrTarget('favorite/temp.html');
};

//历史页面
function fnClickHistory() {
    openLoginOrTarget('history/temp.html');
};



//点击分享
function fnClickShare() {
    // var mobSharePlus = api.require('mobSharePlus');
    // console.log(JSON.stringify(mobSharePlus));
    // mobSharePlus.shareTo({
    //     // target:"Facebook",
    //     target:"wxSession",
    //     // target:"TWitter",
    //     title: '北京新鲜事',
    //     titleUrl: 'http://www.apicloud.com',
    //     text: '这里是测试的内容',
    //     imgPaths: ['http://media.thedbit.com/dailymedia/test/image/72ecce5e12f54293b1e0031fdf0d94f1/2.jpg', 'widget://res/img/apicloud.jpg'],
    //     url: 'http://www.apicloud.com',
    // }, function(ret, err) {
    //     if (ret) {
    //         api.alert({
    //             msg: JSON.stringify(ret)
    //         });
    //     } else {
    //         api.alert({
    //             msg: JSON.stringify(err)
    //         });
    //
    //     }
    // });
    var path;
    if (api.systemType == "android") {
        path = "https://play.google.com/store/apps/details?id=com.dbit";
    } else {
        path = "https://itunes.apple.com/us/app/dbit/id1411329952?mt=8"         //新品牌
    }
    var sharedModule = api.require('shareAction');
    sharedModule.share({
        // path: path,
        text: path,
        type: 'text'
    });
};

// 跳转应用商店评价
function fnClickRate() {
    //Android中的使用方法如下：
    if (api.systemType == "android") {
        api.openApp({
            androidPkg: 'android.intent.action.VIEW',
            mimeType: 'text/html',
            uri: "https://play.google.com/store/apps/details?id=com.dbit"
        }, function (ret, err) {
            if (ret) {
                // alert(JSON.stringify(ret));
            } else {
                // alert(JSON.stringify(err));
            }
        });
    }

    //iOS中的使用方法如下：
    if (api.systemType == "ios") {
        api.openApp({
            iosUrl: "https://itunes.apple.com/cn/app/daily-coin-world/id1411329952?mt=8", //打开微信的，其中weixin为微信的URL Scheme
            appParam: {}
        });
        // api.openWin({
        //     name: 'app store',
        //     url: 'https://itunes.apple.com/cn/app/daily-coin-world/id1359761213?mt=8'
        // });

    }
};

//关于页面
function fnClickAbout() {
    api.openWin({
        name: 'about',
        url: '../about/temp.html',
        pageParam: {}
    });
};

//意见反馈
function fnClickFeedback() {
    api.openWin({
        name: 'feddback',
        url: './feedback/temp.html',
        pageParam: {
          email:Email
        }
    });
};

//设置语言
function fnClickLanguage() {
    api.actionSheet({
        title: i18n.t('select_language'),
        cancelTitle: i18n.t("cancel"),
        buttons: languageStr
    }, function (ret, err) {
        if (ret) {
            // alert(JSON.stringify(ret));
            if (0 < ret.buttonIndex && ret.buttonIndex < 6) {
                server.setSelectedUILanguageAABB(languageCode[ret.buttonIndex - 1])
                api.execScript({
                    // name: 'index',
                    // frameName: 'market',
                    name: 'root',
                    script: 'closeWebsocket();'
                });
                api.setPrefs({
                    key: 'rebootApp',
                    value: '1'
                });
                api.rebootApp();
            }
        }
    });

};

//设置货币
function fnClickPrice() {

    // let array = ['USD', 'CNY', 'KRW', 'RUB', 'JPY']
    let array = ['CNY', 'JPY', 'KRW', 'RUB', 'USD'];
    let price_key = api.getPrefs({
        key: 'price_key',
        sync: true
    });
    api.actionSheet({
        title: i18n.t('Currency settings'),
        cancelTitle: i18n.t("cancel"),
        buttons: array
    }, function (ret, err) {
        if (ret) {

            if (0 < ret.buttonIndex && ret.buttonIndex < 6 && array[ret.buttonIndex - 1]!=price_key) {
                api.setPrefs({
                    key: 'price_key',
                    value: array[ret.buttonIndex - 1]
                });
                api.setPrefs({
                    key: 'price_key_select',
                    value: true
                });
                $('.price-text')[0].innerHTML = array[ret.buttonIndex - 1]

                api.execScript({
                    name: 'root',
                    script: 'closeWebsocket();'
                });
                api.setPrefs({
                    key: 'rebootApp',
                    value: '1'
                });
                api.rebootApp();
            }
        }
    })
}


//选择区域
function fnClickCountry() {
    api.openWin({
        name: 'location',
        url: '../location/temp.html',
        pageParam: {
            type: 0,
            pageName: "me"
        }
    });
};

// 打开设置
function fnSettings() {
    api.openWin({
        name: 'settings',
        url: '../settings/temp.html',
        pageParam: {}
    });
};

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
          server.setUser(ret.data);
            if (ret.data.email != null) {
                if (ret.data.email.binded == 1) {
                    $('.is-email-tips').hide()
                } else {
                    $('.is-email-tips').show()
                }
            } else {
                $('.email-bind').hide();
            }
            console.log(JSON.stringify(ret))
            $("#cache-size").text(ret.data.sumCredit)
        },
        error: (err) => {
          clearInterval(user_info);
          console.log(111111)
            var num = JSON.stringify(err).indexOf("Token验证失败");
            console.log(JSON.stringify(err))
            if(num!=-1){
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
              // api.execScript({                                                      //刷新新闻缓存数据
              //     name: 'index',
              //     frameName: 'subNews',
              //     script: 'getNewsList(1);'
              // });
              // api.rebootApp();
            }
        }
    })
}

function getLanguageStr(str) {                             //处理UI语言对应的字符串
    for(var i=0;i<languageStr.length;i++) {
        if(languageCode[i]==str || _languageCode[i]==str){
            return languageStr[i]
        }
    }
}

function getcountryStr(str) {
    var phoneCode = server.getCountryInfo();
        phoneCode = JSON.parse(phoneCode);
    console.log(JSON.stringify(phoneCode));
    for(var i=0;i<phoneCode.length;i++){
      if(phoneCode[i].countryId == str){
        return phoneCode[i].localeCountryName;
      }
    }
}
//修改头像时，增加加载失败事件，若加载失败执行该事件重新加载图片
function setUserImage(url) {
  if (server.getUser().phoneCode != undefined) {
        $('#avatar').attr("onerror","this.src='"+"http://" + url +"?a="+Date.parse(new Date()) + "'");
        $('#avatar')[0].src = "http://" + url +"?a="+Date.parse(new Date());
        console.warn(0+"http://" + url);
  } else if (server.getUser().email != undefined) {
        $(".is-email-header").attr("onerror","this.src='"+"http://" + url +"?a="+Date.parse(new Date()) + "'");
        $(".is-email-header").attr("src", "http://" + url +'?a='+Date.parse(new Date()));
        console.warn(1+"http://" + url);
  }
}

function fnAirdrop() {

  api.openWin({
      name: 'airdrop',
      url: '../airdrop/temp.html',
      pageParam: {
        new_detail: new_detail,
        new_use: new_use
      }
  });
}

function fnAirdropShare(num) {
  var userId = server.getUser().userId;
  if(num == 0) {
    if(!userId){
        api.openWin({
            name: 'entry',
            url: '../entry/temp.html',
            pageParam: {
                type: "index"
            }
        });
        return;
    }
  }
  api.openWin({
      name: 'airdropShare',
      url: '../airdropShare/temp.html',
      pageParam: {
        type:"friends"
      },
  });
}

function getTotalDtt() {
  var userId = server.getUser().userId;
  if(!userId) {
      return;
  }
  server.ajax({
      url: appcfg.host+'/v1/api/app/dtt/profile.json',
      method: 'post',
      data: {
        userId: server.getUser().userId,
      },
      success:(ret)=>{
          if(ret.code == 200) {
              console.warn("单独获取airdrop总积分信息"+JSON.stringify(ret));
              $("#cache-size").text(ret.data.total)
          }
      },
      error: function(err) {

      }
    })

    server.ajax({
        url: appcfg.host+'/v1/api/app/dtt/newRuleCount.json',
        method: 'post',
        data: {
            languageCode: server.getUILanguageAABB().substring(0, 2),
        },
        success:(ret)=>{
          console.warn("获取小红点信息信息"+JSON.stringify(ret));
            if(ret.code == 200) {
                  var change_detail = api.getPrefs({  //分享规则修改时间点
                      sync: true,
                      key: 'shareRuleUpdateTime'+server.getUILanguageAABB()
                  });
                  var change_use = api.getPrefs({   //使用规则修改时间点
                      sync: true,
                      key: 'useRuleUpdateTime'+server.getUILanguageAABB()
                  });
                  var isSee_detail = api.getPrefs({  // 是否阅读分享规则
                      sync: true,
                      key: 'isSee_detail'+server.getUILanguageAABB()
                  });
                  var isSee_use = api.getPrefs({   //是否阅读使用规则
                      sync: true,
                      key: 'isSee_use'+server.getUILanguageAABB()
                  });
                  if(ret.data.shareRuleUpdateTime){
                    if(ret.data.shareRuleUpdateTime == change_detail) {
                      if(isSee_detail!=1) {
                        new_detail = true
                      }else {
                        new_detail = false
                      }
                    }else{
                       new_detail = true;
                       api.setPrefs({               //有新的更新，已读参数重置未false
                           key: 'isSee_detail'+server.getUILanguageAABB(),
                           value: false
                       });
                    }
                  }

                  if(ret.data.useRuleUpdateTime) {
                    if(ret.data.useRuleUpdateTime == change_use) {
                      if(isSee_use!=1) {
                        new_use = true
                      }else {
                        new_use = false
                      }
                    }else{
                        new_use = true;
                        api.setPrefs({               //有新的更新，已读参数重置未false
                            key: 'isSee_use'+server.getUILanguageAABB(),
                            value: false
                        });
                    }
                  }

                if(new_detail  || new_use) {  //分享和使用任何一个显示小红点，该处都显示小红点
                   $("#redRound").show();
                }else{
                  $("#redRound").hide();
                }
                api.setPrefs({               //设置分享规则时间
                    key: 'shareRuleUpdateTime'+server.getUILanguageAABB(),
                    value: ret.data.shareRuleUpdateTime
                });
                api.setPrefs({              //设置使用规则时间
                    key: 'useRuleUpdateTime'+server.getUILanguageAABB(),
                    value: ret.data.useRuleUpdateTime
                });
            }
        },
        error: function(err) {

        }
      })

}
// 第一次登录成功弹窗
function loginToast(title,text) {
   server.toast2(title,text)
}

// 老用户升级到DTT版本登录提示
function oldToast(title,text) {
   server.toastBig()
}

function openUser(msg) {
  api.openWin({
      name: 'userCenter',
      url: '../userCenter/temp.html',
      pageParam: {
        from: 'login',
        num: msg,
      }
  })
}

function getBannerDtt() {
    let param = {
        langCode: server.getUILanguageAABB().substring(0, 2),
    }
    server.ajax({
        url: appcfg.host+'/v1/api/app/dtt/queryDttBanner.json',
        method: 'post',
        data: param,
        success:(ret)=>{
            if (ret.code != "200") {
                app.toast(ret.msg);
            }
            console.log(ret.data.banner_url);
            console.log(ret.data.banner_url);
            console.log(ret.data.banner_url);
            console.log(ret.data.banner_url);
            $(".share_banner img").attr("src",ret.data.banner_url);
        },
        error: (err)=> {
            console.log(JSON.stringify(err));
        }
    });
}
