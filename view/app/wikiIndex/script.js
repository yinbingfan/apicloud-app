let server;
let  i18n;
let cacheName;
define((require) => {
    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n');
    i18n.tran();
    var render = require('render');
    cacheName = "wiki_"+ server.getCountryId();
    pageIndex = 1;
    pageSize = 10;
    var  listRender = render({
        el: '#view-lists'
    })
    app.ready(function() {
      //监听网络断开连接
      api.addEventListener({
          name:'offline'
      }, function(ret, err){
          $("#noNet")[0].style.display = "block";
      });
      //监听网络重新连接
      api.addEventListener({
          name:'online'
      }, function(ret, err){
        $("#noNet")[0].style.display = "none";
      });
      if(api.connectionType == "none" ) {
        $("#noNet")[0].style.display = "block";
        app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
       }
        server.loading(0,api.frameName);
        // app.loading.show()

    });
     new Vue({
        el: '#app',
        data: {
            newsIndexLists:[],
            colorArr:['#77D6CE','#99A0FA','#8E9ABF','#C39AA6','#DBD261','#CCB48D','#9CC7E8'],
            storage: null,
             pageIndex:'1',
             pageSize :8,
             noMore:false,
             loading:false,
             loadingAnim:false,
             titleWiki:true,
             titleAnima:false,
             anminStop:true,
            loadings:false
        },

        mounted() {
            var slideDatas = api.getPrefs({ sync: true, key: cacheName });
            if(slideDatas) {
               slideDatas = JSON.parse(slideDatas);
               this.getInfos(slideDatas)
            }
            this.fnGetNewsWikiIndex()
            this.is_scroll();
            // this.fnGetNewsWikiIndex()
            api.addEventListener({
                name: 'scrolltobottom'
            }, (ret, err)=>{
                if (!this.noMore) {
                    // this.loading=false;
                    // this.loadingAnim=true;
                    this.fnGetNewsWikiIndex();

                }else {
                    this.loading=true;
                    this.loadingAnim=false;
                }
            });
        },
        methods: {

            is_stop(){
                let param = {
                    languageId: server.getLanguageId(),
                    page: 1,
                    limit: '999999',
                }
                server.ajax({
                    // url: appcfg.host+'/v1/api/app/news/wikiIndex.json',
                    url: appcfg.host+'/v1/api/app/wiki/wikiIndex.json',
                    method: 'post',
                    data: param,
                    success:(ret)=>{
                        if(ret.data.list==''||ret.data.list==null){
                            server.loading(1,api.frameName);
                            this.loading=true;
                            this.loadingAnim=false;
                            return
                        }else {
                            let dataLeng=ret.data.list.length
                            if(Math.ceil(dataLeng/20)>=this.pageIndex){
                                setTimeout(()=>{
                                    // this.loadingAnim=true;
                                    // this.loading=false;
                                    // this.loadings=true;
                                    this.fnGetNewsWikiIndex();
                                },300)

                            }else {
                                server.loading(1,api.frameName);
                                this.loading=true;
                                this.loadingAnim=false;
                                return
                            }
                        }

                    },
                    error: function(err) {
                        console.log(JSON.stringify(err));

                    }
                });
            },

            /*
            * 动画效果
            * */
            is_scroll() {
                let begin,
                    end,
                    to_top,
                    to_dowm,
                    that = this
                let wikiContent = document.querySelector('.wiki-content')
                var elm = $('.search-header');
                var cont = $('.wiki-content');
                // var startPos = $(elm).offset().top;
                //计算页面需要滑动的高度
                  var startPos = $(".title-bar").height();
                //页面监听滑动事件
                $.event.add(window, "scroll", function() {
                  //计算页面滑动的距离
                  var p = $(window).scrollTop();

                  //滑动距离大于设定滑动距离做样式的改变
                  $(elm).css('position',((p) > startPos) ? 'fixed' : 'static');
                  $(elm).css('top',((p) > startPos) ? '0' : '');
                  $(elm).css('padding',((p) > startPos) ? '0.16rem 0.21333rem' : '0.16rem 0.21333rem 0 0.21333rem');
                  $(elm).css('background',((p) > startPos) ? '#ffffff' : '#F5F5F5');
                  $(cont).css('padding-top',((p) > startPos) ? $(elm).height()+10 : 0);
                  $(".search-header .search-header-content").css('background',((p) > startPos) ? '#F5F5F5' : '#ffffff');
              });

            },
            /*
            * 获取wiki首页新闻列表
            * */
            fnGetNewsWikiIndex() {
                let param = {
                    languageId: server.getLanguageId(),
                    page: this.pageIndex,
                    limit: this.pageSize,
                }
                this.loading = false;
                this.loadingAnim=true;
                //没有网络不分页
                if(api.connectionType == "none" && this.pageIndex>1) {
                    app.toast(i18n.t("Network_error_please_try_again_later"), 1500)
                    return;
                }
                server.ajax({
                    url: appcfg.host+'/v1/api/app/wiki/wikiIndex.json',
                    name: cacheName,
                    method: 'post',
                    data: param,
                    success:(ret)=>{
                        if (ret.code != "200") {
                            app.toast(ret.msg);
                        }
                        //缓存第一页数据
                        if (this.pageIndex == 1){
                          api.setPrefs({ key: cacheName, value: JSON.stringify(ret) });
                        }
                        this.getInfos(ret)
                        this.pageIndex++;

                    },
                    error: function(err) {
                        console.log(JSON.stringify(err));

                    }
                });
            },
            //请求数据成功后，处理数据
            getInfos(ret){
              let lists=ret.data.list;
              if(lists==''||lists==null){
                  server.loading(1,api.frameName);
                  this.loading=true;
                  this.loadingAnim=false;
                  return

              }else if(lists.length<this.pageSize){

                  this.loading=true;
                  this.loadingAnim=false;
              }
              server.loading(1,api.frameName);
              for(let i=0;i<lists.length;i++){
                  for(let j=0;j<lists[i].list.length;j++){

                      if(lists[i].list[j].conermarkTitle==''||lists[i].list[j].conermarkTitle==null){
                          lists[i].list[j].sub=false
                      }else{
                          lists[i].list[j].sub=true;
                          lists[i].list[j].conermarkTitle=this.cutString(lists[i].list[j].conermarkTitle,20)
                      }
                      lists[i].list[j].BorderColor=this.colorArr[j];

                  }
              }
              this.newsIndexLists = this.newsIndexLists.concat(lists);
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
                console.warn(JSON.stringify(param));
                // api.openWin({
                //     name: "Page",
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
            /*
            * 点击文本框
            * */
            clickSearchWikiInput(){
                api.openWin({
                    name: 'wikiSearch',
                    url: '../wikiSearch/temp.html',
                    slidBackEnabled: false,
                });
            },
            /*
            * 点击更多
            * */
            moreNews(name,index){
                api.openWin({
                    name: 'wikiContent',
                    url: '../wikiContent/temp.html',
                    pageParam: {
                        name:name,
                        channelId: index,
                    }
                });
            },
            cutString(str, len) {
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
