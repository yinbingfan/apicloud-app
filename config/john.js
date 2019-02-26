
var config =
{
        host:"http://172.30.30.99:9080",
        controlSorket :"http://172.30.30.99:9080/",
        shareUrl : "http://172.30.30.99:9080/",
        imgHead : "https:",
        wikiPages : "https:",
        pushTest : "Test",
        source : "http://source.xxx.com",
        upload : "http://app.xxx.com/upload/",
        // pushTest: proEnv ? "" : "dev",                                                             //join
        // languageStr:"en_US",languageId: "77",countryId: "261",countryCode: "1",//美国 american
        // languageStr:"zh-CN",languageId: "261",countryId: "80",countryCode: "86",//中国
        // languageStr:"jp_JP",languageId: "152",countryId: "144",countryCode: "81",//日本 暗号化された通貨
        // languageStr:"ko_KR",languageId: "160",countryId: "152",countryCode: "82",//韩国 암호 해독 성
        // languageStr:"ru_RU",languageId: "204",countryId: "221",countryCode: "7",//俄罗斯 Блок цепь
        // 俄罗斯	+7
        // 白俄罗斯	+375
        // 乌克兰	+380
        // 摩尔多瓦	+373 
        // 哈萨克斯坦	+7
        // 塔吉克斯坦	+992
        // 吉尔吉斯斯坦	+996
        // 乌兹别克斯坦	+998
        // 土库曼斯坦	+993
        // 阿塞拜疆	+994
        // 格鲁吉亚	+995
        // 亚美尼亚	+374
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
    },
    plugin: {
        bdmap: {
            zoomLeval: 18
        }
    },
    project: { //自定义配置
        sid: 1
    }
}
module.exports=config
