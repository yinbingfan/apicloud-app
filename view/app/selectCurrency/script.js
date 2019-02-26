let server,
    listLock=false,    //false:列表i未被拉来   true:列表被拉开状态
    i18n;

define((require) => {

    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n')
    i18n.tran()

    new Vue({
        el: '#app',
        data: {
            data_item: '',
            data_index: '',
            list: [],
            storage: null
        },
        created() {
            this.list_view()
        },
        mounted() {
          // 安卓\ios手机实现右滑返回功能
          // if (api.systemType == "android") {
            api.addEventListener({
                name:'swiperight'
            }, function(ret, err){
               api.closeWin({
               });
            });
          // }
        },
        methods: {
          //页面的滚动事件处理
            is_scroll() {

                let begin,
                    end,
                    to_right,
                    to_left,
                    that = this

                for (let i in this.list) {

                    let item = document.querySelectorAll('.select-list')[i]

                    item.addEventListener('touchstart', function (event) {

                        if (event.touches.length == 1) {
                            begin = parseInt(event.changedTouches[0].pageX)
                        }

                    })
                    item.addEventListener('touchmove', function (event) {

                      //  列表在拉开状态，滑动时关闭手机页面滑动监听
                        if(listLock){
                          api.removeEventListener({
                            name: 'swiperight'
                          });

                          setTimeout(function () {
                            api.addEventListener({
                                name:'swiperight'
                            }, function(ret, err){
                               api.closeWin({
                               });
                            });
                          },1000)
                        }

                        if (event.touches.length == 1) {
                            api.setPrefs({
                                key: 'scroll_key',
                                value: i
                            });

                            if (that.storage) {
                                that.storage.style.transition = 'all .7s'
                                that.storage.style.transform = "translateX(" + 0 + "rem)"
                            }

                            end = parseInt(event.changedTouches[0].pageX)
                            to_left = begin - end
                            to_right = end - begin

                            if (Math.abs(to_left > 10)) {
                                that.storage = this;
                                this.style.transition = 'all .7s'
                                this.style.transform = "translateX(" + -3.9 + "rem)"
                                listLock=true;    //列表拉开时设置参数为true
                            }

                            if (Math.abs(to_right > 10)) {
                                this.style.transition = 'all .7s'
                                this.style.transform = "translateX(" + 0 + "rem)"
                                listLock=true;    //列表拉开时设置参数为true
                            }
                        }
                    })
                }
            },
            //选中一个组合
            is_select(item, index) {

                this.data_index = index;

                api.setPrefs({
                    key: 'currency_key',
                    value: index
                });

                this.data_item = item
            },
            //完成组合选择
            save() {

                let data = JSON.stringify(this.data_item)

                if (this.data_item == '') {
                    return api.toast({
                        msg: i18n.t('Choose at least one'),
                        duration: 2000,
                        location: 'bottom'
                    });
                }

                api.execScript({
                    name: 'index',
                    frameName: "assets",
                    // name: 'assets',
                    script: 'jump_datas(' + data + ')'
                });
                api.closeWin()
            },
            //获取页面数据
            list_view() {

                let param = {
                    userId: server.getUser().userId,
                }

                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmPortfolio/list.json',
                    method: 'post',
                    data: param,
                    success: (ret) => {
                        this.list = ret.data
                        console.log(JSON.stringify(this.list))
                        this.$nextTick(() => {

                            this.is_scroll()

                            let index = api.getPrefs({
                                key: 'currency_key',
                                sync: true
                            });

                            if (index == '' || index == null || index == undefined) {
                                document.querySelectorAll('.select-line')[0].click()
                            } else {
                                document.querySelectorAll('.select-line')[index].click()
                            }
                        })
                    },

                    error: (err) => {
                        api.toast({
                            msg: err,
                            duration: 2000,
                            location: 'bottom'
                        })
                    }
                })
            },
            //删除一条组合
            del_item(item, index) {

                api.confirm({
                    title:"",
                    msg: i18n.t('Do you need to delete'),
                    buttons: [i18n.t('delete'), i18n.t('cancel')]
                }, (ret, err) => {

                    let num = ret.buttonIndex;

                    if (num == 1) {
                        let param = {
                                ids: item.id
                            },
                            line = document.querySelectorAll('.select-list')[index]

                        if (index == 0) {

                            api.toast({
                                msg: i18n.t('Cannot delete by default'),
                                duration: 2000,
                                location: 'bottom'
                            });

                            line.style.transition = 'all .7s'
                            line.style.transform = "translateX(" + 0 + "rem)"

                            return
                        }

                        server.ajax({
                            url: appcfg.host+'/v1/api/app/bcmPortfolio/delete.json',
                            method: 'post',
                            data: param,
                            success: (ret) => {

                                api.setPrefs({
                                    key: 'currency_key',
                                    value: 0
                                });

                                this.list_view()
                                document.querySelectorAll('.select-line')[0].click()

                                line.style.transition = 'all .7s'
                                line.style.transform = "translateX(" + 0 + "rem)"
                            },
                            error: (err) => {
                                api.toast({
                                    msg: err,
                                    duration: 2000,
                                    location: 'bottom'
                                })
                            }
                        })
                    } else {
                        let line = document.querySelectorAll('.select-list')[index]
                        line.style.transition = 'all .7s'
                        line.style.transform = "translateX(" + 0 + "rem)"
                    }
                })
            },
            //编辑一条组合名称
            edit_item(item, index) {
                api.prompt({
                    title: i18n.t('Edit portfolio'),
                    buttons: [i18n.t("confirm"), i18n.t("cancel")]
                }, (ret, err) => {

                    let num = ret.buttonIndex,
                        text = ret.text,
                        param = {
                            id: item.id,
                            name: text,
                            defaultFlag: '0'
                        },
                        line = document.querySelectorAll('.select-list')[index]

                    if (text == '') {
                        line.style.transition = 'all .7s'
                        line.style.transform = "translateX(" + 0 + "rem)"
                        return
                    }

                    if (num == 1) {
                        server.ajax({
                            url: appcfg.host+'/v1/api/app/bcmPortfolio/update.json',
                            method: 'post',
                            data: param,
                            success: (ret) => {
                                this.list_view()
                                line.style.transition = 'all .7s'
                                line.style.transform = "translateX(" + 0 + "rem)"
                            },
                            error: (err) => {
                                api.toast({
                                    msg: err,
                                    duration: 2000,
                                    location: 'bottom'
                                })
                            }
                        })
                    }
                })
            },
            //添加一条组合
            add_item() {
                api.prompt({
                    title: i18n.t('New portfolio'),
                    buttons: [i18n.t("confirm"), i18n.t("cancel")]
                }, (ret, err) => {

                    let index = api.getPrefs({
                        key: 'scroll_key',
                        sync: true
                    });

                    let num = ret.buttonIndex,
                        text = ret.text,
                        param = {
                            userId: server.getUser().userId,
                            name: text,
                            defaultFlag: '0'
                        },
                        line = document.querySelectorAll('.select-list')[index];
                    if (text == '') {
                        line.style.transition = 'all .7s';
                        line.style.transform = "translateX(" + 0 + "rem)";
                        return
                    }
                    if (num == 1) {
                        server.ajax({
                            url: appcfg.host+'/v1/api/app/bcmPortfolio/add.json',
                            method: 'post',
                            data: param,
                            success: (ret) => {

                                api.setPrefs({
                                    key: 'currency_key',
                                    value: 0
                                });

                                this.list_view();
                                if (this.list.length == 1) {

                                    this.$nextTick(() => {
                                        // setTimeout(() => {
                                        //     document.querySelectorAll('.select-line')[1].click()
                                        // }, 200)
                                        document.querySelectorAll('.select-line')[1].click()

                                    })
                                } else {
                                    this.$nextTick(() => {
                                        document.querySelectorAll('.select-line')[1].click()
                                    })
                                }
                                line.style.transition = 'all .7s';
                                line.style.transform = "translateX(" + 0 + "rem)";

                            },
                            error: (err) => {
                                api.toast({
                                    msg: err,
                                    duration: 2000,
                                    location: 'bottom'
                                })
                            }
                        })
                    } else {
                        line.style.transition = 'all .7s'
                        line.style.transform = "translateX(" + 0 + "rem)"
                    }
                })
            }
        }
    })
})
