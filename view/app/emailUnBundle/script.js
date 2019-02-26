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
        data() {
            return {
                is_email: server.getUser().email.emailAddress,
                time: null,
                is_show_button: true,
                visible: false,
                is_msg: false
            }
        },
        created() {
        },
        mounted() {
            $(document).on('touchmove', function (e) {
                e.preventDefault();
            })
        },
        methods: {
            close() {
                this.visible = false
            },
            confirm() {
                this.visible = false
                this.time = 60
                this.is_show_button = false
                let interval = setInterval(() => {
                    this.time += -1
                    if (this.time == 0) {
                        clearInterval(interval)
                        return this.is_show_button = true
                    }
                }, 1000)

                let param = {
                    userId: server.getUser().userId,
                    account: this.is_email,
                    type: 'email'

                }

                server.ajax({
                    url: appcfg.host+'/v1/api/app/tp/unbindByThirdparty.json',
                    method: 'post',
                    data: param,
                    success: (ret) => {

                    },
                    error: (err) => {
                        console.log(err)
                    }
                })
            },
            resend() {
                this.visible = true
            }
        }
    })
})
