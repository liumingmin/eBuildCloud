// require imageBrowser UIMediaScanner imageFilter
(function(window){

	var imageApi = {
	};

	imageApi.defaultTpl = '<div class="aui-col-xs-4 image-item">'
			+'<img id="{{imageId}}" src="{{imageUrl}}" class="notes-image">'

	+'</div>';

	imageApi.updateTpl = '<div class=" image-item"><img id="{{imageId}}" src="{{imageUrl}}" /></div>';


	imageApi.getFileExt =  function(fileName) {
        return fileName.substring(fileName.lastIndexOf('.') + 1);
	}

	imageApi.getGlobleImageUrl =  function(ownerId,pictureId) {
		if(pictureId && pictureId!=""){
			return 'http://'+TServerInfo.getHostUrl()+"/images/"+"globe"+"/"+ownerId+"/"+pictureId+".jpg?w=400&h=400";
		}
		return "";
	}

	imageApi.getImageUrl =  function(ownerId,pictureId) {
		if(pictureId && pictureId!=""){
			return 'http://'+TServerInfo.getHostUrl()+"/images/"+TServerInfo.getProjectId()+"/"+ownerId+"/"+pictureId+".jpg?w=200&h=200";
		}
		return "";
	}

		imageApi.getImageInfo =  function(imageId,url,ownerId) {
			return {"ItemId":imageId,"OwnerId":ownerId,"FileName":this.getImageName(url),"File":url}
		}

		imageApi.getImageName =  function(filePath) {
	        return filePath.substring(filePath.lastIndexOf('/') + 1);
		}

	imageApi.fastSelectImage =  function(options,nodeId,isAdd){
		var _this = this;

		_this.selectImage(options,function(imgUrl){
			if(!imgUrl)
				return;

			var render = template.compile(_this.defaultTpl);

			var imgUrls = [];
			if(imgUrl instanceof Array){
				imgUrls = imgUrl;
			}else{
				imgUrls.push(imgUrl);
			}

			if(isAdd){
				for (var i = 0; i < imgUrls.length; i++) {
	        		var selectImg = imgUrls[i];
	        		var guid = GetUuid();

					var showImgHtml = render({imageId:guid,imageUrl:selectImg});

	            	$("#"+nodeId).before(showImgHtml);

	            	_this.addImagePress(document.getElementById(guid));
	        	}
			}else{
				if(imgUrls.length > 0){
					var updateRender = template.compile(_this.updateTpl);
					var showImgHtml =updateRender({imageId:GetUuid(),imageUrl:imgUrls[0]});
					$("#"+nodeId).html(showImgHtml);
				}
			}

		});
	}

	imageApi.selectImage =  function(options,callback){
		var _this = this;
		api.actionSheet({
	                    title : '选择图片来源',
	                    buttons : ['拍照', '相册']
	            }, function(ret, err) {
	                    var index = ret.buttonIndex;
	                    switch(index) {
	                    	 case 1:  _this.imageFromCam(options,callback);break;
	                    	 case 2:  _this.imageFromMedia(options,callback);break;
	                    }
	            });
	}

	imageApi.imageFromCam =  function(options,callback){
		var _this = this;

		api.getPicture({
	            sourceType : "camera",
	            encodingType : "jpg",
	            destinationType : "url",
	            mediaValue : "pic",
	            quality : 50,
	            saveToPhotoAlbum : true
	    }, function(ret, err) {
	        if (ret && ret.data) {
	                // 拍照返回的本地路径
	            var returnUrl = ret.data;

	            _this.imgCompress(returnUrl, 0.5, 0.5, _this.getFileExt(returnUrl), function(compressImg) {
	                if(callback)
	                	callback(compressImg);
	            });
	        } else {
	            api.toast({
				      msg : '选择出错'+err,
						duration : 2000,
						location : 'bottom'
				    });
	        }
	    });
	}


	imageApi.imageFromMedia =  function(options,callback){//tplId,nodeId,flag
		var _this = this;
		var uiMediaScanner = api.require('UIMediaScanner');
		uiMediaScanner.open({
	        type : 'picture',
	        column : 4,
	        classify : true,
	        max : 6,
	        sort : {
	                key : 'time',
	                order : 'desc'
	        },
	        texts : {
	                stateText : '已选*项',
	                cancelText : '取消',
	                finishText : '完成'
	        },
	        styles : {
	                bg : '#fff',
	                mark : {
	                        icon : '',
	                        position : 'bottom_left',
	                        size : 20
	                },
	                nav : {
	                        bg : '#0066ff',
	                        stateColor : '#fff',
	                        stateSize : 18,
	                        cancelBg : 'rgba(0,0,0,0)',
	                        cancelColor : '#fff',
	                        cancelSize : 18,
	                        finishBg : 'rgba(0,0,0,0)',
	                        finishColor : '#fff',
	                        finishSize : 18
	                }
	        }
	    }, function(ret) {
	        if (ret && ret.list) {
	        	var cImageUrls = [];
	        	for (var i = 0; i < ret.list.length; i++) {
            		var selectImg = ret.list[i];
            		_this.imgCompress(selectImg.path, 0.5, 0.5, _this.getFileExt(selectImg.path), function(compressImg) {
                		cImageUrls.push(compressImg);

                		if(cImageUrls.length == ret.list.length){
                			if(callback)
                				callback(cImageUrls);
                		}
		            });
                }
	        }
	    });
	}

	imageApi.openImageBrowser = function (imgs) {
		 for(var i=0;i<imgs.length;++i){
			 var item = imgs[i];
			 if(item.indexOf(TServerInfo.getHostUrl()) >=0){
				 		imgs[i] = item.sliceWith("?");
			 }
		 }
		var imageBrowser = api.require("imageBrowser");
        imageBrowser.openImages({
                imageUrls : imgs,
                showList : false,
                activeIndex : 0
        });
	}

	imageApi.addImagePress = function(obj) {
		var _this = this;
        // 获取目前长按的对象
        var hammertime = new Hammer(obj);
        // 绑定长按对象
        hammertime.on("press", function(e) {
                api.confirm({
                        title : '温馨提示',
                        msg : '您确定要删除该图片吗？',
                        buttons : [ '取消', '确定']
                }, function(ret, err) {
                        if (ret.buttonIndex == 2) {
                                // 移除自己
                                $(obj).parent().remove();
                                api.toast({
                                        msg : '删除成功！'
                                });
                        }
                });
        });

        hammertime.on("tap", function(e) {
        	_this.openImageBrowser([obj.src]);
        });

	}

	// 图片压缩
	// imgsrc：源图片的路径
	// quality：图片压缩质量，一般建议0.5
	// scale：图片压缩比例，也是建议0.5
	// ext：源图片拓展名
	// callback：转换成功之后回调函数
	imageApi.imgCompress = function(imgsrc, quality, scale, ext, callback) {
	        // 压缩文件的保存目录
	        var savePath = api.cacheDir + "/" + new Date().Format("yyyy-MM-dd") + "/";
	        // 压缩文件生成的随机文件名称
	        var savename = GetUuid() + "." + ext;
	        var imageFilter = api.require("imageFilter");
	        imageFilter.compress({
	                img : imgsrc,
	                quality : quality,
	                scale : quality,
	                save : {
	                        album : false,
	                        imgPath : savePath,
	                        imgName : savename
	                }
	        }, function(ret, err) {
	                if (ret) {
	                        callback(savePath + savename);
	                } else {
	                        //alert(JSON.stringify(err));
	                }
	        });
	}

    window.ImageApi = imageApi;

})(window);
