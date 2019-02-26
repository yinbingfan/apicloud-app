/*
 * layout
 */
// define(function(require) {
apiready = function() {
        console.log("🔥app.ready");
        api.setRefreshHeaderInfo({
            loadingImg: 'widget://res/img/pull_00000.png',
            bgColor: '#ccc',
            textColor: '#fff',
            textDown: '下拉刷新...',
            textUp: '松开刷新...'
        }, function(ret, err) {
          console.log("🔥app.ready");
          console.log(JSON.stringify(ret));
          console.log(JSON.stringify(err));
            //在这里从服务器加载数据，加载完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
            // api.refreshHeaderLoading();
            setTimeout("api.refreshHeaderLoadDone()",2000)


        });
        setTimeout("api.refreshHeaderLoading()",2000)
        // api.refreshHeaderLoading();
        console.log("🔥app.ready");

    }
    // app.ready(function() {
    //   console.log("🔥app.ready");
    //   app.pull.init(loadData());
    //   api.refreshHeaderLoading();
    // });

function loadData() {
    console.log("🔥loadData");
}
// });
