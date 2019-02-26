let server,
    lock = false,
    i18n;
//获取推特列表
var initData = function() {
    noMore = false;
}
define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n');
    i18n.tran();

    var render = require('render');
    listRender = render({
        el: '#view-lists'
    })
    app.ready(function() {
        //初始化数据
        initData();
        if(api.systemType == "android") {
          var softInput = api.require('softInputMgr');
          softInput.toggleKeyboard();
        }
        // $('#searchBtn').trigger("click").focus();


        // document.querySelector('#searchBtn').click()
        // 安卓手机实现仿ios右滑返回功能
        if (api.systemType == "android") {
          api.addEventListener({
              name:'swiperight'
          }, function(ret, err){
             api.closeWin({
             });
          });
        }
    });


   new Vue({
        el: '#app',
        data: {
            wikiSearchLists:[],
            searchWiki:'',
            NoResults:false,
            wikiNewsSearchResult:false,
            defaultBlank:true,
            inputTimer:'',
            pageIndex : '1',
            pageSize :'20',
            noMore : false,
            listRender,
            url:'',
            param:'',
            searchFlag:'title',
            loading:false,
            loadingAnim:false,

        },
        directives: {
            focus: {
                inserted: function (el, {value}) {
                    // alert(el,{value})
                    if (value) {
                      setTimeout(function() {
                          el.focus();
                      },500)

                    }
                }
            }
        },
        created(){


        },
        mounted() {

            // this.fnSubmit()
            api.addEventListener({
                name: 'scrolltobottom'
            }, (ret, err)=>{
                if (!this.noMore) {
                    document.querySelector('#loading-anim').style.display='block';
                    this.loading=false;//文字
                    this.loadingAnim=true;//加载图片
                    // pageIndex += 1;

                    this.fnGetWikiSearch(this.fnGetSearchParam());
                }else {
                    this.loading=true;//文字
                    this.loadingAnim=false;//加载图片

                }

            });
        },

        methods: {

            /*
           * 点击跳转详情
           * */
            storeUrl(url,id,adFlag,isFavorite){
                var param = {
                    url: appcfg.host + url,
                    newsId: id,
                    type: 1,
                    isMarked: isFavorite
                }
                // api.openWin({
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

            clearText(){
               this.searchWiki='';
            },
            /*
            * 点击清除文本框的值
            * */
            cancelInputValue(){
              if(api.systemType == "android") {
                  var softInput = api.require('softInputMgr');
                  try {
                    softInput.toggleKeyboard();
                  } catch (error) {

                  }

              }
              setTimeout(function() {
                  api.closeWin()
              },100)
            },
            /*
             * 点击回车时搜索
             * */
            searchBtn(){
                if(lock) {
                  return false;
                }
                lock = true;
                setTimeout(function() {
                  lock = false;
                },500)
                document.querySelector('#loading-anim').style.display='none';
                document.querySelector('#loading').style.display='none';
                this.NoResults=false;
                this.wikiNewsSearchResult=false;
                this.defaultBlank=true;
                this.searchFlag='title';
                this.pageIndex = 1;
                this.wikiSearchLists=[];
                this.fnGetWikiSearch(this.fnGetSearchParam());

            },

            fnGetSearchParam(){
                var param = {};
                    param.languageId = server.getLanguageId();
                    param.limit = this.pageSize
                    param.page = this.pageIndex
                    param.title = this.searchWiki
                    param.searchFlag = this.searchFlag//title,title,tagName
                return param;
            },
            /*
            * 无更多数据提示
            * */
            noMoreData(){
                this.loading=true;//文字
                this.loadingAnim=false;//加载图片
            },
            inputFunc(){
                if(this.searchWiki==''||this.searchWiki==null){
                  this.NoResults=false;
                  this.wikiNewsSearchResult=false;
                  this.defaultBlank=true;
              }
            },
            /*
            * 搜索新闻列表
            * */
            fnGetWikiSearch(param) {
                if(!this.searchWiki||this.searchWiki==''){
                    return false;
                }else {
                    server.ajax({
                        // url: appcfg.host+'/v1/api/app/news/wikiList.json',
                        url: appcfg.host+'/v1/api/app/wiki/wikiList.json',
                        data:param,
                        success:(ret)=>{
                          console.warn(JSON.stringify(ret))
                            if(ret.data.length<1&&this.searchFlag=='title'){
                                /*无数据默认展示无结果页面*/
                                if( this.wikiSearchLists==''){
                                    this.NoResults=true;
                                    this.wikiNewsSearchResult=false;
                                    this.defaultBlank=false;
                                }else {
                                    this.noMoreData();
                                }
                                return
                                var param = {};
                                param.languageId = server.getLanguageId();
                                param.limit = this.pageSize
                                param.page = 1;
                                param.title = this.searchWiki
                                param.searchFlag = this.searchFlag = 'tagName';
                                this.fnGetWikiSearch(param);
                            }else{
                                if(ret.data.length==0){
                                    /*无数据默认展示无结果页面*/
                                    if( this.wikiSearchLists==''){
                                        this.NoResults=true;
                                        this.wikiNewsSearchResult=false;
                                        this.defaultBlank=false;
                                    }else {
                                        this.noMoreData();
                                    }
                                    return
                                };
                                this.defaultBlank=false;
                                this.NoResults=false;
                                this.wikiNewsSearchResult=true;
                                this.wikiSearchLists = this.wikiSearchLists.concat(ret.data);
                                let lists =  ret.data;
                                for(let i=0;i<lists.length;i++){
                                    if(lists[i].conermarkTitle==''||lists[i].conermarkTitle==null){
                                        lists[i].sub=false
                                    }else {
                                        lists[i].sub=true
                                    }
                                }
                                this.pageIndex++
                            }
                        }
                    });

                }

            },
            fnSubmit(){
                this.$nextTick(() => {
                    $("form").submit(function(){
                        return false
                    })
                })
            },
             substring(str, len, flow) {
                 if (!str) return '';
                 str = str.toString();
                 var newStr = "",
                     strLength = str.replace(/[^\x00-\xff]/g, "**").length,
                     flow = typeof(flow) == 'undefined' ? '...' : flow;

                 if (strLength <= len + (strLength % 2 == 0 ? 2 : 1)) return str;

                 for (var i = 0, newLength = 0, singleChar; i < strLength; i++) {
                     singleChar = str.charAt(i).toString();
                     if (singleChar.match(/[^\x00-\xff]/g) != null) newLength += 2;
                     else newLength++;

                     if (newLength > len) break;
                     newStr += singleChar;
                 }

                 if (strLength > len) newStr = $.trim(newStr) + flow;
                 return newStr;

              },
            setString (str, len){
                var strlen = 0;
                var s = "";
                for (var i = 0; i < str.length; i++) {
                    if (str.charCodeAt(i) > 128) {
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
                    if (str.charCodeAt(i) > 128) {
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
