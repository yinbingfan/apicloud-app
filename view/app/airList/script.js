let server,
    news,
    i18n;
define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n');
    i18n.tran();
    var render = require('render');
    var listRender = render({
        el: '#view-lists'
    })
    app.ready(function() {
        // server.toast2("Ошибка",5656)
    });

  news = new Vue({
        el: '#app',
        data: {
            userId: "",
            isSign: false,  //签到按钮
            shareFriends :false, //分享给好友按钮  --false可以分享
            isRegist: false,  //注册按钮          --false可以签到
            isBind: false,  //叹号按钮
            show: true,  //折叠层
            isLogin: false,  //是否登录            --false可以点击注册
            new_detail: false,  //分享给好友--小红点
            new_use: false,   //挖矿--小红点
            readNum: 0,
            shareNum: 0,
            voteNum: 0,
            red: false
        },
        mounted() {
           this.new_detail = api.pageParam.new_detail;
           this.new_use = api.pageParam.new_use;

          var userId = server.getUser().userId;
          if(userId){
              server.loading(0,api.frame);
          }

            this.fnGetInfo();
            var val = api.getPrefs({
                sync: true,
                key: 'UseToEarnDtt'
            });
            if(val) {
              if(val == "open") {
                  this.show = true
              }else{
                  this.show = false;
                   $(".arrows").css("transform","rotate(180deg)");
              }

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

        },
        methods: {
          // 使用即挖矿折叠部分效果
           openList() {
             if(this.show){
               $(".arrows").css("transform","rotate(180deg)");
               this.show = false;
               api.setPrefs({         //存储是否折叠
                   key: 'UseToEarnDtt',
                   value: "close"
               });
             }else{
               $(".arrows").css("transform","rotate(0deg)");
               this.show = true
               Vue.nextTick(function() {
                  document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
                });
               api.setPrefs({
                   key: 'UseToEarnDtt',
                   value: "open"
               });

             }

           },
            /*
            * 获取页面信息
            * */
            fnGetInfo() {
              // 未登录设置
                var userId = server.getUser().userId;
                if(!userId){

                    return;
                }
                // server.loading(0,api.frame);
                // 已登录设置
                this.isLogin = true;
                if (server.getUser().phoneCode != undefined) {  //手机登录

                } else if (server.getUser().email != undefined) {  //邮箱登录
                  let email = server.getUser().email;
                  if (email.binded == 0) {
                      this.isBind = true;
                  } else {
                      this.isBind = false;
                  }
                }

                server.ajax({
                    url: appcfg.host+'/v1/api/app/dtt/profile.json',
                    method: 'post',
                    data: {
                      userId: server.getUser().userId,
                    },
                    success:(ret)=>{
                        server.loading(1,api.frame);
                        console.warn("airdrop页面所有信息"+JSON.stringify(ret));
                        if(ret.code == 200) {
                            if(ret.data.signFlag){
                                this.isSign = true
                            }else{
                                this.isSign = false
                            }
                            if(ret.data.shareToFriendsFlag){
                                this.shareFriends = true
                            }else{
                                this.shareFriends = false
                            }
                            // 判断阅读新闻数量
                            if(ret.data.readNewsFlag<=3) {
                              this.readNum = ret.data.readNewsFlag;
                            }else{
                              this.readNum = 3;
                            }

                            if(ret.data.shareNewsBriefFlag<=1) {
                              this.shareNum = ret.data.shareNewsBriefFlag;
                            }else{
                              this.shareNum = 1;
                            }

                            if(ret.data.voteBriefFlag<=3) {
                              this.voteNum = ret.data.voteBriefFlag;
                            }else{
                              this.voteNum = 3;
                            }

                            api.execScript({
                                name: 'airdrop',
                                script: 'setTotalNum('+ ret.data.total+');'
                            });

                        }


                    },
                    error: function(err) {
                        server.loading(1,api.frame);
                    }
                });
            },
            /*
           * 点击分享给好友
           * */
            shareToFriends () {
              var userId = server.getUser().userId;
              if(!userId){
                api.openWin({
                    name: 'entry',
                    url: '../entry/temp.html',
                    pageParam: {
                        type:"airdrop"
                    }
                });
                return;
              }
              api.openWin({
                  name: 'airdropShare',
                  url: '../airdropShare/temp.html',
                  pageParam: {
                      type:"friends",
                      from: "airList"
                  }
              });
            },

            back(){
                api.closeWin();
            },

            // 点击叹号弹出对话框
            opentoast() {
              var dialogBox = api.require('dialogBox');
              dialogBox.raffle({
                  texts: {
                      title: '',
                      mainText: i18n.t("Reward after email certification"),
                      subText: '',
                      // leftTitle: '收入囊中',
                      rightTitle: i18n.t("Got it"),
                  },
                  styles: {
                      bg: '#fff',
                      w: 240,
                      title: {
                          size: 14,
                          color: '#000'
                      },
                      icon: {
                          marginT: 0,
                          w: 130,
                          h: 126,
                          iconPath: 'widget://res/img/letter2x.png'
                      },
                      main: {
                          marginT: 0,
                          color: '#636363',
                          size: 13
                      },
                      sub: {
                          marginT: 0,
                          color: '#0E0E0E',
                          size: 13
                      },
                      right: {
                          marginB: 0,
                          marginL: 0,
                          w: 240,
                          h: 35,
                          corner: 2,
                          bg: '#dedede',
                          color: '#0076FF',
                          size: 16
                      },

                  },
                  tapClose:true
              }, function(ret, err) {
                  if (ret) {
                    dialogBox.close({
                      dialogName: 'raffle'
                    });
                  }
              });
            },

            // 签到
            fnSign() {
              var userId = server.getUser().userId;
              if(!userId) {
                 this.fnLogin();
                 return;
              }
              if(api.connectionType == "none") {
                  app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
                  return;
              }
              server.ajax({
                  url: appcfg.host+'/v1/api/app/dtt/signIn.json',
                  method: 'post',
                  data: {
                      userId: server.getUser().userId,
                  },
                  success: (ret) => {
                      console.warn("用户签到"+JSON.stringify(ret));
                      server.loading(1,api.frame);
                      if(ret.code == 200) {
                          this.fnGetInfo();                //刷新此页面数据
                          this.isSign = true;
                          var number = ret.data.creditNum;//签到奖励的积分数
                          server.toast1("+  "+number+"  DTT",1500);
                          api.execScript({                //刷新me页面数据
                              name: 'index',
                              frameName: 'member',
                              script:  "getTotalDtt()"
                          });
                      }else{
                          var  text = i18n.t('Sign-in failed')
                          server.toast1(text,1500);
                      }

                  },
                  error: (err) => {

                  }
              })
            },

          //  点击进入登录页面
            fnLogin() {
              api.openWin({
                  name: 'entry',
                  url: '../entry/temp.html',
                  pageParam: {
                      type:"airdrop"
                  }
              });
            },

            // 登录后打开《分享给好友》-了解更多页面
            openAirdropDetail() {
              api.setPrefs({               //阅读过后设置成1
                  key: 'isSee_detail'+server.getUILanguageAABB(),
                  value: 1
              });
              //刷新小圆点
              if(this.new_detail) {
                api.execScript({
                    name: 'index',
                    frameName: 'member',
                    script: 'getTotalDtt();'
                });
                api.execScript({
                    name: 'airdrop',
                    script: 'news.changeDetailShow();'
                });
              }
                this.new_detail = false;
               api.openWin({
                   name: 'airdropDetail',
                   url: '../airdropDetail/temp.html',
                   pageParam: {

                   }
               });

            },
            // 登录后打开《使用即挖矿》-了解更多页面
            openAirdropUse() {
              api.setPrefs({               //阅读过后设置成1
                  key: 'isSee_use'+server.getUILanguageAABB(),
                  value: 1
              });
              //刷新小圆点
              if(this.new_use) {
                api.execScript({
                    name: 'airdrop',
                    script: 'news.changeUseShow();'
                });
                api.execScript({
                    name: 'index',
                    frameName: 'member',
                    script: 'getTotalDtt();'
                });
              }
                this.new_use = false;
                api.openWin({
                    name: 'airdropUse',
                    url: '../airdropUse/temp.html',
                    pageParam: {

                    }
                });

            },
            // 点击ToDo
            goToDo(txt) {
              var userId = server.getUser().userId;
              if(!userId) {
                 this.fnLogin();
                 return;
              }
              if(txt == "news") {
                api.closeWin({

                });
                app.publish("briefNotification", "news")
              }
              if(txt == "brief") {
                api.closeWin({

                });
                app.publish("briefNotification", "brief")
              }
            },
            // 未登录状态了解更多
            fnGetMore(test) {
                api.openFrame({
                    name: 'airdropInfo',
                    url: '../airdropInfo/temp.html',
                    rect: {
                        x: 0,
                        y: 0,
                        w: "auto",
                        h: "auto"
                    },
                    pageParam: {
                        name: test
                    },
                    bounces: false,
                    bgColor: 'rgba(0,0,0,0.8)',
                    vScrollBarEnabled: true,
                    hScrollBarEnabled: true
                });

            },
        },

        /*
      * 过滤器
      * */
        filters: {
            //截取字符串，多余的部分显示省略号
            setString: function (str, len) {
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
            },
            TrimAll: function (str) {
                return str.replace(/\s/g,"");
            },
            sub(str){
                var s = "https://"+str.substring(2);
                return s;
            },

        }
    })
})
// // 第一册登录成功弹窗
// function loginToast(title,text) {
//    server.toast2(title,text)
// }
function reset() {
   window.location.reload();
}
// 老用户升级到DTT版本登录提示
function oldToast(title,text) {
   server.toastBig()
}
