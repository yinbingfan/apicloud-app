简介：
基于APICloud平台（https://www.apicloud.com）
框架部分套用了HybridStart项目（https://refined-x.com/HybridStart）
开发项目时从gitlab或apicloud平台上检出代码仓库

项目目录：
|-- error/ //APP错误页
|-- res/ //APP静态资源
|--sdk/
| |-- modules/ //js插件
| |-- font/ //字体图标
| |-- core.js //核心库
| |-- server.js //业务方法
| |-- common.js //页面公用代码
| |-- ui.css //默认UI
| |-- jquery.i18n.properties-1.0.9.js //国际化引用库，修改了读取文件部分源码
| |-- i18n.js //国际化通用方法

|-- view/ //APP页面
| |-- about //关于我们页面
| |-- addCurrency //
| |-- assets //资产
| |-- briefList //快讯列表
| |-- briefMain //快讯和twitter的父页面
| |-- change //新闻详情页修改字号大小弹窗
| |-- coinDetail //货币详情页面
| |-- currencyDetail
| |-- detailPage2 //新闻详情页
| |-- editCurrency //
| |-- favorite // 收藏页面
| |-- history // 历史页面
| |-- index // 底部导航主页面
| |-- location // 选择地区
| |-- login // 登录
| |-- market // 行情信息页面（顶部tabBar）
| |-- marketContainer // 行情和资产的父页面
| |-- marketEdit // 编辑自选的父页面
| |-- marketList // 行情列表
| |-- marketListEdit // 编辑自选的列表
| |-- me // 我的
| |-- newsListWithBanner // 新闻列表
| |-- notificatoin // 设置通知页面
| |-- registerA // 注册第一步
| |-- registerB // 注册第二步
| |-- searchCurrency // 搜索货币
| |-- searchExchange // 搜索交易所
| |-- selectCurrency // 选择货币
| |-- subNews // 新闻子页面（新闻顶部栏目）
| |-- template // 模板页面，开发新页面可直接复制一份
| |-- test //
| |-- test1 //
| |-- twitter // 推特
| |-- userCenter // 个人中心

|-- config.js //HybridStart配置
|-- config.xml //APICloud配置 详情参考config.xml应用配置说明

方法说明：
Sdk/Server.js中有常用的方法如获取用户信息，封装的ajax网络请求，判断是否为空等
Api.* 为apicloud平台方法，文档（https://docs.apicloud.com/Client-API/api）
App.* 为HybridStart封装方法，可在sdk/core.js中查看源码或查看文档（https://refined-x.com/HybridStart/docs/#sdk-core）

打包流程：
修改config.js中的环境配置proEnv=true/false
git提交后，选择同步代码到云端
apicloud控制台中检查ios证书（android不用进行更换）
内部测试包，选择（develop.mobileprovision）
发布到应用商店包，选择（Dbit_profile.mobileprovision）
云编译中配置版本号等信息，进行编译

推送相关：
方法思路参考APICloud官方文档 https://docs.apicloud.com/Client-API/Open-SDK/googlePush
主要在root页面scripty.js中初始化
在notificatoin页面设置是否开启推送，本地setPrefs字段保存是否推送
