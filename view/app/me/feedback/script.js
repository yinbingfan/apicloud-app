/**
 * member
 */
var server, i18n ;
define(function(require) {
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    $("#text").attr("placeholder", i18n.t("Describe your experience here…"))
    $("#Email").attr("placeholder", i18n.t("Email address (optional)"))

    // console.log(JSON.stringify(api));
    // if(!server.isBlank(api.pageParam.email)){
    //     $("#Email").val(api.pageParam.email.emailAddress);
    //
    // }

    $("input[name='emoji']").on("click", function() {
        $("input[name='emoji']").removeAttr("checked")
        $(this).attr("checked", "")
    })

    $("input[name='feedback'][checked='checked']").next().css("color", "#FEC930")
    $("input[name='feedback']").on("click", function() {
        $("input[name='feedback']").removeAttr("checked")
        $(this).attr("checked", "")
        $("input[name='feedback']").next().css("color", "#B4B3B3")
        $(this).next().css("color", "#FEC930")
    })



    $("#text").bind("input propertychange",function(){
        var tes= $("#text").val().length;
        $('#remaining').val(200 - tes)
       var  remaining = 200 - tes;
        if( remaining==0){
            return false
        }
    })
    console.log(JSON.stringify(server.getUser().email));
    // alert(JSON.stringify(server.getUser()))
    if(server.getUser().email!=undefined||server.getUser().email!=null){
        $('#Email').val(server.getUser().email.emailAddress)

    }else {
        $('#Email').val()
    }

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


//提交意见反馈
function submit() {
    var questionDetail = "";
    console.log($('textarea').val());
    if (server.isBlank($('textarea').val())) {
        app.toast(i18n.t('Describe your experience here…'))
        return
    } else {
        questionDetail = $('textarea').val()
    }

    if($('#Email').val()!=''){
        let reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
        if (!reg.test($('#Email').val())) {
            $('#Email').val('')
            return api.toast({
                msg: i18n.t('Email format is incorrect'),
                duration: 2000,
                location: 'bottom'
            })
        }

    }

    var mood = $("[name='emoji'][checked]").attr("index");

    var questionType = $("[name='feedback'][checked]").attr("index");

    var deviceType = 0;
    if (api.systemType == "ios") {
        deviceType = 1;
    }

    var param = {
        languageId: server.getLanguageId(),
        countryId: server.getCountryId(),
        deviceId: api.deviceId,
        deviceType: api.uiMode,
        mood: mood,
        questionType: questionType,
        questionDetail: questionDetail
    }

    if (!server.isBlank($('#Email').val())) {
        param.email = $('#Email').val()
    }
    // var $item = $('#Email').val();
    // if (!isEmail($item)) {
    //     app.toast(i18n.t('Email_format_is_incorrect'));
    //     $('#Email').val('');
    //     return;
    // }
    //登陆状态：1.手机号登陆显示手机号，否则“” 2.用户名：有则显示用户名否则显示手机或者邮箱
    if (server.getUser()) {
       if(server.getUser().phoneCode){
           param.phoneNo = server.getUser().countryCode + server.getUser().phoneCode
       }else{
           param.phoneNo = ""
       }

        param.userId = server.getUser().userId
      if( server.getUser().userName){
          param.userName = server.getUser().userName    //意见反馈向后台传用户名
      }else{
         if(server.getUser().phoneCode){
            param.userName = server.getUser().phoneCode
         }else if( server.getUser().email) {
            param.userName = server.getUser().email.emailAddress
         }
      }

    }

    var url = appcfg.host+'/v1/api/app/user/saveUserFeedback.json'
    server.ajax({
        url: url,
        data: param,
        success: function(ret) {
            console.log(JSON.stringify(ret));
            app.toast(i18n.t('Thanks for the feedback, we will deal with it in time!'),3000);
            // api.closeWin();
            setTimeout(function () {
                api.closeWin();
            },3000)

        },
        error: function(err) {
            console.log(JSON.stringify(err));
            // app.toast(err.body.msg)
        }
    })
}
//判断邮箱格式
function isEmail(str) {
    return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/i.test(str)
}
