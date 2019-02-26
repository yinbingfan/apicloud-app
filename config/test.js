// 测试环境
var config =
{
    host: "https://apid.thedbit.com",
    controlSorket :"https://apid.thedbit.com/api/",
    shareUrl : "https://md.thedbit.com/",
    imgHead : "https:",
    wikiPages : "https:",
    pushTest : "Test",
    source : "http://source.xxx.com",
    upload : "http://app.xxx.com/upload/",
    set: {
        version: "",
        outime: 10000,
        longtime: 20000,
        windowAnimate: "none",
        animateSubType: "from_right",
        animateDuration: 300,
        bgColor: "#ffffff",
        safeStorage: "user,appInit,rights",
        temporary: "templateCache,gps"
    },
    //FIXME 这个用的比较少可以选择删除
    ajax: {
        type: "get",
        crypto: {
            enable: false,
            url: ""
        }
    },
    loading: {
        text: "正在加载",
        title: "",
        anim: "fade"
    },
    pull: {
        bgColor: "#ffffff",
        // bgColor: "#eef1f6",
        loadAnimInterval: 10,
        isScale: true,
        image: {
            pull: [
                "widget://res/img/pull_00000.png",
                "widget://res/img/pull_00001.png",
                "widget://res/img/pull_00002.png",
                "widget://res/img/pull_00003.png",
                "widget://res/img/pull_00004.png",
                "widget://res/img/pull_00005.png",
                "widget://res/img/pull_00006.png",
                "widget://res/img/pull_00007.png",
                "widget://res/img/pull_00008.png",
                "widget://res/img/pull_00009.png",
                "widget://res/img/pull_00010.png",
                "widget://res/img/pull_00011.png",
                "widget://res/img/pull_00012.png",
                "widget://res/img/pull_00013.png",
                "widget://res/img/pull_00014.png",
                "widget://res/img/pull_00015.png",
                "widget://res/img/pull_00016.png",
                "widget://res/img/pull_00017.png",
                "widget://res/img/pull_00018.png",
                "widget://res/img/pull_00019.png",
                "widget://res/img/pull_00020.png"
            ],
            load: [
                "widget://res/img/pull_00000.png",
                "widget://res/img/pull_00001.png",
                "widget://res/img/pull_00002.png",
                "widget://res/img/pull_00003.png",
                "widget://res/img/pull_00004.png",
                "widget://res/img/pull_00005.png",
                "widget://res/img/pull_00006.png",
                "widget://res/img/pull_00007.png",
                "widget://res/img/pull_00008.png",
                "widget://res/img/pull_00009.png",
                "widget://res/img/pull_00010.png",
                "widget://res/img/pull_00011.png",
                "widget://res/img/pull_00012.png",
                "widget://res/img/pull_00013.png",
                "widget://res/img/pull_00014.png",
                "widget://res/img/pull_00015.png",
                "widget://res/img/pull_00016.png",
                "widget://res/img/pull_00017.png",
                "widget://res/img/pull_00018.png",
                "widget://res/img/pull_00019.png",
                "widget://res/img/pull_00020.png"
            ]
        }
    }
}
module.exports=config
