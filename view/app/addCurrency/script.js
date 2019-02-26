let server,
    i18n;

var ExchangeName = '', currencyName = '', portfolio;

function onSelectExchange(name) {
    ExchangeName = name;
    window.vue.$data.exchangetitle=ExchangeName;
}

function onSelectCurrency(name) {
    currencyName = name;
    window.vue.$data.currencytitle=currencyName;
}


define((require,exports,module) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n');
    i18n.tran();

    var _vue = window.vue = new Vue({
        el: '#app',
        data: {
            currencyUnitList: [],//币种弹窗列表
            totalValueLists: [i18n.t("Per Unit"), i18n.t("Total Value")],//总价与单价弹窗
            totalOrPer: i18n.t('Total Value'),//默认总价
            CNY: 'USD',//默认币种
            Walletgrey: true,//钱包颜色
            Walletyellow: false,
            Exchangegrey: false,//交易所颜色
            Exchangeyellow: true,
            recommendExchangeList: [],//交易所列表
            exchangetitle:'',
            currencytitle:'',
            amount: '',
            price: '',
            WalletInput: '',
            selectWallet: false,//默认钱包
            selectsExchange: true,//默认交易所
            note: '',
            // page_param: api.pageParam.name,
            portfolio: '',
            bount: i18n.t('Click to enter'),
            remnant: 200,
            ParamCurrencyCode:api.pageParam.param,
        },
        mounted() {
            this.fnGetCurrencyUnitList();
            this.init();
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
            textCounter(){
                let txtVal = this.note.length;
                this.remnant = 200 - txtVal;
                if( this.remnant==0){
                   return false
                }
            },
            isStr: function (str) {
                if (str != null && str != undefined && str.length >= 1 && str != "undefined ") {
                    return true
                } else {
                    return false
                }
            },
            /*
            * 默认时间
            * */
            getNowFormatDate() {
                var date = new Date();
                var seperator1 = "-";
                var seperator2 = ":";
                var month = date.getMonth() + 1;
                var strDate = date.getDate();
                if (month >= 1 && month <= 9) {
                    month = "0" + month;
                }
                if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
                }
                var currentdate = date.getFullYear() + seperator1 + month + seperator1+strDate;
                return currentdate;
            },
            init() {
                /*购买时间默认为当天*/
                this.bount = this.getNowFormatDate();
                /*判断资产ID*/
                let portfolio_ids = api.getPrefs({
                    sync: true,
                    key: 'portfolio_id',
                });
                if (portfolio_ids == null||portfolio_ids=='') {
                    server.ajax({
                        url: appcfg.host+'/v1/api/app/bcmPortfolio/add.json',
                        data: {
                            userId: server.getUser().userId,
                            name: 'Default Portfolio',
                            defaultFlag: '1',
                        },
                        success: (ret) => {
                            this.portfolio = ret.data;
                            api.setPrefs({
                                key: 'portfolio_id',
                                value: ret.data
                            });
                        },
                        error: function (err) {
                            console.log(JSON.stringify(err));
                        }
                    })
                } else {
                    this.portfolio = portfolio_ids;
                }

                if(this.ParamCurrencyCode==undefined) {
                    this.currencytitle=''
                }else if(this.ParamCurrencyCode!=''||this.ParamCurrencyCode!=null){
                    this.currencytitle=api.pageParam.param.currencyCode
                }else {
                    this.currencytitle=''
                }



            },
            /*
            * 点击保存列表
            * */
            saveList() {
                let storedType, buyWay, buyTotalPrice, buyPrice, userId,
                    bount, currencyNames, amount, CNY, ExchangeNames, walletUrl;
                //用户id
                if (this.isStr(server.getUser().userId)) {
                    userId = server.getUser().userId;
                }
                /*货币名称*/
                if (currencyName!= '') {
                    currencyNames = currencyName
                } else if(this.currencytitle!=null||this.currencytitle!=''){
                    currencyNames=this.currencytitle

                }else {
                    api.toast({
                        msg: i18n.t('Pick a Currency'),
                        duration: 2000,
                        location: 'bottom'
                    })
                    return false
                }
                if(this.currencytitle==''||this.currencytitle==i18n.t('Pick a Currency')){
                    api.toast({
                        msg: i18n.t('Pick a Currency'),
                        duration: 2000,
                        location: 'bottom'
                    })
                    return false
                }
                /*购买数量*/
                if (this.amount != '') {
                    amount = this.amount
                } else {
                    api.toast({
                        msg: i18n.t('Please fill in the currency amount'),
                        duration: 2000,
                        location: 'bottom'
                    })
                    return false
                }
                /*购买单位*/
                if (this.CNY != '') {
                    CNY = this.CNY
                } else {
                    return false
                }
                /*购买时间*/
                if (this.bount != ''&&this.bount!=i18n.t('Click to enter')) {
                    bount = this.bount
                } else if(this.bount==i18n.t('Click to enter')){
                    this.bount = this.getNowFormatDate();

                }else {
                    api.toast({
                        msg: i18n.t('Please purchase a selection date'),
                        duration: 2000,
                        location: 'bottom'
                    })
                    return false
                }
                /*总价或者单价区分*/
                if (this.totalOrPer == i18n.t('Total Value')) {
                    buyWay = '1';
                    if (this.price != '') {
                        buyTotalPrice = this.price;
                    } else {
                        api.toast({
                            msg: i18n.t('Please enter the price'),
                            duration: 2000,
                            location: 'bottom'
                        })

                        return false
                    }

                } else {
                    buyWay = '0';
                    if (this.price != '') {
                        buyPrice = this.price
                    } else {
                        api.toast({
                            msg: i18n.t('Please enter the price'),
                            duration: 2000,
                            location: 'bottom'
                        })

                        return false
                    }
                }
                /*钱包或者交易所*/
                if (this.selectsExchange == false) {
                    storedType = '1'
                    ExchangeName=''
                } else if (this.selectsExchange == true ){
                    if(ExchangeName != ''){
                        storedType = '0'
                    }else {
                        storedType = '2'
                        ExchangeName=''
                        this.exchangetitle=''
                    }

                }
                data= {
                    userId: userId,//用户id
                    portfolioId: this.portfolio,//资产组合记录编号
                    currencyCode: currencyNames,//虚拟货币编码
                    amount: amount,//购买数量
                    buyWay: buyWay,//购买方式 0-Per Unit 1-Total Value
                    buyUnit: CNY,//购买单位 BTC、ETH、USDT 、等
                    buyTotalPrice: buyTotalPrice,//购买价格(必填由购买方式决定)
                    buyPrice: buyPrice,//购买价格(必填由购买方式决定)
                    bountOn: bount,//购买时间 （按界面要求）
                    storedType: storedType,//0 交易所，1钱包
                    exchangeCode: ExchangeName,//交易所编码(必填由storedType决定)
                    walletUrl: this.WalletInput,//钱包地址
                    note: this.note,//备注
                }
                console.log('🐂🐂🐂🐂🐂🐂'+JSON.stringify(data));
                // alert(JSON.stringify(data))
                // return false
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/add.json',
                    data: {
                        userId: userId,//用户id
                        portfolioId: this.portfolio,//资产组合记录编号
                        currencyCode: currencyNames,//虚拟货币编码
                        amount: amount,//购买数量
                        buyWay: buyWay,//购买方式 0-Per Unit 1-Total Value
                        buyUnit: CNY,//购买单位 BTC、ETH、USDT 、等
                        buyTotalPrice: buyTotalPrice,//购买价格(必填由购买方式决定)
                        buyPrice: buyPrice,//购买价格(必填由购买方式决定)
                        bountOn: bount,//购买时间 （按界面要求）
                        storedType: storedType,//0 交易所，1钱包
                        exchangeCode: ExchangeName,//交易所编码(必填由storedType决定)
                        walletUrl: this.WalletInput,//钱包地址
                        note: this.note,//备注
                    },
                    success: (ret) => {
                        // alert(i18n.t('Saved successfully'))
                        app.toast({
                            msg: i18n.t('Saved successfully'),
                            duration: 2000,
                            location: 'bottom'
                        })
                        this.amount = '';
                        this.price = '';
                        this.bount = '';
                        this.WalletInput = '';
                        this.selectWallet = false,//默认钱包
                        this.selectsExchange = true,//默认交易所
                        this.note = '';
                        document.querySelector('#currencytitles').value = "";
                        document.querySelector('#exchangetitle').value = "";
                        ExchangeName = '';
                        currencyName = '';
                        let datas = {}
                        datas.id = this.portfolio
                        api.execScript({
                            name: 'index',
                            frameName: "assets",
                            script: 'jump_datas(' + JSON.stringify(datas) + ')'
                        });
                        api.closeWin()

                    },
                    error: function (err) {
                        console.log(JSON.stringify(err));
                    }
                })


            },
            /*
            * 数量判断
            * */
            isAmount(){
                if(!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(this.amount)){
                    this.amount='';
                    document.querySelector('#amount').value = "";
                }else if(this.amount<=0){
                    this.amount='';
                    document.querySelector('#amount').value = "";
                }

            },
            /*
            * 价格判断
            * */
            isPrice(){
                if(!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(this.price)){
                    this.price='';
                    document.querySelector('#price').value = "";
                }

            },

            /*
            * 点击进入币种详情页面
            * */
            enterCurrency() {
                api.openWin({
                    name: 'searchCurrency',
                    url: '../searchCurrency/temp.html',
                });
                ExchangeName=''
            },
            /*
            *点击选取交易所
            * */
            selectExchange( ) {
                api.openWin({
                    name: 'searchExchange',
                    url: '../searchExchange/temp.html',
                    pageParam: {
                        name:  this.currencytitle
                    }

                });
                console.log('dcdscdscdc🐷🐷🐷🐷🐷🐷🐷'+JSON.stringify( this.currencytitle));


            },
            /*
            * 点击人民币
            * */
            cny() {
                api.actionSheet({
                        title: i18n.t('select'),
                        cancelTitle: i18n.t("cancel"),
                        buttons: this.currencyUnitList
                    }, (ret, err) => {
                        if (ret) {
                            if (0 < ret.buttonIndex && ret.buttonIndex <= this.currencyUnitList.length) {
                                this.CNY = this.currencyUnitList[ret.buttonIndex - 1];
                            }
                        }

                    }
                );
            },
            /*
            * 点击总价
            * */
            totalValue() {
                api.actionSheet({
                        cancelTitle: i18n.t("cancel"),
                        buttons: this.totalValueLists
                    },
                    (ret, err) => {
                        if (ret) {
                            if (0 < ret.buttonIndex && ret.buttonIndex < 3) {
                                this.totalOrPer = this.totalValueLists[ret.buttonIndex - 1];
                            }
                        }

                    }
                );
            },
            /*
            * 选择时间
            * */
            selectTime() {
                api.openPicker({
                        type: 'date',
                        date: '',
                        title: ''
                    }, (ret, err) => {
                        if (ret) {
                            this.bount = ret.year + "-" + ret.month + "-" + ret.day
                        } else {
                            // alert(JSON.stringify(err));
                        }
                    }
                );
            },
            /*
            *切换币种颜色
            * */
            switchingExchangeColor() {
                this.selectsExchange = true;
                this.selectWallet = false;
                if (this.Exchangegrey == false) {
                    this.Walletgrey = true;
                    this.Walletyellow = false;
                    this.Exchangegrey = false;
                    this.Exchangeyellow = true;
                } else if (this.Exchangegrey == true) {
                    this.Walletgrey = true;
                    this.Walletyellow = false;
                    this.Exchangegrey = false;
                    this.Exchangeyellow = true;
                }
            },
            /*
            * 切换钱包颜色
            * */
            switchingWalletColor() {
                this.selectsExchange = false;
                this.selectWallet = true;
                if (this.Walletgrey == false) {
                    this.Walletgrey = false;
                    this.Walletyellow = true;
                    this.Exchangegrey = true;
                    this.Exchangeyellow = false;
                } else if (this.Walletgrey == true) {
                    this.Walletgrey = false;
                    this.Walletyellow = true;
                    this.Exchangegrey = true;
                    this.Exchangeyellow = false;
                }

            },
            /*
            * 获取币种
            * */
            fnGetCurrencyUnitList: function () {
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/currencyUnitList.json',
                    data: {},
                    success: (ret) => {
                        this.currencyUnitList = ret.data;
                        this.CNY = this.currencyUnitList[0]
                    },
                    error: function (err) {
                        // app.toast(JSON.stringify(err));
                    }
                })

            },
            /*
            * 点击二维码
            * */
            erWeiMa() {
              // 请求相机权限
              api.requestPermission({
                  list:['camera'],
                  code:1
              }, function(ret, err){
                  if(ret.list[0].granted) {
                    var FNScanner = api.require('FNScanner');
                    FNScanner.openScanner({
                        autorotation: true
                    }, (ret, err) => {
                        if (ret) {
                            if (ret.eventType == "success") { // 模块扫描成功事件
                                this.WalletInput = ret.content;
                                // api.alert({
                                //     title: '扫描结果',
                                //     msg: ret.content,
                                // }, function (ret, err) {
                                // });
                            }else if(ret.eventType == "cameraError"){
                              // api.toast({
                              //      msg: i18n.t("no_permission"),
                              //      duration: 2000,
                              //      location: 'middle '
                              //  });
                            }
                        }
                    });
                  }

              });

            },
        }


    })

    module.exports = {
        //打开websocket的url
        vues: _vue,
    }
})
