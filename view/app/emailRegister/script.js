let server,
    i18n
let languageId,countryId,countryCode;
let inviterId = "";
let openinstall;
define((require) => {

    require('sdk/vue.min');
    server = require('sdk/server');
    require('sdk/flexible');
    i18n = require('sdk/i18n')
    i18n.tran()

    var box = new Vue({
        el: '#app',
        data() {
            return {
                is_show: false,
                is_email: '',
                is_password: '',
                is_type: 'password',
                visible: false,
                is_show_button: true,
                time: null,
                is_btn: false,
                languageId:""
            }
        },
        computed: {
            empty() {
                const {is_email, is_password} = this
                return {
                    is_email,
                    is_password
                }
            }
        },
        mounted() {
         openinstall = api.require('openinstall');
            // 请求要请人ID
          openinstall.getInstall({
             timeout:20
          },function(ret, err){
            console.warn("AAAAAAAAAAAAAAAA"+JSON.stringify(ret));
            if(ret.data) {
              inviterId = JSON.parse(ret.data).uid
            }
          });
            var defaultCode = server.getCountryCode();

          var phoneCode = server.getCountryInfo();
          countryArray = JSON.parse(phoneCode);
          countryArray.forEach(function(item) {
              if (item.countryPhoneCode == defaultCode) {

                countryId = item.countryId;
                countryCode = item.countryPhoneCode;
                languageId = item.languageId;
                  // alert(this.languageId)
              }
          })
            // $(document).on('touchmove', function (e) {
            //     e.preventDefault();
            // })
            // 安卓手机实现仿ios右滑返回功能
              if (api.systemType == "android") {
                api.addEventListener({
                    name:'swiperight'
                }, function(ret, err){
                   api.closeWin({
                   });

                });
              }

        },
        watch: {
            empty(val) {
                if (val.is_email != '' && val.is_password != '') {
                    this.is_btn = true
                } else {
                    this.is_btn = false
                }
            },
        },
        filters: {},
        methods: {
            close() {
                // this.visible = false
            },
            confirm() {

                this.visible = false
                // api.closeToWin({name: 'userCenter'})
                if (api.pageParam.type == "airdrop"){                //从airdrop页登录,刷新页面数据
                  api.execScript({
                      name: 'airdrop',
                      frameName: 'airList',
                      script:  "reset()"
                  });
                }
                api.closeWin({
                    name: 'entry'
                });
                api.closeWin({
                    name: 'email'
                });
                api.closeWin({
                    name: 'emailRegister'
                });

                // if (api.pageParam.type == 1) {
                //     api.openWin({
                //         name: 'userCenter',
                //         url: '../userCenter/temp.html',
                //     });
                // }


            },
            submit() {
                if (this.is_email == '' || this.is_password == '') {
                    return api.toast({
                        msg: i18n.t('Email or password can not be empty'),
                        duration: 2000,
                        location: 'bottom'
                    })
                }
                let pattern = /^[a-zA-Z\d]{6,16}$/;
                if (!pattern.test(this.is_password)) {
                    return api.toast({
                        msg: i18n.t('The password must not be less than 6 characters or contain any special symbols'),
                        duration: 2000,
                        location: 'bottom'
                    })
                }
                let reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
                if (!reg.test(this.is_email)) {
                    return api.toast({
                        msg: i18n.t('Email format is incorrect'),
                        duration: 2000,
                        location: 'bottom'
                    })
                }
                let param = this.getUser();
                param.emailAddress = this.is_email;
                param.password = this.is_password;
                param.languageId = languageId;
                param.countryId = countryId;
                param.countryCode = countryCode;
                param.timeOffset = new Date().getTimezoneOffset();
                param.inviterId = inviterId;
                param.lang = server.getLanguageAABB().split('_')[0];

                server.ajax({
                    url: appcfg.host+'/v1/api/app/tp/registerByEmail.json',
                    method: 'post',
                    data: param,
                    success: (ret) => {

                        console.log("登陆界面，登陆ret——————————" + JSON.stringify(ret));

                        if (ret.code != 200) {
                            app.toast(ret.msg);
                            return;
                        }
                        openinstall.reportRegister(); //上报注册量
                        this.visible = true
                        let data = ret.data;

                        server.setToken(ret.data.token); //存储 token
                        server.setUser(ret.data.userInfo);
                        api.removePrefs({    //登录成功清除未登录时已读数据
                            key: 'newsReadArrayKey5'
                        });
                        app.publish("changeUserInfo", JSON.stringify(ret.data.userInfo));

                        api.execScript({
                            name: 'root',
                            script: 'restartWebSocket();'
                        });
                        api.execScript({                                                      //登陆成功，设置循环调用用户信息（me）
                            name: 'index',
                            frameName: 'member',
                            script: 'userInterval();'
                        });
                        // api.execScript({                                                      //刷新新闻缓存数据
                        //     name: 'index',
                        //     frameName: 'subNews',
                        //     script: 'getNewsList(1);'
                        // });
                        this.time = 60
                        this.is_show_button = false
                        let interval = setInterval(() => {
                            this.time += -1
                            if (this.time == 0) {
                                clearInterval(interval)
                                return this.is_show_button = true
                            }
                        }, 1000)

                    },
                    error: (err) => {
                        console.log(err)
                    }
                })
            },
            tab() {
                if (this.is_show == false) {
                    this.is_show = true
                    this.is_type = 'text'
                } else {
                    this.is_show = false
                    this.is_type = 'password'
                }
            },
            getUser() {
              var browser = {
                  versions: function() {
                      var u = navigator.userAgent,
                          app = navigator.appVersion;
                      return { //移动终端浏览器版本信息
                          trident: u.indexOf('Trident') > -1, //IE内核
                          presto: u.indexOf('Presto') > -1, //opera内核
                          webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                          gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                          mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
                          ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                          android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                          iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                          iPad: u.indexOf('iPad') > -1, //是否iPad
                          webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
                      };
                  }(),
                  language: (navigator.browserLanguage || navigator.language).toLowerCase()
              }
              console.log("浏览器内核" + JSON.stringify(browser));
              console.log("浏览器内核" + (browser));
              var param = {
                  utmSource: 0,
                  //来源渠道
                  lastOnlineDevice: api.deviceId,
                  //最后上线设备
                  lastOnlineIp: server.getIp(),
                  //最后上线ip
                  lastDeviceId: api.deviceId,
                  //主设备id，更新为最后上线设备ID
                  clientType: (api.systemType == "ios") ? 1 : 0,
                  lastDeviceType: api.uiMode,
                  //主设备类型，更新为最后上线设备
                  deviceUid: api.deviceId, //万一拿不到，new一个id
                  //如果拿不到，我们就给一个唯一id
                  deviceId: api.deviceId,
                  //设备id
                  deviceType: api.uiMode,
                  //Desktop,Console,EReader,MediaHub,Mobile,SmallScreen,SmartPhone,SmartWatch,Tablet,SmartTv, UnKnow

                  // deviceInfo
                  brand: api.deviceModel,
                  //品牌 ，sansang,xiaomi,huawei
                  platform: api.systemType,
                  //android,ios
                  platformVersion: api.systemVersion,
                  //版本 11.2, android 6
                  platformLanguage: navigator.language,
                  //系统语言
                  model: api.deviceModel,
                  //类型iPhone 5S	,iPhone 6S
                  browser: "WebKit",
                  //浏览器内核
                  screenWidth: api.screenWidth,
                  //屏幕宽
                  screenHeight: api.screenHeight,
                  //屏幕高
                  idfa: "",
                  advertisingID: "",
                  imei: api.deviceId,
                  deviceId: api.deviceId,
                  contentArea: server.getCountryId(),
                  countryName: server.getIpCountry(),
                  regionName: server.getRegionName(),
                  cityName: server.getCity(),
                  mobileBrand: api.deviceModel,
                  brand: api.deviceModel,
                  platform: api.systemType,
                  platformVersion: api.systemVersion,
                  systemLanguage: navigator.language,
                  model: api.deviceModel,
                  browser: "TODO",
                  uiLanguage: server.getUILanguageAABB()
              }
              console.log(JSON.stringify(param));
              return param;
            }
        }
    })
})
