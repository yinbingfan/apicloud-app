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
      // app.pull.init(initData);
      // api.refreshHeaderLoading();
    });

  news = new Vue({
        el: '#app',
        data: {
            show:false,
            loading:false,
            loadingAnim:false,
            // loadings:true,
            noMore:false,
            pageIndex:1,
            pageSize :20,
            lists:[],
            // email:"32707962dfd@qq.com",
            // phoneNumber: null,
            // type: true
        },
        mounted() {
          var userId = server.getUser().userId;
          if(!userId){
              return;
          }
          this.show=true;
          app.pull.init(this.fnGetInfo);
          api.refreshHeaderLoading();

            // 安卓手机实现仿ios右滑返回功能
            if (api.systemType == "android") {
              api.addEventListener({
                  name:'swiperight'

              }, function(ret, err){
                 api.closeWin({
                 });

              });
            }

              api.addEventListener({
                  name: 'scrolltobottom'
              }, (ret, err)=>{
                 if(!this.show){
                   return;
                 }
                  if (!this.noMore) {
                      this.loading=false;
                      this.loadingAnim=true;
                      this.getData();
                  }else {
                      // this.loading=true;
                      // this.loadingAnim=false;
                  }
              });


        },
        methods: {
            /*
            * 获取历史明细数据
            * */
            fnGetInfo() {
              if(api.connectionType == "none") {
                  app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
                  return;
              }
              this.noMore = true;
              this.pageIndex = 1;
              this.loading = false;
              // this.loadingAnim = true;
              this.getData();
              // server.loading(0,api.frame);
            },
            getData() {
              if(this.pageIndex != 1){
                  this.loadingAnim = true;
              }
              let param = {
                  userId: server.getUser().userId,
                  page: this.pageIndex,
                  limit: this.pageSize,
              }
              server.ajax({
                  // url: appcfg.host+'/v1/api/app/news/wikiList.json',
                  url: appcfg.host+'/v1/api/app/dtt/queryDttHistory.json',
                  method: 'post',
                  data: param,
                  success:(ret)=>{
                      app.pull.stop();
                      this.loadingAnim = false;
                      console.warn("获取DTT历史明细"+ JSON.stringify(ret));
                      if (ret.code != "200") {
                          app.toast(ret.msg);
                      }
                      if(ret.data==null||ret.data==''){
                        if (this.pageIndex == 1) {
                          this.show = false;
                          this.loading = false;
                          this.loadingAnim = false;
                          return
                        } else {
                           this.loading = true;
                           this.noMore = true;
                        }

                      }

                      if (ret.data.length>0) {
                          if (this.pageIndex == 1) {
                              this.lists = ret.data;
                          } else {
                              for(var i=0;i<ret.data.length;i++) {
                                 this.lists.push(ret.data[i])
                              }

                          }
                          this.noMore = false;
                          this.pageIndex += 1;
                      }else {
                          this.noMore = true;
                          this.loading=true;
                          this.loadingAnim=false;
                          return;
                      }

                  },
                  error: function(err) {
                      console.log(JSON.stringify(err));

                  }
              });
            },
            back(){
                api.closeWin();
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
            // 邮箱省略处理
            editEmail: function (str) {
               let reg = /(.{2}).+(.{2}@.+)/g;
               let tex = str.split("@")[0];
               if(tex.length<=4) {
                   reg = /(.{1}).+(.{1}@.+)/g;
               }
                return str.replace(reg, "$1****$2");

            },
            //手机号省略处理
            editPhone: function(phone) {
                let s = phone.substr(0, 3) + "****" + phone.substr(7);
                return s;
            },
            // 积分奖励类型转换
            typeToText: function(num) {
                switch (num) {
                  case 1: //阅读新闻  Read news
                    return i18n.t("Use of rewards");
                    break;
                  case 2: //分享快讯/新闻  Share news or briefs
                    return i18n.t("Use of rewards");
                    break;
                  case 3: //快讯投票  Brief like or dislike
                    return i18n.t("Use of rewards");
                    break;
                  case 4: //分享快讯/新闻  Share news or briefs
                    return i18n.t("Use of rewards");
                    break;
                  case 5: //用户注册
                    return i18n.t("register");
                    break;
                  case 6: //用户签到
                    return i18n.t("Sign in");
                    break;
                  case 7: //分享给好友
                    return i18n.t("Share to Friends");
                    break;
                  case 9: //老用户回馈
                    return i18n.t("Reward member");
                    break;
                  default:

                }
            },
            // 时间格式转换
            setTime: function(time) {
               return server.getDttTime(time);
            }

        }
      })
})
