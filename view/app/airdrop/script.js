let server,
    news,
    first=false,
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
        // server.loading(0,api.frameName);
    });

   news = new Vue({
        el: '#app',
        data: {
           total:0,
           new_detail: false,
           new_use: false,
           show: false        //false:不显示小红点  true:显示小红点
        },
        mounted() {
            this.new_detail = api.pageParam.new_detail;
            this.new_use = api.pageParam.new_use;
            if(this.new_detail  || this.new_use) {  //有更新且未阅读时，显示小圆点
               this.show = true
            }
            this.fnGetList(0)
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
            fnGetList(index) {
              var tabGet = $("#get");
              var tabHistory = $("#history");
              switch (index) {
                  case 0:
                    $(tabGet).addClass("active")
                    $(tabHistory).removeClass("active")
                      app.window.popoverElement({
                          id: 'view',
                          name: 'airList',
                          param: api.pageParam,
                          url: '../airList/temp.html',
                          bounces: false,
                          scrollEnabled: false,
                          vScrollBarEnabled: false,
                          hScrollBarEnabled: false,
                          scaleEnabled: false,
                          overScrollMode: 'never',
                          // bottomMargin: server.getFooterHeight(),
                          reload: false
                      });
                  break;
                  case 1:
                    $(tabGet).removeClass("active")
                    $(tabHistory).addClass("active")
                    app.window.popoverElement({
                        id: 'view',
                        name: 'airHistory',
                        param:"",
                        url: '../airHistory/temp.html',
                        bounces: false,
                        scrollEnabled: false,
                        vScrollBarEnabled: false,
                        hScrollBarEnabled: false,
                        scaleEnabled: false,
                        overScrollMode: 'never',
                        // bottomMargin: server.getFooterHeight(),
                        reload: false
                    });
                    if(first) {
                      if(!server.getUser().userId) {
                        return;
                      }
                      api.execScript({
                          frameName: 'airHistory',
                          script: 'news.fnGetInfo();'
                      });
                    }
                    first = true;

                  break;
              }
            },
            //点击阅读分享规则时调用 （from:airList）
            changeDetailShow(){
               this.new_detail = false;
               if(this.new_detail  || this.new_use) {
                  this.show = true
               }else{
                   this.show = false
               }
            },
              //点击阅读使用规则时调用   from:airList）
            changeUseShow(){
               this.new_use = false;
               if(this.new_detail  || this.new_use) {
                  this.show = true
               }else{
                  this.show = false
               }
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

function setTotalNum(num) {
  $(".title-info").text(num)
}
// 第一册登录成功弹窗
function loginToast(title,text) {
   server.toast2(title,text)
}
