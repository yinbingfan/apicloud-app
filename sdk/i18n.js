/*
 * 国际化处理封装js
 * 使用前需要引入：
 *    jquery
 *    jquery.i18n.properties-1.0.9.js（此页面源码修改过）
 * 使用时在页面引入此js文件，然后调用i8n.tran()
 * date: 2018-05-30
 */

define(function(require, exports, module) {

    var translate = function() { //加载成功后设置显示内容
        $('* [i18n]').each(function(i, e) {
            var key = $(this).attr("i18n");
            key = key.toLowerCase();
            $(this).text($.i18n.prop(key));
            $(this).attr('placeholder', $.i18n.prop(key));
        })
    }
    var _tran = function loadProperties() {
        var language = _getUILanguageAABB();
        jQuery.i18n.properties({ //加载资浏览器语言对应的资源文件
            name: 'strings', //资源文件名称
            language: language,
            path: 'widget://res/i18n/', //资源文件路径
            mode: 'map', //用Map的方式使用资源文件中的值
            callback: translate
        });
    }

    var _get = function(key) {
        key = key.toLowerCase();
        return $.i18n.prop(key);
    };
    //同server.js中的方法
    var _getUILanguageAABB = function(l) {
        var lang;
        lang = api.getPrefs({
            key: 'SelectedUILanguage',
            sync: true
        });
        if (_isBlank(lang)) {
            lang = api.getPrefs({
                key: 'UILanguage',
                sync: true
            });
        }
        if (_isBlank(lang)) {
            lang = navigator.language;
        }
        return lang;
    }

    var _isBlank = function(obj) {
        if (obj == undefined || obj == null || obj.length == 0 || obj == '') {
            return true;
        } else {
            return false;
        }
    }

    module.exports = {
      //读取页面中的元素，将包含i8n属性的元素值翻译为i8n属性的key i18n.tran()
        tran: _tran,
        //翻译一段字符串，如i18n.t('home') 中文结果为 首页
        t: _get
    };
});
