let server,
    i18n,
    ws,
    sever,
    vm
//外部页面，添加或者删除货币时，重新加载websorket链接
function jump_datas(data) {

    let param = {
        userId: server.getUser().userId,
        pushFlag: 'asset_currency_group',
    }

    param.param = {
        configCurrency: server.getCurrency()[0],
        portfolioId: data.id
    }

    api.setPrefs({
        key: 'portfolio_id',
        value: data.id
    });

    api.execScript({
        name: 'root',
        script: 'send(' + JSON.stringify(param) + ',' + '"assets"' + ',' + '"index"' + ')'
    });
}
//发送websorket请求
function socket() {

    let data = {
            userId: server.getUser().userId,
            pushFlag: 'asset_currency_group',
        },
        portfolio_id = api.getPrefs({
            key: 'portfolio_id',
            sync: true
        });

    if (portfolio_id == null || portfolio_id == '') {
        data.param = {
            configCurrency: server.getCurrency()[0],
            defaultFlag: '1'
        }
    } else {
        data.param = {
            configCurrency: server.getCurrency()[0],
            portfolioId: portfolio_id
        }
    }

    api.execScript({
        name: 'root',
        script: 'send(' + JSON.stringify(data) + ',' + '"assets"' + ',' + '"index"' + ')'
    });
}

function onMessage(evt) {
    // console.warn("资产********************资产>>>>>>>>>>"+JSON.stringify(evt));
    sever = evt
    vm.group_currencys();
    console.warn(JSON.stringify('assetOnMessage>>>>>>>>' + JSON.stringify(sever.data)))
}


define((require) => {

    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n')
    i18n.tran()
    // socket()
    api.addEventListener({
        name:'viewappear'
    }, function(ret, err){
        socket()
    });

    vm = new Vue({
        el: '#app',
        data: {
            card_data: {},
            gold: server.getCurrency()[1],
            card_box_type: null,
            card_box_plus: null,
            card_box_minus: null,
            card_list: [],
            add_show: null,
        },
        created() {

            this.card_data.name = 'Default Portfolio'
            this.card_data.value = 0
            this.card_data.cost = 0
            this.card_data.todayTotalProfit = 0
            this.card_data.totalIncrease = '0.00'
            this.card_data.totalProfitAndCostRatio = '0.00'
            this.card_data.totalProfit = 0
            this.card_box_minus = '90%'
            this.card_box_plus = '10%'

            if (server.getUser().userId == null) {
                api.openWin({
                    name: 'entry',
                    url: '../entry/temp.html',
                });
            }
            // setInterval(() => {
                this.group_currencys()
            // }, 400)
        },
        mounted() {
        },
        filters: {
            money(num) {
                let source = String(num).split(".");
                source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
                return source.join(".");
            }
        },
        methods: {
            go(el,imgUrl) {
              $("#img"+el).attr("src",imgUrl)
            },
              //进入货币详情页面
            jump_data(item, index) {
                api.openWin({
                    name: 'currencyDetails',
                    url: '../currencyDetails/temp.html',
                    pageParam: {
                        param: item
                    },
                    slidBackEnabled: false          //禁止苹果自带的滑动事件
                });
            },
              //进入选择组合页面
            jump_add() {
                api.openWin({
                    name: 'selectCurrency',
                    url: '../selectCurrency/temp.html',
                    slidBackEnabled: false           //禁止苹果自带的滑动事件
                });
            },
            /*
            * 点击新增
            * */
            NewCurrency() {
                api.openWin({
                    name: 'addCurrency',
                    url: '../addCurrency/temp.html',
                });
            },
            group_currencys() {
              
                if (sever != undefined || server != null) {

                    try {

                        if (!sever.data) {
                            this.card_data.name = 'Default Portfolio'
                            this.card_data.value = 0
                            this.card_data.cost = 0
                            this.card_data.todayTotalProfit = 0
                            this.card_data.totalIncrease = '0.00'
                            this.card_data.totalProfitAndCostRatio = '0.00'
                            this.card_data.totalProfit = 0
                            this.card_box_minus = '90%'
                            this.card_box_plus = '10%'
                            // socket()

                            return
                        }
                        this.card_data = sever.data

                        this.card_list = sever.data.list

                    } catch (e) {
                        /**
                         * 如果不加try 就会报如下错误。
                         * apicloud页面页面渲染过慢引起的某部分js未执行。
                         * TypeError: Cannot read property 'data' of undefined at script.js : 173
                         */
                        console.warn(e)
                        socket()
                    }

                    this.card_list == null ? this.add_show = true : this.add_show = false

                    if (this.card_data.totalIncrease >= 0) {
                        this.card_data.totalColor = true
                    } else {
                        this.card_data.totalColor = false
                    }

                    for (let i in this.card_list) {

                        this.card_list[i].percentage = parseInt(this.card_list[i].assetRatio.replace(/%/g, '')) + ' 100'

                        let progress_minus = this.card_list[i].progress_minus,
                            progress_plus = this.card_list[i].progress_plus


                        if (this.card_list[i].totalIncrease >= 0) {
                            this.card_list[i].totalColor = true
                        } else {
                            this.card_list[i].totalColor = false
                        }

                        if (this.card_list[i].totalProfit > 0) {

                            this.card_list[i].class_type = false
                            progress_plus = parseInt(Number(this.card_list[i].totalProfit) + Number(this.card_list[i].cost))
                            progress_plus = parseInt((Number(this.card_list[i].totalProfit) / progress_plus) * 10) / 10
                            // console.warn('progress_plus>>>>>>>>>>>>>>' + progress_plus)
                            if (progress_plus >= 0.9) {
                                progress_plus = 0.9
                            }

                            if (progress_plus == 0) {
                                progress_plus = 0.1
                            }

                            progress_minus = (1 - progress_plus).toFixed(1) * 100 + '%'
                            progress_plus = (progress_plus * 100) + '%'

                            this.card_list[i].progress_minus = progress_minus
                            this.card_list[i].progress_plus = progress_plus

                        } else {

                            this.card_list[i].class_type = true
                            progress_plus = parseInt((Math.abs(this.card_list[i].totalProfit) / Number(this.card_list[i].cost)) * 10) / 10

                            if (progress_plus >= 0.9) {
                                progress_plus = 0.9
                            }

                            if (progress_plus == 0) {
                                progress_plus = 0.1
                            }

                            progress_minus = (1 - progress_plus).toFixed(1) * 100 + '%'
                            progress_plus = (progress_plus * 100) + '%'

                            this.card_list[i].progress_minus = progress_minus
                            this.card_list[i].progress_plus = progress_plus

                        }

                    }

                    if (this.card_data.totalProfit > 0) {

                        this.card_box_type = false
                        this.card_box_plus = parseInt(Number(this.card_data.totalProfit) + Number(this.card_data.cost))
                        this.card_box_plus = parseInt((Number(this.card_data.totalProfit) / this.card_box_plus) * 10) / 10
                        if (this.card_box_plus >= 0.9) {
                            this.card_box_plus = 0.9
                        }

                        if (this.card_box_plus == 0) {
                            this.card_box_plus = 0.1
                        }

                        this.card_box_minus = (1 - this.card_box_plus).toFixed(1) * 100 + '%'
                        this.card_box_plus = (this.card_box_plus * 100) + '%'

                    } else {

                        this.card_box_type = true
                        this.card_box_plus = parseInt((Math.abs(this.card_data.totalProfit) / Number(this.card_data.cost)) * 10) / 10

                        if (this.card_box_plus >= 0.9) {
                            this.card_box_plus = 0.9
                        }

                        if (this.card_box_plus == 0) {
                            this.card_box_plus = 0.1
                        }

                        this.card_box_minus = (1 - this.card_box_plus).toFixed(1) * 100 + '%'
                        this.card_box_plus = (this.card_box_plus * 100) + '%'
                    }


                    if (this.card_data.value == null) {
                        this.card_data.totalColor = true
                        this.card_data.value = 0
                        this.card_data.cost = 0
                        this.card_data.todayTotalProfit = 0
                        this.card_data.totalIncrease = '0.00'
                        this.card_data.totalProfitAndCostRatio = '0.00'
                        this.card_data.totalProfit = 0
                        this.card_box_minus = '90%'
                        this.card_box_plus = '10%'
                    }

                    if (this.card_data.name == null) {
                        this.card_data.totalColor = true
                        this.card_data.name = 'Default Portfolio'
                        this.card_data.value = 0
                        this.card_data.cost = 0
                        this.card_data.todayTotalProfit = 0
                        this.card_data.totalIncrease = '0.00'
                        this.card_data.totalProfitAndCostRatio = '0.00'
                        this.card_data.totalProfit = 0
                        this.card_box_minus = '90%'
                        this.card_box_plus = '10%'
                    }

                }
            }
        }
    })
})
