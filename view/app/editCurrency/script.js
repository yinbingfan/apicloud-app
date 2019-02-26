let server,
    i18n;
// var languageStr = [i18n.t("English"), "Pусский", "한국어", "简体中文", "日本語"];

var ExchangeName = '', currencyName = '';
function onSelectExchange(name) {
    ExchangeName = name;
    window.vue.$data.exchangeCode=ExchangeName;
}
function onSelectCurrency(name) {
    currencyName = name;
    window.vue.$data.currencytitle=currencyName;
}


define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n');
    i18n.tran();
    var _vue = window.vue =new Vue({
        el: '#app',
        data: {
            currencyUnitList:[],//币种弹窗列表
            totalValueLists:[i18n.t("Per Unit"), i18n.t("Total Value")],//总价与单价弹窗
            totalOrPer:'',//默认总价
            CNY:'',//默认币种
            Walletgrey:true,//钱包颜色
            Walletyellow:false,
            Exchangegrey:false,//交易所颜色
            Exchangeyellow:true,
            recommendExchangeList:[],//交易所列表
            amount:'',
            price:'',
            bount:'',
            WalletInput:'',
            selectWallet:false,//默认钱包
            selectsExchange:true,//默认交易所
            note:'',
            portfolioId:'',
            currencytitle:'',
            exchangeCode:'',
            lists:api.pageParam.name,
            item:[],
            remnant: 200,
        },
        mounted() {
            this.fnGetCurrencyUnitList();
            this.fnGetView();
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
            isStr :function (str) {
                if(str!=null && str!=undefined && str.length >=1 && str!="undefined "){
                    return true
                }else {
                    return false
                }
            },
            /*
            * 回显币
            * */
            fnGetView(){
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/view.json',
                    data:{
                        id:this.lists.id,
                    },
                    method:'get',
                    success:(ret)=>{
                        this.item=ret.data
                        console.log('🐂🐂🐂🐂🐂🐂🐂'+JSON.stringify(this.item));
                        this.init()
                    },
                    error:function(err){
                        console.log(JSON.stringify(err));
                    }
                })

            },
            init(){
                this.currencytitle=this.item.currencyCode;
                this.amount=this.item.amount;
                this.CNY=this.item.buyUnit;
                this.bount=this.item.bountOn;
                this.note=this.item.note;
                this.portfolioId=this.item.portfolioId;
                if(this.item.buyWay=='1'){
                    this.totalOrPer=i18n.t('Total Value')
                    this.price=this.item.buyTotalPrice

                }else if(this.item.buyWay=='0'){
                    this.totalOrPer=i18n.t('Per Unit')
                    this.price=this.item.buyPrice
                }
                if(this.item.storedType==0){
                    this.Walletgrey=true;//钱包颜色
                    this.Walletyellow=false;
                    this.Exchangegrey=false;//交易所颜色
                    this.Exchangeyellow=true;
                    this.selectWallet=false;//默认钱包
                    this.selectsExchange=true;//默认交易所
                    this.exchangeCode=this.item.exchangeCode
                }else if(this.item.storedType==1){
                    this.Walletgrey=false;//钱包颜色
                    this.Walletyellow=true;
                    this.Exchangegrey=true;//交易所颜色
                    this.Exchangeyellow=false;
                    this.selectWallet=true;//默认钱包
                    this.selectsExchange=false;//默认交易所
                    this.WalletInput=this.item.walletUrl;
                }if(this.item.storedType==2){
                    this.Walletgrey=true;//钱包颜色
                    this.Walletyellow=false;
                    this.Exchangegrey=false;//交易所颜色
                    this.Exchangeyellow=true;
                    this.selectWallet=false;//默认钱包
                    this.selectsExchange=true;//默认交易所
                    this.exchangeCode=''
                }


            },
            /*
            * 点击保存列表
            * */
            saveList(){
                let storedType,buyWay,buyTotalPrice,buyPrice,ExchangeNames,currencyNames,bount,walletUrl;
                //用户id
                if(this.isStr(this.item.userId)){
                    userId= this.item.userId;
                }

                /*货币名称*/
                if(currencyName!=''){
                    this.currencytitle=currencyName
                }else {
                    this.currencytitle=this.item.currencyCode
                }
                if(this.currencytitle!=''){
                    currencyNames= this.currencytitle
                }else {
                    api.toast({
                        msg: i18n.t('Please select a currency name'),
                        duration: 2000,
                        location: 'bottom'
                    })
                    return false
                }

                /*货币数量*/
                if (this.amount!='') {
                    amount = this.amount
                }else {
                    api.toast({
                        msg: i18n.t('Please fill in the currency amount'),
                        duration: 2000,
                        location: 'bottom'
                    })
                    return false
                }
                /*购买时间*/
                if (this.bount!='') {
                    bount = this.bount
                }else {
                    api.toast({
                        msg: i18n.t('Please purchase a selection date'),
                        duration: 2000,
                        location: 'bottom'
                    })
                    return false
                }
                /*总价格与单价切换*/
                if(this.totalOrPer==i18n.t('Total Value')){
                    buyWay='1';
                    buyTotalPrice=this.price;
                }else {
                    buyWay='0';
                    buyPrice=this.price
                }
                if(this.price==''||this.price==null||this.price==i18n.t('Click to enter')){
                    api.toast({
                        msg: i18n.t('Please enter the price'),
                        duration: 2000,
                        location: 'bottom'
                    })

                    return false
                }
                /*钱包或者交易所*/
                if (this.selectsExchange == false) {
                    storedType = '1'
                    this.exchangeCode=''
                } else if (this.selectsExchange == true ){
                    if(ExchangeName != ''){
                        storedType = '0'
                        this.exchangeCode=ExchangeName
                    }else {
                        storedType = '2'
                        this.exchangeCode=''
                    }
                }

                data={
                    id:this.item.id,//用户id
                    userId:this.item.userId,
                        portfolioId: this.portfolioId,//资产组合记录编号
                        currencyCode: currencyNames ,//虚拟货币编码
                        amount:this.amount,//购买数量
                        buyWay:buyWay,//购买方式 0-Per Unit 1-Total Value
                        buyUnit:this.CNY,//购买单位 BTC、ETH、USDT 、等
                        buyTotalPrice:buyTotalPrice ,//购买价格(必填由购买方式决定)
                        buyPrice:buyPrice,//购买价格(必填由购买方式决定)
                        bountOn:bount,//购买时间 （按界面要求）
                        storedType:storedType,//0 交易所，1钱包
                        exchangeCode: this.exchangeCode,//交易所编码(必填由storedType决定)
                        walletUrl: this.WalletInput,//钱包地址
                        note: this.note,//备注
                },
                console.log('🐩🐩🐩🐩🐩🐩🐩'+JSON.stringify(data));
                // alert(JSON.stringify(data))
                // return false
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/update.json',
                    data: data,
                    // data:{
                    //     id:this.item.id,//编号
                    //     userId:this.item.userId,//用户id
                    //     portfolioId: this.portfolioId,//资产组合记录编号
                    //     currencyCode: currencyNames ,//虚拟货币编码
                    //     amount:this.amount,//购买数量
                    //     buyWay:buyWay,//购买方式 0-Per Unit 1-Total Value
                    //     buyUnit:this.CNY,//购买单位 BTC、ETH、USDT 、等
                    //     buyTotalPrice:buyTotalPrice ,//购买价格(必填由购买方式决定)
                    //     buyPrice:buyPrice,//购买价格(必填由购买方式决定)
                    //     bountOn:bount,//购买时间 （按界面要求）
                    //     storedType:storedType,//0 交易所，1钱包
                    //     exchangeCode: this.exchangeCode,//交易所编码(必填由storedType决定)
                    //     walletUrl: this.WalletInput,//钱包地址
                    //     note: this.note,//备注
                    // },

                    success:function(ret){
                        // alert(i18n.t('Saved successfully'))
                        app.toast({
                            msg: i18n.t('Saved successfully'),
                            duration: 2000,
                            location: 'bottom'
                        })
                        // 如果回到编辑页，数据会出问题，需回到index
                        api.closeToWin({
                            name: 'index'
                        })
                        // api.closeWin();

                    },
                    error:function(err){
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
                    name: 'editSearchCurrency',
                    url: '../editSearchCurrency/temp.html',
                },);
                this.exchangeCode=''
                document.querySelector('#exchangetitle').innerHTML = "";
            },
            /*
            *点击选取交易所
            * */
            selectExchange(){
                api.openWin({
                    name: 'editSearchExchange',
                    url: '../editSearchExchange/temp.html',
                    pageParam: {
                        name: this.currencytitle
                    }

                });
                // console.log('edittitile🐷🐷🐷🐷🐷🐷🐷'+JSON.stringify( this.currencytitle));
                // console.log('currencyName🐷🐷🐷🐷🐷🐷🐷'+JSON.stringify( currencyName));

            },
            /*
            * 点击人民币
            * */
            cnys() {
                api.actionSheet({
                        title: i18n.t('select'),
                        cancelTitle: i18n.t("cancel"),
                        buttons: this.currencyUnitList
                    },  (ret, err)=>{
                        if (ret) {
                            if (0 < ret.buttonIndex && ret.buttonIndex <=this.currencyUnitList.length) {
                                this.CNY=this.currencyUnitList[ret.buttonIndex-1];
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
                    (ret, err)=>{
                        if (ret) {
                            if (0 < ret.buttonIndex && ret.buttonIndex < 3) {
                                this.totalOrPer=this.totalValueLists[ret.buttonIndex-1];
                                if(this.totalOrPer==i18n.t("Total Value")){
                                    this.item.buyWay==1
                                    this.price=this.item.buyTotalPrice

                                }else if(this.totalOrPer==i18n.t("Per Unit")){
                                    this.item.buyWay==0
                                    this.price=this.item.buyPrice
                                }

                            }
                        }

                    }
                );

            },
            /*
            * 选择时间
            * */
            selectTime(){
                api.openPicker({
                        type: 'date',
                        date: '',
                        title: ''
                    }, (ret, err)=>{
                        if (ret) {
                            this.bount=ret.year + "-" + ret.month + "-" + ret.day
                        } else {
                            // alert(JSON.stringify(err));
                        }
                    },

                );
            },
            /*
            *切换币种颜色
            * */
            switchingExchangeColor(){
                this.selectsExchange=true;
                this.selectWallet=false;
                if(this.Exchangegrey==false){
                    this.Walletgrey=true;
                    this.Walletyellow=false;
                    this.Exchangegrey=false;
                    this.Exchangeyellow=true;
                }else if(this.Exchangegrey==true){
                    this.Walletgrey=true;
                    this.Walletyellow=false;
                    this.Exchangegrey=false;
                    this.Exchangeyellow=true;
                }
            },
            /*
            * 切换钱包颜色
            * */
            switchingWalletColor(){
                this.selectsExchange=false;
                this.selectWallet=true;
                if(this.Walletgrey==false){
                    this.Walletgrey=false;
                    this.Walletyellow=true;
                    this.Exchangegrey=true;
                    this.Exchangeyellow=false;
                }else if(this.Walletgrey==true){
                    this.Walletgrey=false;
                    this.Walletyellow=true;
                    this.Exchangegrey=true;
                    this.Exchangeyellow=false;
                }

            },
            /*
            * 获取币种
            * */
            fnGetCurrencyUnitList: function () {
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/currencyUnitList.json',
                    data:{},
                    success:(ret)=>{
                        this.currencyUnitList=ret.data;
                    },
                    error:function(err){
                        console.log(JSON.stringify(err));
                        // app.toast(JSON.stringify(err));
                    }
                })

            },
            /*
            * 点击二维码
            * */
            erWeiMa(){
              api.requestPermission({
                  list:['camera'],
                  code:1
              }, function(ret, err){
                  if(ret.list[0].granted) {
                    var FNScanner = api.require('FNScanner');
                    FNScanner.openScanner({
                        autorotation: true
                    }, (ret, err)=>{
                        if (ret) {
                            if(ret.eventType == "success") { // 模块扫描成功事件
                                this.WalletInput=ret.content;
                            }
                        } else {
                            // alert(JSON.stringify(err));
                        }
                    });
                  }

              });

            },
        }
    })
})
