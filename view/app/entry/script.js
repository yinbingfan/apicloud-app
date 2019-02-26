let server,
    i18n


define((require) => {

    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n')
    i18n.tran()

    new Vue({
        el: '#app',
        data: {},
        created() {
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

        },
        filters: {},
        methods: {
            twitter() {
                api.openWin({
                    name: 'twitterLogin',
                    url: '../twitterLogin/temp.html'
                });
            },
            facebook() {
                api.openWin({
                    name: 'faceBookLogin',
                    url: '../faceBookLogin/temp.html'
                });
            },
            emall() {
                api.openWin({
                    name: 'email',
                    url: '../email/temp.html',
                    pageParam: {
                        type: api.pageParam.type
                    }
                });
            },
            sms() {
                api.openWin({
                    name: 'login',
                    url: '../login/temp.html',
                    pageParam: {
                        type: api.pageParam.type
                    }
                });
            }
        }
    })
})
