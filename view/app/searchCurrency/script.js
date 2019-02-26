let server,
    i18n;

define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n');


    // vue.$method.ok();
    i18n.tran();
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
          // 安卓手机实现仿ios右滑返回功能
          if (api.systemType == "android") {
            api.addEventListener({
                name:'swiperight'
            }, function(ret, err){
               api.closeWin({
               });
            });
          }
            this.fnGetRecommendCurrencyListAndCollectionList();
            this.fnSubmit()

        },
        methods: {
            back(){
                api.closeWin();
            },
            /*
            * 点击搜索列表
            * */
            searchCurrey(index){
                 api.execScript({
                    name:'addCurrency',
                    script:'onSelectCurrency("'+this.assetCurrencyLists[index].code+'");',

                })


                api.closeWin({
                    name: 'searchCurrency'
                });
            },
            /*
            * 点击收藏列表
            * */
            watchCurrey(index){
                api.execScript({
                    name: 'addCurrency',
                    script: 'onSelectCurrency("'+this.watchLists[index].code+'");',
                })
                api.closeWin({
                    name: 'searchCurrency'
                });
            },
            /*
            * 点击推荐列表
            * */
            Recommendurrey(index){
                api.execScript({
                    name: 'addCurrency',
                    script: 'onSelectCurrency("'+this.RecommendCurrencyLists[index].code+'");',
                })
                api.closeWin({
                    name: 'searchCurrency'
                });
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
                    this.currencyName=i18n.t('Currency Name')
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
                if(this.currencyName!=null||this.currencyName!=''){
                    // this.currencyName=i18n.t('Currency Name');
                    this.recommendCurrencyListAndCollectionList=true;
                    this.assetCurrencyLists=[];
                    this.Noresults=false;
                    this.cancel=false;
                }
            },
            /*
            * 搜索货币接口数据
            * */
            fnGetAssetCurrency: function () {
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/searchCurrency.json',
                    data:{
                        code: this.currencyName,
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

                })

            },
            /*
            * 获取推荐列表及收藏列表接口
            *
            * */
            fnGetRecommendCurrencyListAndCollectionList: function () {
                server.ajax({
                    url: appcfg.host+'/v1/api/app/bcmAssetCurrency/recommendCurrencyList.json',
                    data:{
                        userId: server.getUser().userId,
                        languageId: server.getLanguageId(),
                    },
                    success:(ret)=>{
                        this.RecommendCurrencyLists=ret.data.recommendList;
                        this.watchLists=ret.data.watchList;
                    },
                    error:function(err){
                        // app.toast(JSON.stringify(err));
                        console.log(JSON.stringify(err));
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
