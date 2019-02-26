/**
 *
 */
 var i18n;
 var server;

define(function(require) {
	app.ready(function() {
    server = require('sdk/server');
    i18n = require('sdk/i18n');
    i18n.tran();
    require('sdk/common');
    // var $ = app.util;
    require('sdk/common');
    var listPlaceholder = server.commonTemp('errorPage', {
      text:i18n.t('error')
    });
    $('#view')[0].innerHTML = listPlaceholder;
    $("#goBack").html(i18n.t('clickBack'))
  });
});
