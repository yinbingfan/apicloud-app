/*
 * layout
 */
var server;
var cacheName;
var open = false;       //true:导航处于打开状态    false:导航从未加载   目的：检测导航导航栏的加载和更新
var convertedColumns = [];
var frameLists = [];
var footHeight;
var NVNavigationBar;
var i18n;
var closeLock = false;    //true:导航栏有更新情况   false:导航栏无更新    目的：导航信息有更新则重新加载新闻列表组（framegroup）
define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    var $ = app.util;
    footHeight = server.getFooterHeight();
    cacheName = 'channel_'+ server.getCountryId();
    NVNavigationBar = api.require('NVNavigationBar');
      var cacheV = api.getPrefs({ sync: true, key: cacheName });
      if(cacheV) {
          openFrameLists(JSON.parse(cacheV));
      }else{
          getNewsList();
      }
    //监听网络断开连接
    api.addEventListener({
        name:'offline'
    }, function(ret, err){
        api.setFrameGroupAttr({
            name: 'group1',
            rect: {
                 x: 0,
                 y: 122,
                 w: 'auto',
                 h: api.winHeight-122-server.getFooterHeight()
            },
        });
        $("#tophint")[0].style.display = "none";
        $("#noNet")[0].style.display = "block";
    });
    //监听网络重新连接
    api.addEventListener({
        name:'online'
    }, function(ret, err){
      api.setFrameGroupAttr({
          name: 'group1',
          rect: {
               x: 0,
               y: 89,
               w: 'auto',
               h: api.winHeight-89-server.getFooterHeight()
          },
      });
      $("#noNet")[0].style.display = "none";
      $("#tophint")[0].style.display = "block";
    });


});
//加载该页面所有结构和数据
function getNewsList(change) {
  closeLock = false;
  server.ajax({
      url: appcfg.host+'/v1/api/app/channel/list.json',
      name: cacheName,   //数据缓存参数
      method: 'post',
      data: {
          languageId: server.getLanguageId(),
          countryId: server.getCountryId()
      },
      success: function(ret) {
         //缓存数据
          api.setPrefs({ key: cacheName, value: JSON.stringify(ret) });
          if (null == ret || ret.data.length == 0) {
              return;
          }

          openFrameLists(ret,change);

      },
      error: function(err) {
          console.log(JSON.stringify(err));
      }
  });
}

function openFrameLists(ret,change) {
  var newnum = 0;       //该参数用于判断刷新后的导航数据是否有上线或者下线

  if(ret.data.length!=convertedColumns.length && convertedColumns.length!=0) {   //数据有上线或者下线，导航数量有变化
      closeLock = true;
  }else if(ret.data.length==convertedColumns.length  && convertedColumns.length!=0){   //数据有上线或者下线，导航总数量一样
    for (var i = 0; i < ret.data.length; i++) {
      for(var j = 0; j <convertedColumns.length; j++) {
          if(ret.data[i].id==convertedColumns[j].id) {
            newnum ++
          }
      }
    }
    if(newnum!= ret.data.length){
        closeLock = true;
    }
  }

  app.pull.stop();
  var bg = 'widget://res/img/ic_indicator_no.png'
  var bgSelected = 'widget://res/img/ic_indicator.png';
  if (api.systemType == "android") {
      bg = "widget://res/img/indicator_no_android.png";
      bgSelected = "widget://res/img/indicator_android.png"
  }
  convertedColumns = []    //获取到新数据时，把参数置空，后面赋值
  frameLists = []         //获取到新数据时，把参数置空，后面赋值
  for (var i = 0; i < ret.data.length; i++) {
      var item = ret.data[i];
      var width = compute(item.name) + 20;
      var col = {
          id: item.id,
          title: item.name,
          titleSelected: item.name,
          bg: bg,
          bgSelected: bgSelected,
          // size: {
          //     w: width,
          //     // h: 44
          // }
      }

      var list = {
          name: 'subNew-0' + i,
          url: '../newsListWithBanner/tempab.html',
          bgColor: '#fff',
          pageParam: {
            channelId: item.id,
            index: i
          }
      }
      var l = server.getLanguageId();             //解决日语下切换不居中问题
      console.log(l);
      if(l != "152" && l != "77" && l != "204"){
        col.size = {
          w: width
        }
      }


      convertedColumns.push(col);
      frameLists.push(list);
      if(closeLock || change==1) {
        api.closeFrameGroup({
            name: 'group1'
        });

      }
  }
  //第一次加载导航栏
  if(!open){
    NVNavigationBar.open({
        rect: {
            x:10,
            y: 0,
            w: api.frameWidth - 10,
            h: 45
        },
        styles: {
            orientation: 'horizontal',
            bgAlpha: 1,
            bg: '#ffffff',
            font: {
                size: 15,
                sizeSelected: 15,
                color: '#B4B3B3',
                colorSelected: '#202020',
                alpha: 1
            },
            itemSize: {
                w: 150,
                h: 44
            }
        },
        items: convertedColumns,
        selectedIndex: 0,
        fixedOn: api.frameName,
        id: convertedColumns[0].id
    }, function(ret, err) {
        //加载子页面新闻列表
        var name = 'subNew-0';
        var channelId1; //栏目id
        var index1; //第几个栏目
        var top = 88;
        var url = '../newsListWithBanner/tempab.html';
         //展示加载导航条
        if (ret.eventType == "show") {
            name = name + "0";
            index1 = 0;
            channelId1 = convertedColumns[0].id + "";

            api.openFrameGroup ({
                name: 'group1',
                background: '#fff',
                scrollEnabled: true,
                rect: {
                     x: 0,
                     y: 89,
                     w: 'auto',
                     h: api.winHeight-89-footHeight
                },
                index: 0,
                preload: 0,
                frames: frameLists,
            }, function(res, err){
                if( res ){
                    server.setNewsTopFrame(res.name);
                    var index = res.index;
                    NVNavigationBar.setSelected({
                      id: convertedColumns[0].id,
                      index: index,
                      selected: true
                  }, function(ret) {
                      // alert(JSON.stringify(ret));
                  });
                    // setTimeout('switchPage(' + index + ')', 300);
                }else{
                    //  alert( JSON.stringify( err ) );
                }
            });
        //点击切换 ret.eventType == "click"
        } else {
            name = name + ret.index;
            index1 = ret.index;
            channelId1 = convertedColumns[ret.index].id + "";
            api.setFrameGroupIndex({
              name: 'group1',
              index: index1
          });
        }
        //加载新闻页面过程中切换到其他页面， （目的：解决切换footer的栏目出现页面错乱问题）
        if(api.getPrefs({
                key: 'pages',
                sync: true
            })!="newsHome"){
              //如果是切换到行情页面，则隐藏该新闻列表组页面，显示出行情页面
              if(api.getPrefs({
                      key: 'pages',
                      sync: true
                  })=="market"){
                    api.setFrameGroupAttr({
                        name: 'group1',
                        hidden: true
                    });
               //如果是切换到其他页面，就使被切换的页面到最前面显示
              }else {
                api.bringFrameToFront({
                    from: api.getPrefs({
                        key: 'pages',
                        sync: true
                    })
                });
              }
        }
    });
  //更新导航栏信息
  }else{
    NVNavigationBar.update({
      id: convertedColumns[0].id,
      items:convertedColumns
    }, function(ret) {

    });
  }
}
//计算元素填内容后的宽度
function compute(v) {
    var d = document.getElementById('invisible');
    d.innerHTML = v;
    return d.offsetWidth;
}
//重新加载页面
function reloadList() {
  getNewsList();
}

//切换列表页面
function show(index) {
  api.openFrameGroup({
    name: 'group1',
    }, function(ret, err) {

    });

    if(api.getPrefs({
            key: 'pages',
            sync: true
        })!="newsHome"){
          api.bringFrameToFront({
              from: api.getPrefs({
                  key: 'pages',
                  sync: true
              })
          });
    }

}

//切换列表页面
function switchPage(index) {
    console.log("switchPage");

    console.log(frameLists[index].name+ '<<<<<<<<<<<<<<<<<<<<<<<<')
    api.execScript({
        frameName: frameLists[index].name,
        script: 'setTimeout("loadData()",300);'
    })

    frameLists[index].loaded = true
    currentFrameIndex = index
}

function setTopInfo(number) {
  api.setFrameGroupAttr({
      name: 'group1',
      rect: {
           x: 0,
           y: 122,
           w: 'auto',
           h: api.winHeight-122-server.getFooterHeight()
      },
  });
    var $ = app.util;
    if(number == "noNet") {
      api.setFrameGroupAttr({
          name: 'group1',
          rect: {
               x: 0,
               y: 122,
               w: 'auto',
               h: api.winHeight-122-server.getFooterHeight()
          },
      });
      $("#tophint")[0].style.display = "none";
      $("#noNet")[0].style.display = "block";
      return;
    }
    if(number == 0) {
      $("#tophint")[0].innerHTML = i18n.t("it's_the_latest");
      $("#tophint")[0].style.color = "#B4B3B3";
    }else if(number == "clear") {
        $("#tophint")[0].innerHTML = " ";
    }else{
      $("#tophint")[0].innerHTML = "+" + number + " " + i18n.t("new_content");
      $("#tophint")[0].style.color = "#fec930";
    }
    setTimeout(function() {
        api.setFrameGroupAttr({
            name: 'group1',
            rect: {
                 x: 0,
                 y: 89,
                 w: 'auto',
                 h: api.winHeight-89-server.getFooterHeight()
            },
        });
      $("#tophint")[0].innerHTML = " ";
    }, 1500);
}
