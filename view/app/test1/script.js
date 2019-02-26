var server;
var i18n;

define((require) => {
    require('sdk/vue.min');
    require('sdk/jquery-3.3.1.min');
    server = require('sdk/server');
    require('sdk/flexible');
    require('sdk/jquery.i18n.properties-1.0.9');
    i18n = require('sdk/i18n')
    i18n.tran()
    new Vue({
        el: '#app',
        data: {
            message: '',
            aaa: false
        },
        created() {
        },
        mounted() {
            $('.sss').append('<span>21312312312312312312312</span>')
            this.thumbs_up()
        },
        methods: {
            thumbs_up() {
                let param = {
                    messageId: 1,
                    type: 1
                }
                server.ajax({
                    url: appcfg.host+'/v1/api/app/shortMessage/thumbsUp.json',
                    method: 'post',
                    data: param,
                    success: (ret) => {
                        this.message = ret.code
                        console.log(JSON.stringify(ret))
                        console.log(ret.code)
                    },
                    error: (err) => {
                        console.log(err)
                    }
                })
            }
        }
    })
})
