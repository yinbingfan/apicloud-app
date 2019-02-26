let server,
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

    new Vue({
        el: '#app',
        data: {},
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
        methods: {
            aridop_close(){
                api.closeFrame();
            }
        },

        /*
      * 过滤器
      * */
        filters: {


        }
    })
})
