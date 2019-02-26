let server,
    i18n

define((require) => {
    require('sdk/common');
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n')
    i18n.tran()
    app.subscribe = ("closeLoginWin", function() {
        api.closeWin({});
    });
    new Vue({
        el: '#app',
        data() {
            return {
                is_show: false,
                is_email: '',
                is_password: '',
                is_type: 'password',
                is_btn: false
            }
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
        computed: {
            empty() {
                const {is_email, is_password} = this
                return {
                    is_email,
                    is_password
                }
            }
        },
        watch: {
            empty(val) {
                if (val.is_email != '' && val.is_password != '') {
                    this.is_btn = true
                } else {
                    this.is_btn = false
                }
            },
        },
        methods: {
            submit() {
                if (this.is_email == '' || this.is_password == '') {
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
                if(api.connectionType == "none") {
                    app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
                    return;
                }
                let param = {
                    email: this.is_email,
                    timeOffset : new Date().getTimezoneOffset(),
                    pwd: this.is_password,
                    lang: server.getLanguageAABB().split('_')[0]
                }
                server.ajax({
                    url: appcfg.host+'/v1/api/app/tp/loginByEmail.json',
                    method: 'post',
                    data: param,
                    success: (ret) => {

                        api.closeWin({
                            name: 'entry'
                        });

                        console.log("登陆界面，登陆ret——————————" + JSON.stringify(ret));
                        if (ret.code != 200) {
                            app.toast(ret.msg);
                            return;
                        }
                        let data = ret.data;
                        api.removePrefs({    //登录成功清除未登录时已读数据
                            key: 'newsReadArrayKey5'
                        });
                        server.setToken(ret.data.token); //存储 token
                        server.setUser(ret.data.userInfo);
                        api.execScript({                                                      //登陆成功，设置循环调用用户信息（me）
                            name: 'index',
                            frameName: 'member',
                            script: 'userInterval();'
                        });
                        api.execScript({                                                      //登陆成功，刷新me页面积分信息（me）
                            name: 'index',
                            frameName: 'member',
                            script: 'getTotalDtt();'
                        });
                        // api.execScript({                                                      //刷新新闻缓存数据
                        //     name: 'index',
                        //     frameName: 'subNews',
                        //     script: 'getNewsList(1);'
                        // });
                        app.publish("changeUserInfo", JSON.stringify(ret.data));

                        api.execScript({
                            name: 'root',
                            script: 'restartWebSocket();'
                        });

                          // 老用户升级到DTT功能版本弹窗
                          if(ret.data.loginStatus == 1) {
                              api.closeWin();
                              if (api.pageParam.type == "shoucang") {                //未登录，新闻详情点击收藏，登录成功刷新新闻详情页面
                                api.execScript({
                                    name: 'detail',
                                    script: "oldToast()"
                                });
                              }
                              if (api.pageParam.type == "airdrop"){                //从airdrop页登录
                                api.execScript({
                                    name: 'airdrop',
                                    frameName: 'airList',
                                    script:  "oldToast()"
                                });
                              }
                              if (api.pageParam.type == "index") {
                                api.execScript({
                                    name: 'index',
                                    // frameName: 'member',
                                    script:  "oldToast()"
                                });
                              }
                              if (api.pageParam.type == 1) {
                                api.execScript({
                                    name: 'index',
                                    // frameName: 'member',
                                    script:  "oldToast()"
                                });
                            }
                          }

                          if (api.pageParam.type == "shoucang"){      //未登录，新闻详情点击收藏，登录成功刷新新闻详情页面
                            api.execScript({
                                name: 'detail',
                                // frameName: 'frmName',
                                script: "getDetails()"
                            });
                          }

                          if (api.pageParam.type == "airdrop"){                //从airdrop页登录,刷新页面数据
                            api.execScript({
                                name: 'airdrop',
                                frameName: 'airList',
                                script:  "reset()"
                            });
                          }


                          api.closeWin({
                              animation: {
                                  type: "none"
                              }
                          });
                        //   if (api.pageParam.type == 1) {
                        //     api.openWin({
                        //         name: 'userCenter',
                        //         url: '../userCenter/temp.html',
                        //         pageParam: {
                        //             from: 'login',
                        //             num: null,
                        //         }
                        //     });
                        //
                        // }


                    },
                    error: (err) => {
                        console.log(err)
                    }
                })
            },
            tab() {
                if (this.is_show == false) {
                    this.is_show = true
                    this.is_type = 'text'
                } else {
                    this.is_show = false
                    this.is_type = 'password'
                }
            },
            register() {
                api.openWin({
                    name: 'emailRegister',
                    url: '../emailRegister/temp.html',
                    pageParam: {
                        type: api.pageParam.type
                    }
                });
            },
            reset() {
                api.openWin({
                    name: 'emailReset',
                    url: '../emailReset/temp.html'
                });
            }
        }
    })
})
