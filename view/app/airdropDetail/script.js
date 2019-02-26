let server,
    i18n;
define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n');
    i18n.tran();

    // var render = require('render');
    // var listRender = render({
    //     el: '#view-lists'
    // })
    app.ready(function() {
        // server.loading(0,api.frameName);
    });

  new Vue({
        el: '#app',
        data: {
           ruleAward:[],
            shareDtt:[]
        },
        mounted() {

            // 安卓手机实现仿ios右滑返回功能
            if (api.systemType == "android") {
              api.addEventListener({
                  name:'swiperight'
              }, function(ret, err){
                 api.closeWin({
                 });

              });
            }
            this.fnAirdropDetail()
            this.fnShareCredit()
        },
        methods: {
            share_button(){
                api.openWin({
                  name: 'airdropShare',
                  url: '../airdropShare/temp.html',
                  pageParam: {
                      type:"friends"
                  }
                });
            },
            fnAirdropDetail() {
                server.loading(0,api.frameName);
                let param = {
                    languageCode: server.getUILanguageAABB().substring(0, 2),
                    contentType:0 //内容类型(0分享规则，1使用规则
                }

                server.ajax({
                    url: appcfg.host+'/v1/api/app/dtt/queryDttRule.json',
                    method: 'post',
                    data: param,
                    success:(ret)=>{
                        if (ret.code != "200") {
                            app.toast(ret.msg);
                        }
                        server.loading(1,api.frameName);
                        this.ruleAward=ret.data

                    },
                    error: function(err) {
                        console.log(JSON.stringify(err));
                    }
                });
            },

            fnShareCredit() {
                let param = {
                    userId: server.getUser().userId
                }
                server.ajax({
                    url: appcfg.host+'/v1/api/app/dtt/queryShareCredit.json',
                    method: 'post',
                    data: param,
                    success:(ret)=>{
                        if (ret.code != "200") {
                            app.toast(ret.msg);
                        }
                        this.shareDtt=ret.data
                        console.log(JSON.stringify(ret.data));
                    },
                    error: (err)=> {
                        console.log(JSON.stringify(err));
                    }
                });
            }


        },
    })
})
