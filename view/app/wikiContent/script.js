let server,
    i18n;
define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n');
    i18n.tran();
    var render = require('render');
    var listRender = render({
        el: '#view-lists'
    })
    app.ready(function() {
        server.loading(0,api.frameName);
    });

  new Vue({
        el: '#app',
        data: {
            newsLists:[],
            title:api.pageParam.name,
            colorArr:['#77D6CE','#99A0FA','#8E9ABF','#C39AA6','#DBD261','#CCB48D','#9CC7E8'],
            pageIndex : 1,
            pageSize : 20,
            noMore : false,
            loading:false,
            loadingAnim:false,
        },
        mounted() {
            this.fnGetNewsWikiList()
            // 安卓手机实现仿ios右滑返回功能
            if (api.systemType == "android") {
              api.addEventListener({
                  name:'swiperight'
              }, function(ret, err){
                 api.closeWin({
                 });

              });
            }
            api.addEventListener({
                name: 'scrolltobottom'
            }, (ret, err)=>{
                if (!this.noMore) {
                    this.loading=false;
                    this.loadingAnim=true;
                    this.fnGetNewsWikiList()
                }else {
                    this.loading=true;
                    this.loadingAnim=false;
                }
            });
        },
        methods: {
            /*
            * 获取列表
            * */
            fnGetNewsWikiList() {
                let param = {
                    channelId:api.pageParam.channelId,
                    countryId:server.getCountryId(),
                    languageId: server.getLanguageId(),
                    useType:"1",
                    page: this.pageIndex,
                    limit: this.pageSize,
                    title:'',
                    searchFlag:''
                }
                server.ajax({
                    // url: appcfg.host+'/v1/api/app/news/wikiList.json',
                    url: appcfg.host+'/v1/api/app/wiki/wikiList.json',
                    method: 'post',
                    data: param,
                    success:(ret)=>{
                        server.loading(1,api.frameName);
                        if (ret.code != "200") {
                            app.toast(ret.msg);
                        }
                        if(ret.data==null||ret.data==''){
                            this.noMore = true;
                            this.loading=true;
                            this.loadingAnim=false;
                            return
                        }

                        if (ret.data.length>0) {
                            let lists=ret.data;
                            for(let i=0;i<lists.length;i++){
                                if(lists[i].conermarkTitle==''||lists[i].conermarkTitle==null){
                                    lists[i].sub=false
                                }else {
                                    lists[i].sub=true
                                }
                                let nums=i%this.colorArr.length;
                                lists[i].BorderColor=this.colorArr[nums]
                            }
                            this.newsLists = this.newsLists.concat(lists);
                            this.pageIndex += 1;
                        }else {
                            this.noMore = true;
                            this.loading=true;
                            this.loadingAnim=false;
                            return;
                        }

                    },
                    error: function(err) {
                        console.log(JSON.stringify(err));

                    }
                });
            },
            /*
           * 点击跳转详情
           * */
            storeUrl(url,id,adFlag,isFavorite){
                var param = {
                    url: appcfg.wikiPages + url,
                    newsId: id,
                    type: 1,
                    isMarked: isFavorite
                }
                // api.openWin({          //wiki详情和新闻详情不共用一个页面的话；（暂时隐藏）
                //     name: "wikiDetailPage",
                //     url: "../wikiDetailPage/temp.html",
                //     pageParam: param
                // });
                api.openWin({
                    name: "detail",
                    url: "../detailPage2/temp.html",
                    pageParam: param,
                    slidBackEnabled: false
                });
            },

            back(){
                api.closeWin();
            },


        },

        /*
      * 过滤器
      * */
        filters: {
            //截取字符串，多余的部分显示省略号
            setString: function (str, len) {
                var strlen = 0;
                var s = "";
                for (var i = 0; i < str.length; i++) {
                    if (str.charCodeAt(i) > 255) {
                        strlen += 2;
                    } else {
                        strlen++;
                    }
                    s += str.charAt(i);
                    if (strlen >= len) {
                        return s+"...";
                    }
                }
                return s;
            },
            TrimAll: function (str) {
                return str.replace(/\s/g,"");
            },
            sub(str){
                var s = "https://"+str.substring(2);
                return s;
            },

        }
    })
})
