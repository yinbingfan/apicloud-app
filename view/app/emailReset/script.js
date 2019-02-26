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
                is_email: '',
                is_show_button: true,
                time: null,
                visible: false,
                is_btn: false
            }
        },
        computed: {
            empty() {
                const {is_email, is_password} = this
                return {
                    is_email,
                }
            }
        },
        watch: {
            empty(val) {
                if (val.is_email != '') {
                    this.is_btn = true
                } else {
                    this.is_btn = false
                }
            },
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
            // $(document).on('touchmove',function(e){
            //     e.preventDefault();
            // })
        },
        methods: {
            close() {
                // this.visible = false
            },
            confirm() {
                this.visible = false
                api.closeWin();
            },
            submit() {
                if (this.is_email == '') {
                    return api.toast({
                        msg: i18n.t('Email or password can not be empty'),
                        duration: 2000,
                        location: 'bottom'
                    })
                }

                let reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
                if (!reg.test(this.is_email)) {
                    return api.toast({
                        msg: i18n.t('Email format is incorrect'),
                        duration: 2000,
                        location: 'bottom'
                    })
                }

                let param = {
                    emailAddress: this.is_email,
                    lang: server.getLanguageAABB().split('_')[0]
                }

                server.ajax({
                    url: appcfg.host+'/v1/api/app/tp/sendResetPwdEmail.json',
                    method: 'post',
                    data: param,
                    success: (ret) => {

                        if (ret.code != 200) {
                            app.toast(ret.msg);
                            return;
                        }

                        this.visible = true
                        this.time = 60
                        this.is_show_button = false
                        let interval = setInterval(() => {
                            this.time += -1
                            if (this.time == 0) {
                                clearInterval(interval)
                                return this.is_show_button = true
                            }
                        }, 1000)
                    },
                    error: (err) => {
                        console.log(err)
                    }
                })
            },
        }
    })
})
