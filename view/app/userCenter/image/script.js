var $;
var user;
var i18n;
var server;

define(function (require) {
  require('sdk/common');
  server = require('sdk/server');
  i18n = require('sdk/i18n');
  i18n.tran();

  // apiready = function() {
  //   imageClip();
  // }
  app.ready(function () {
    imageClip();
  })
})

//图像剪裁
function imageClip() {
	var pars = api.pageParam.pars;
	var FNImageClip = api.require('FNImageClip');
	FNImageClip.open({
		rect : {
			x : pars.x1,
			y : pars.y1,
			w : pars.w1,
			h : pars.h1
		},
		srcPath : pars.srcPath,
		style : {
			mask : 'rgba(0,0,0,.5)',
			clip : {
				w : pars.w2,
				h : pars.h2,
				x : pars.x2,
				y : pars.y2,
				borderColor : '#0f0',
				borderWidth : 1,
				appearance : 'rectangle'
			}
		},
		mode : 'image',
		fixedOn : api.frameName
	}, function(ret, err) {
		if (ret) {
			//					alert(json2str(ret));
		} else {
			console.log(json2str(err));
		}
	});
}

function imageSave() {
	var FNImageClip = api.require('FNImageClip');
	FNImageClip.save({
		destPath : api.pageParam.pars.srcPath,
		copyToAlbum : false,
		quality : 1
	}, function(ret, err) {
		if (ret) {
			api.execScript({
				name : api.pageParam.pars.wName,
				frameName : api.pageParam.pars.fName,
				script : 'savePic("'+ret.destPath+'");'
			});
			setTimeout(function() {
				closeClip();
			}, 200);
		} else {
			alert(JSON.stringify(err));
		}
	});
}

function closeClip() {
	var FNImageClip = api.require('FNImageClip');
	FNImageClip.close();
	setTimeout(function() {
		api.closeFrame({

		});

	}, 300);
}
