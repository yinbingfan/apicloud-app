var server;
var initCountryId = "";
var countryId = "";
var countryPhoneCode = "";
var languageId = "";
var languageCode = "";

define(function(require) {
    require('sdk/common');
    server = require('sdk/server');
    var i18n = require('sdk/i18n');
    i18n.tran();

    var type; //0:location 1:countryPhoneCode
    var selectePhoneCode;
    var pageName;
    var lv;
    var lvSideBar;
    var countryArray;
    var indicatorList = [];
    var height = 0;

    app.ready(function() {
      // 安卓手机实现仿ios右滑返回功能
      if (api.systemType == "android") {
        api.addEventListener({
            name:'swiperight'
        }, function(ret, err){
           api.closeWin({
           });

        });
      }
        type = api.pageParam.type
        if (type == 0) {
            $('#confirm')[0].style.display = "inline-block"
        }
        pageName = api.pageParam.pageName
        selectePhoneCode = api.pageParam.selectePhoneCode
        lv = $('#lv_container')[0];
        lvSideBar = $('#side_nav_bar')[0];

        var phoneCode = server.getCountryInfo();
        countryArray = JSON.parse(phoneCode);
        countryArray.sort((a, b) => a.enUsName.localeCompare(b.enUsName, server.getLanguageAABB().substring(0, 2), {
            sensitivity: 'accent'
        }))
          console.log(JSON.stringify(countryArray))
        // 遍历列表，加载数据
        countryArray.forEach(function(item, index) {
            if (index == 0 || item.enUsName.substring(0, 1) != countryArray[index - 1].enUsName.substring(0, 1)) { //和上一条的首字母不一样
                var liIndicator = document.createElement("div"); //首字母标题
                liIndicator.className = "li_indicator";
                liIndicator.id = "li_indicator";
                var code = document.createElement("div");
                code.innerHTML = item.enUsName.substring(0, 1);
                liIndicator.appendChild(code);
                liIndicator.setAttribute("indicator", item.enUsName.substring(0, 1));
                lv.appendChild(liIndicator);

                var code = document.createElement("li"); //侧边栏
                code.innerHTML = item.enUsName.substring(0, 1);
                lvSideBar.appendChild(code); //侧边栏

            }
            var li = document.createElement("div"); //item
            initCountryId = server.getCountryId();
            if (type == 0 && server.getCountryId() == item.countryId) {
                li.className = "li_selected";
            }
            //  else if(type ==1 && selectePhoneCode == item.countryPhoneCode){
            //     li.className = "li_selected";
            // }
            else {
                li.className = "li";
            }
            console.log(countryArray.length);
            if (index == countryArray.length - 1 || item.enUsName.substring(0, 1) != countryArray[index + 1].enUsName.substring(0, 1)) { //和下一条的首字母不一样
                li.style.borderBottom = "0px"
            }
            li.setAttribute("languageCode", item.languageCode + "-" + item.countryCode);
            li.setAttribute("languageId", item.languageId);
            li.setAttribute("countryId", item.countryId);
            li.setAttribute("countryPhoneCode", item.countryPhoneCode);

            if (type == 0) {
                //国旗图片
                // // var $h1=$(“<h1></h1>”);
                // var $img = $("<div></div>");;
                // // var img = document.createElement("div");
                // $img.className = "country_img flag flag-" + item.countryCode.toLowerCase();
                // console.log(JSON.stringify($img.attr("style")));
                // li.appendChild($img);

                // var $h1=$(“<h1></h1>”);
                var $img = $("<div></div>");
                $img.attr("class", "country_img flag flag-" + item.countryCode.toLowerCase());
                // console.log(JSON.stringify($('#lv_container').css("background-size")));
                li.appendChild($img[0]);
                // console.log(JSON.stringify($(img).css("background-position")));

                //已选项
                var imgSel = document.createElement("img");
                imgSel.className = "country_selected";
                imgSel.src = "../../../res/img/ic_selected@3x.png";
                li.appendChild(imgSel);
            }
            if (type == 1) {
                //电话号码前缀
                var phoneCode = document.createElement("div");
                phoneCode.className = "country_phone_code";
                phoneCode.innerHTML = "+" + item.countryPhoneCode;
                li.appendChild(phoneCode);
            }
          //国家英文名字(非英语语言情况下)

             var enName = document.createElement("div");
             enName.className = "country_name";
             enName.innerHTML = item.enUsName+"&nbsp;&nbsp";
             li.appendChild(enName);

          //选择语言的名字
           if(server.getUILanguageAABB().substring(0, 2)!="en"){
                var countryName = document.createElement("div");
                countryName.className = "country_name newColor";
                countryName.innerHTML = item.localeCountryName;
            li.appendChild(countryName);
            }
            lv.appendChild(li)
        })
        $(".flag").each(function() {
            var x = parseInt($(this).css("background-position-x")) / 1.411;
            var y = parseInt($(this).css("background-position-y")) / 1.411;
            $(this).css("background-position-x", x + "px");
            $(this).css("background-position-y", y + "px");

        });

        var li = document.createElement("div");
        li.style.height = "4.4rem";
        lv.appendChild(li)
        indicatorList = $('#side_nav_bar *');
        //快速定位位置
        $('#side_nav_bar *').on("touchstart", function(event) {
            // console.log("touchstart");
            console.log(this.innerHTML + "______________________________");
            var code = this.innerHTML;
            var top;
            top = $('#lv_container > [indicator=' + code + ']').offset().top;
            var top1 = $('#lv_container > [indicator=' + countryArray[0].enUsName.substring(0, 1) + ']').offset().top;
            height = top - top1;
            console.log(top);
            $('#lv_container').scrollTo(height, 500);
            console.log(height);
        });
        $('#side_nav_bar *').on("touchmove", function(event) {
            event.preventDefault();
            console.log(JSON.stringify(event));
            if (window.Touch || window.TouchEvent || window.TouchList) {
                console.log(window.Touch);
                console.log(window.TouchEvent);
                console.log(window.TouchList);
            }
        })

        //点击列表选择语言或电话号码
        $('.li').on("click", function(event, index) {
            console.log(this.getAttribute("languageId"));
            console.log(this.getAttribute("countryId"));
            console.log(this.getAttribute("countryPhoneCode"));
            console.log(this.getAttribute("languageCode"));
            countryId = this.getAttribute("countryId");
            countryPhoneCode = this.getAttribute("countryPhoneCode");
            languageId = this.getAttribute("languageId");
            languageCode = this.getAttribute("languageCode");

            if ($('.li_selected')[0]) {
                $('.li_selected')[0].className = "li";
            }
            if (type == 0) {
                this.className = "li_selected";
            } else {
                console.log("............");
                var script = '$("#country-code")[0].innerHTML="' + this.getAttribute("countryPhoneCode") + '";';
                script = script + "countryId = " + this.getAttribute("countryId") + ";";
                script = script + "languageId = " + this.getAttribute("languageId") + ";";
                script = script + "countryCode = " + this.getAttribute("countryPhoneCode") + ";";

                /*
                countryId = countryArray[ret.buttonIndex-1].countryId;
                languageId = countryArray[ret.buttonIndex-1].languageId;
                countryCode = countryArray[ret.buttonIndex-1].countryPhoneCode;
                */
                console.log(pageName);
                api.execScript({
                    name: pageName,
                    script: script
                });
                api.closeWin();

            }
        });

    });
});
//点击确认，修改存储信息，重启app
function fnConfirm() {
    console.log("countryId " + countryId);
    console.log("initCountryId " + initCountryId);
    if (!server.isBlank(countryId) && countryId != initCountryId) {
        server.setSelectedCountryId(countryId);
        server.setSelectedCountryCode(countryPhoneCode);
        server.setSelectedLanguageId(languageId);
        server.setSelectedLanguageAABB(languageCode);
        setTimeout(function() {
          api.execScript({
              // name: 'index',
              // frameName: 'market',
              name: 'root',
              script: 'closeWebsocket();'
          });
            api.setPrefs({
                key: 'rebootApp',
                value: '1'
            });
            api.rebootApp();
        }, 100)
    } else {
        api.closeWin();
    }
}
