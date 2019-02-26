let server,
    i18n,
    ws,
    sever,
    vm,
    listLock=false;     //false:列表i未被拉来   true:列表被拉开状态
//发送websorket请求
function socket() {

        let data = {
            userId: server.getUser().userId,
            pushFlag: 'asset_currency_list',
        }

        data.param = {
            portfolioId: api.pageParam.param.portfolioId,
            currencyCode: api.pageParam.param.currencyCode,
            configCurrency: server.getCurrency()[0],
        }

        api.execScript({
            name: 'root',
            script: 'send(' + JSON.stringify(data) + ',' + '""' + ',' + '"currencyDetails"' + ')'
        });
    }
//收到websorket请求，执行group_currencys方法，重新刷新数据
function onMessage(evt) {
    // console.warn('detailMessage>>>>>>' + JSON.stringify(evt))
    sever = evt
    vm.group_currencys();
}

define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n')
    i18n.tran()
    socket()
    vm = new Vue({
        el: '#app',
        data: {
            pie: api.pageParam.param,
            card_data: {},
            page_param: api.pageParam.param,
            gold: server.getCurrency()[1],
            ExchangeName: i18n.t('Exchange'),
            WalletName: i18n.t('Wallet'),
            storage: null,
        },
        filters: {
            money(num) {
                let source = String(num).split(".");
                source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
                return source.join(".");
            }
        },

        created() {
            // setInterval(() => {
                this.group_currencys()
            // }, 5000)
        },
        mounted() {
            api.addEventListener({
                name: 'keyback'
            }, function (ret, err) {
                api.execScript({
                    name: 'index',
                    frameName: 'assets',
                    script: 'socket()'
                });
                api.closeWin();
            });
            // 安卓、ios手机实现右滑返回功能
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
          //退出当前页,websorket切换到上一页面链接
            close() {
                api.execScript({
                    name: 'index',
                    frameName: 'assets',
                    script: 'socket()'
                });
                api.closeWin();
            },
            //页面滑动事件处理
            is_scroll() {

                let begin,
                    end,
                    to_right,
                    to_left,
                    that = this

                for (let i in this.card_data) {

                    let item = document.querySelectorAll('.currency-details-list')[i]

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
                              vm.close();
                          });
                        },1000)
                      }

                        if (event.touches.length == 1) {

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
                                this.style.transform = "translateX(" + -2.4 + "rem)"
                                listLock=true;    //列表拉开时设置参数为true
                            }

                            if (Math.abs(to_right > 10)) {
                                this.style.transition = 'all .7s'
                                this.style.transform = "translateX(" + 0 + "rem)"
                                listLock=false;    //列表关闭时设置参数为false
                            }
                        }
                    })
                }
            },
            //进入添加币种页面
            addMarket() {
                api.openWin({
                    name: 'addCurrency',
                    url: '../addCurrency/temp.html',
                    pageParam: {
                        param: api.pageParam.param
                    }
                });
            },
            //删除该币种信息，并返回
            del_all() {
                console.log('delAllItem>>>>>>>>>>>>>>>>>>>')
                let id = []

                for (let i in this.card_data) {
                    id.push(this.card_data[i].id)
                }

                id = id.join()
                api.confirm({
                    title: "",
                    msg: i18n.t('Do you need to delete') + " ?",
                    buttons: [i18n.t('Delete'), i18n.t('cancel')]
                }, (ret, err) => {
                    let num = ret.buttonIndex;
                    if (num == 1) {

                        let param = {
                            ids: id
                        }

                        server.ajax({
                            url: appcfg.host+'/v1/api/app/bcmAssetCurrency/delete.json',
                            method: 'post',
                            data: param,
                            success: (ret) => {
                                this.close()

                            },
                            error: (err) => {
                                console.log(err)
                            }
                        })
                    }
                });
            },
            //删除某交易所
            del_item(item, index) {
                console.log('delItem>>>>>>>>>>>>>>>>>>>')
                api.confirm({
                    title: "",
                    msg: i18n.t('Do you need to delete') + " ?",
                    buttons: [i18n.t('Delete'), i18n.t('cancel')]
                }, (ret, err) => {
                    let num = ret.buttonIndex;
                    if (num == 1) {
                        let param = {
                                ids: item.id
                            },
                            line = document.querySelectorAll('.currency-details-list')[index]

                        if (this.card_data.length == 1) {
                            this.close()
                        //     this.del_all()
                        //     // api.toast({
                        //     //     msg:i18n.t('Please keep at least one') ,
                        //     //     duration: 2000,
                        //     //     location: 'bottom'
                        //     // });
                        //     //
                        //     // return

                        }

                        server.ajax({
                            url: appcfg.host+'/v1/api/app/bcmAssetCurrency/delete.json',
                            method: 'post',
                            data: param,
                            success: (ret) => {
                                line.style.transition = 'all .7s'
                                line.style.transform = "translateX(" + 0 + "rem)"
                            },
                            error: (err) => {
                                console.log(err)
                            }
                        })
                    } else {

                        let line = document.querySelectorAll('.currency-details-list')[index]
                        line.style.transition = 'all .7s'
                        line.style.transform = "translateX(" + 0 + "rem)"
                    }
                })
            },
            //进入编辑币种页面
            jump_edit(item, index) {
                api.openWin({
                    name: 'editCurrency',
                    url: '../editCurrency/temp.html',
                    pageParam: {
                        name: item[index]
                    }

                });
            },
            group_currencys() {
                if (sever != undefined || server != null) {
                    try {
                        // console.warn(JSON.stringify(this.page_param))
                        this.page_param = sever.data
                        this.card_data = sever.data.list

                        if (this.page_param.totalIncrease >= 0) {
                            this.page_param.totalColor = true
                        } else {
                            this.page_param.totalColor = false
                        }

                        if (this.page_param.totalProfit > 0) {

                            this.page_param.card_box_type = true
                            this.page_param.progress_plus = parseInt(Number(this.page_param.totalProfit) + Number(this.page_param.cost))
                            this.page_param.progress_plus = parseInt((Number(this.page_param.totalProfit) / this.page_param.progress_plus) * 10) / 10

                            if (this.page_param.progress_plus >= 0.9) {
                                this.page_param.progress_plus = 0.9
                            }

                            if (this.page_param.progress_plus == 0) {
                                this.page_param.progress_plus = 0.1
                            }

                            this.page_param.progress_minus = (1 - this.page_param.progress_plus).toFixed(1) * 100 + '%'
                            this.page_param.progress_plus = (this.page_param.progress_plus * 100) + '%'

                        } else {

                            this.page_param.card_box_type = false
                            this.page_param.progress_plus = parseInt((Math.abs(this.page_param.totalProfit) / Number(this.page_param.cost)) * 10) / 10

                            if (this.page_param.progress_plus >= 0.9) {
                                this.page_param.progress_plus = 0.9
                            }

                            if (this.page_param.progress_plus == 0) {
                                this.page_param.progress_plus = 0.1
                            }

                            this.page_param.progress_minus = (1 - this.page_param.progress_plus).toFixed(1) * 100 + '%'
                            this.page_param.progress_plus = (this.page_param.progress_plus * 100) + '%'
                        }

                        // console.warn(JSON.stringify(this.page_param))

                        // socket()
                    }catch (e) {
                        socket()
                    }
                    this.$nextTick(() => {

                        this.is_scroll()
                        for (let i in this.card_data) {
                            let h = document.querySelectorAll('.currency-details-list')[i].offsetHeight
                            this.card_data[i].height = h + 'px'
                        }
                        this.$forceUpdate()
                    })
                }
            }
        }
    })
})
