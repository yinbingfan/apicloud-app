var $;
var i18n;
var server;
define(function(require) {
    server = require('sdk/server');
    require('sdk/common');
    i18n = require('sdk/i18n');
    i18n.tran();

});
//点击性别
function fnClickGender() {
  $('#gender')[0].focus();
    api.actionSheet({
        title: i18n.t("gender"),
        cancelTitle: i18n.t("cancel"),
        // destructiveTitle: '红色警告按钮',
        buttons: [i18n.t("male"), i18n.t("female")]
    }, function(ret, err) {
        if (ret) {
            if (ret.buttonIndex == 1) {
                $('#gender')[0].innerHTML = i18n.t("male");
                $('#gender')[0].className = "line";
            } else if (ret.buttonIndex == 2) {
                $("#gender")[0].innerHTML = i18n.t("female");
                $('#gender')[0].className = "line";
            }
            check();
        } else {
            // alert(JSON.stringify(err));
        }
    });
}
//生日
function fnClickBirthday() {
    var a = $('#birthday')[0].innerHTML.trim();
    console.log(a + "+++++++");
    if (server.isBlank(a)|| a==i18n.t("birthday")) {
        a = "1990-1-1"
    }
    api.openPicker({
        type: 'date',
        date: a,
        title: i18n.t("birthday")
    }, function(ret, err) {
        if (ret) {
            $('#birthday')[0].innerHTML = ret.year + "-" + ret.month + "-" + ret.day;
            $('#birthday')[0].className = "line";
            check();
        } else {
            // alert(JSON.stringify(err));
        }
    });
}

var SMSTimer
var countdown;

function clock() {
    var ele = $("#request-code")[0];
    console.log(ele.innerHTML);
    if (ele.innerHTML == "request") {
        countdown = 60;
        ele.innerHTML = countdown + "s";
        console.log("request");
    } else if (ele.innerHTML == "0s") {
        console.log("0s");
        ele.innerHTML = "request";
        window.clearInterval(SMSTimer);
    } else {
        console.log(countdown + "s");
        countdown = countdown - 1;
        ele.innerHTML = countdown + "s";
    }
}

function fnClickRequest() {
    app.toast('SMS captcha sended!');
    SMSTimer = window.setInterval("clock()", 1000);

}

function t() {
    app.toast('Please enter your information');
}
//完成，跳到下一步
function fnClickComplete() {
    //判断昵称、性别、生日、手机号、验证码是否填写完整
    console.log($("#nickname")[0].value);
    if (!$("#nickname")[0].value || $("#gender")[0].innerHTML == "Gender" || $("#birthday")[0].innerHTML == "Birthday") {
        return;
    }
    if (!server.isBlank(($("#email")[0].value))) {
        if (!isEmail($("#email")[0].value)) {
            app.toast(i18n.t('Email_format_is_incorrect'));
            return;
        }
    }
    var gender;
    if ($("#gender")[0].innerHTML == i18n.t("male")) {
        gender = "male";
    } else {
        gender = "female";
    }
    api.openWin({
        name: 'registerStepB',
        url: '../registerStepB/temp.html',
        pageParam: {
            userName: $("#nickname")[0].value,
            gender: gender,
            dateOfBirth: $("#birthday")[0].innerHTML,
            email: $("#email")[0].value
        }
    });

}
//点击登录
function fnClickLogin() {
    api.openWin({
        name: 'login',
        url: '../login/temp.html',
        pageParam: {}
    });
}
//检查输入输入正确
function check(event) {
    console.log(event);
    console.log($("#complete")[0].classList + "");
    if (!$("#nickname")[0].value || $("#gender")[0].innerHTML == i18n.t("gender") || $("#birthday")[0].innerHTML == i18n.t("birthday")) {
        $("#complete")[0].classList.remove("enable");
    } else {
        $("#complete")[0].classList.add("enable");
    }
}
//检查输入输入正确
function check() {
    console.log($("#complete")[0].classList + "");
    if (!$("#nickname")[0].value || $("#gender")[0].innerHTML == i18n.t("gender") || $("#birthday")[0].innerHTML == i18n.t("birthday")) {
        $("#complete")[0].classList.remove("enable");
    } else {
        $("#complete")[0].classList.add("enable");
    }
}
//判断邮箱格式
function isEmail(str) {
    return /^(\w+)(\.\w+)*@(\w+)(\.\w+)*.(\w+)$/i.test(str)
}
