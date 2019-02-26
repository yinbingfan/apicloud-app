let server,
    i18n

define((require) => {

    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n')
    i18n.tran()

    new Vue({
        el: '#app',
        data() {
            return {}
        },
        created() {
            api.openFrame({
                name: 'baidu',
                url: 'https://www.baidu.com/',
                progress: {
                    type: "page",
                    color: "#fec930"
                },
                rect: {
                    x: 0,
                    y: 45,
                    w: 'auto',
                    h: 'auto'
                },
                bounces: true,
                // useWKWebView: true
            });
        },
        mounted() {
        },
        filters: {},
        methods: {}
    })
})
