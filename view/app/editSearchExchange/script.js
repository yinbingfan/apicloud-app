let server,
    i18n;
var saveCur;
// function saveCurrency(name){
//     saveCur=name;
//     console.log('saveCursaveCursaveCursaveCursaveCur'+saveCur);
// }
define((require) => {
    require('sdk/vue.min');
    i18n = require('sdk/i18n');
    i18n.tran();
    server = require('sdk/server');
    require('sdk/flexible');

    new Vue({
        el: '#app',
        data: {
            RecommendCurrencyLists:[],//默认收藏与推荐列表的数据
            watchLists:[],//收藏列表数据
            assetCurrencyLists:[],//搜索币种返回接口
            currencyName:'',//币种名称 初始化默认为Currency Name
            cancel:false,//删除是否显示 初始化默认不显示
            recommendCurrencyListAndCollectionList:true,//默认收藏与推荐列表是否显示
            Noresults:false,//搜索结果显示  初始化默认不显示
            currencyList:false,//搜索币种列表 初始化默认不显示

        },
        created() {
        },
        mounted() {
            this.fnGetRecommendCurrencyListAndCollectionList();
            this.fnSubmit()
        },
        methods: {
            /*
            * 点击搜索出来的列表
            * */
            searchAssetExchange(index){
                api.execScript({
                    name: 'editCurrency',
                    script: 'onSelectExchange("'+this.assetCurrencyLists[index].code+'");',
                })
                api.closeWin();

            },
            /*
          * 点击收藏列表
          * */
            watchCurrey(index){
                api.execScript({
                    name: 'editCurrency',
                    script: 'onSelectExchange("'+this.watchLists[index].code+'");',
                })
                api.closeWin();
            },
            /*
            * 点击推荐列表
            * */
            Recommendurrey(index){
                api.execScript({
                    name: 'editCurrency',
                    script: 'onSelectExchange("'+this.RecommendCurrencyLists[index].code+'");',
                })
                api.closeWin();
            },
            /*
            * 返回
            * */
            back(){
                api.closeWin();
            },
            /*
            * 点击搜索时
            * */
            searchBtn(){
                this.fnGetAssetCurrency();
            },
            /*
            * 当搜索框失去焦点的时候
            * */
            searchCurrencyBlur(){
                if(this.currencyName!=''||this.currencyName!=null){
                    this.cancel=true;
                }else{
                    this.cancel=false;
                }
                if(this.currencyList!=null){
                    this.currencyList=true
                }else {
                    this.recommendCurrencyListAndCollectionList=true;
                    this.currencyName='Currency Name'
                    this.currencyList=false;
                }
            },
            /*
            * 当搜索框获得焦点时候
            * */
            searchCurrencyFocus(){
                this.recommendCurrencyListAndCollectionList=false;
                this.cancel=true;
                this.currencyName=''
            },
            /*
            * 点击清除文本框的值
            * */
            cancelInputValue(){
                if(this.currencyName!=''||this.currencyName!=null){
                    // this.currencyName='Currency Name';
                    this.recommendCurrencyListAndCollectionList=true;
                    this.cancel=false;
                    this.assetCurrencyLists='';
                    this.Noresults=false;
                }

            },
            /*
            * 搜索交易所接口数据
            * */
            fnGetAssetCurrency: function () {
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/searchExchange.json',
                    data:{
                        code: this.currencyName,
                        currencyCode: api.pageParam.name,
                    },
                    success:(ret)=>{
                        if(server.isBlank(ret.data)){
                            this.Noresults=true;
                            this.recommendCurrencyListAndCollectionList=false;
                            this.currencyList=false;
                        }else {
                            this.Noresults=false;
                            this.recommendCurrencyListAndCollectionList=false;
                            this.currencyList=true;
                            this.assetCurrencyLists=ret.data;
                        }
                    },
                    error:function(err){
                        console.log(JSON.stringify(err));
                        // app.toast(JSON.stringify(err));
                    }
                })

            },
            /*
            * 获取推荐交易所列表及收藏列表接口
            *
            * */
            fnGetRecommendCurrencyListAndCollectionList:function () {
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/recommendExchangeList.json',
                    data:{
                        userId: server.getUser().userId,
                        languageId: server.getLanguageId(),
                        currencyCode: api.pageParam.name,
                    },
                    success:(ret)=>{
                        this.RecommendCurrencyLists=ret.data.recommendList;
                        this.watchLists=ret.data.watchList;
                    },
                    error:function(err){
                        console.log(JSON.stringify(err));
                        // app.toast(JSON.stringify(err));
                    }
                })

            },
            fnSubmit(){
                this.$nextTick(() => {
                    $("form").submit(function(){
                        return false
                    })
                })
            },


        }
    })
})
