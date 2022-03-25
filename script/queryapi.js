function EntityBatchOp(modelName,dataUpdateColumn,dataDeleteColumn){
	this.ModelName=modelName;
	this.CreateEntities=[];
	this.UpdateEntities=[];
	this.DataUpdateColumn = "";
	this.DataDeleteColumn= "";

	this.DeleteByIds=[];
	this.DeleteByFields=[];

	if(dataUpdateColumn)
		this.DataUpdateColumn=dataUpdateColumn;

	if(dataDeleteColumn)
		this.DataDeleteColumn=dataDeleteColumn;
}

EntityBatchOp.prototype.addEntity=function(entity){
	this.CreateEntities.push(entity);
}

EntityBatchOp.prototype.addEntities=function(entities){
	for(var i=0;i<entities.length;++i){
		this.CreateEntities.push(entities[i]);
	}
}

EntityBatchOp.prototype.updateEntity=function(entity){
	this.UpdateEntities.push(entity);
}

EntityBatchOp.prototype.updateEntities=function(entities){
	for(var i=0;i<entities.length;++i){
		this.UpdateEntities.push(entities[i]);
	}
}

EntityBatchOp.prototype.deleteById=function(id){
	this.DeleteByIds.push(id);
}

EntityBatchOp.prototype.deleteByIds=function(ids){
	for(var i=0;i<ids.length;++i){
		this.DeleteByIds.push(ids[i]);
	}
}

EntityBatchOp.prototype.deleteByField=function(id){
	this.DeleteByFields.push(id);
}

EntityBatchOp.prototype.deleteByFields=function(ids){
	for(var i=0;i<ids.length;++i){
		this.DeleteByFields.push(ids[i]);
	}
}

function CreateAttachEntBatchOp(){
	return new EntityBatchOp("Attachment","","FileId");
}

(function(window){

	var ajaxApi = {
	};

	var noProjectCacheModels = ["Project","ProjectJoinRequest","ProjectUserLink","ProjectUserTag","AppRedPoint","AppNotify",
					"Attachment","SysUser"];

	ajaxApi.getFileName =  function(filePath) {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
	}

	ajaxApi.ping = function(){
		api.ajax({
			url:'http://'+TServerInfo.getHostUrl(),
			method:'get',
			cache: false,
			timeout: 3,
			dataType: 'json'
		},function(ret,err){
			if(err.statusCode == 0){
				alert("无法连接服务器!");
				// api.closeWidget({
				// 				id: 'A6078652148122',
				// 				retData: {name:'closeWidget'},
				// 				silent:true
				// 		});
			}
		});
	}

	ajaxApi.getRcToken = function(callback){
		api.ajax({
			url:'http://'+TServerInfo.getHostUrl()+"/rcToken",
			method:'get',
			cache: false,
			timeout: 3,
			dataType: 'json'
		},function(ret,err){
			if (ret) {
		  	if(ret.Code == 0){
						callback(ret.Content);
				}
			}else{
				api.toast({
			      msg : ('错误码：'+err.code+';错误信息：'
					+err.msg+';网络状态码：'+err.statusCode),
					duration : 2000,
					location : 'bottom'
			    });
			}
		});
	}

	ajaxApi.getdate = function(callback){
		api.ajax({
			url:'http://'+TServerInfo.getHostUrl()+"/date",
			method:'get',
			cache: false,
			timeout: 3,
			dataType: 'json'
		},function(ret,err){
			if (ret) {
		  	if(ret.Code == 0){
						callback(ret.Content);
				}else{
					api.toast({
						msg : ('错误码：'+ret.Code+'；错误信息：'
						+ret.Msg),
						duration : 2000,
						location : 'bottom'
					});
				}
			}else{
				api.toast({
			      msg : ('错误码：'+err.code+';错误信息：'
					+err.msg+';网络状态码：'+err.statusCode),
					duration : 2000,
					location : 'bottom'
			    });
			}
		});
	}


	var restCommitInfo = {"createEntity":"添加","updateEntity":"修改","deleteEntity":"删除","createEntities":"批量添加","deleteEntities":"批量删除"};

	ajaxApi.rest =  function (method,modelName,data,callback,options){
		var datastr = data;
		if(typeof(data) != "string"){
			if(method == "queryEntities")
			{
				var dataarry = [];
				for(var key in data)
				{
					dataarry.push({"Key":key,"Value":data[key]});
				}

				datastr = JSON.stringify(dataarry);
			}
			else
			{
				datastr = JSON.stringify(data);
			}
		}

		if(!options)
		   options = {};

	 if(!options.hasOwnProperty("DataUpdateColumn"))
			options["DataUpdateColumn"]="";

	  if(!options.hasOwnProperty("RelateModels"))
			options["RelateModels"]="";

	  //var isDisableTips =options.hasOwnProperty("showTips");

		var projectId = "";
		if($.inArray(modelName,noProjectCacheModels)<0){
				projectId = TServerInfo.getProjectId();
		}

		api.ajax({
		  url:'http://'+TServerInfo.getHostUrl()+'/restapi/'+method+"/"+modelName,
		  method:'post',
		  cache: false,
		  timeout: 30,
		  dataType: 'json',
			data:{
				values:{"Data":datastr,"ProjectId":projectId,"__secret":"notoken",
				"DataUpdateColumn":options["DataUpdateColumn"],"RelateModels":options["RelateModels"]}
			}
		},function(ret,err){
		   var noTips = options.hasOwnProperty("noTips");
		  if (ret) {
		  	if(ret.Code == 0){
		  		if(restCommitInfo.hasOwnProperty(method) && (!noTips)){
						api.toast({
							msg : (restCommitInfo[method]+'信息成功!'),
							duration : 2000,
							location : 'bottom'
						});
		  		}

					if(ret.Content && ret.Content!="")
						 callback(JSON.parse(ret.Content));
					else
						 callback(ret);
		  	}else{
			    api.toast({
						msg : ('错误码：'+ret.Code+'；错误信息：'
						+ret.Msg),
						duration : 2000,
						location : 'bottom'
					});
		    }
		  } else {
		  	api.toast({
			      msg : ('错误码：'+err.code+';错误信息：'
					+err.msg+';网络状态码：'+err.statusCode),
					duration : 2000,
					location : 'bottom'
			    });

		  };
		});
	}

	ajaxApi.query = function (queryId,params,callback)
	{
		var data = $.extend({"queryId":queryId}, params); ;
		var datastr = JSON.stringify(data);

		api.ajax({
		  url:'http://'+TServerInfo.getHostUrl()+'/queryapi/queryByCond',
		  method:'post',
		  cache: false,
		  timeout: 30,
		  dataType: 'json',
			data:{
				values:{"Data":datastr,"ProjectId":TServerInfo.getProjectId(),"__secret":"notoken"}
			}
		},function(ret,err){
			if (ret) {
			  	if(ret.Code == 0){
			  		callback(JSON.parse(ret.Content));
			  	}else{
				    api.toast({
						msg : ('错误码：'+ret.Code+'；错误信息：'
						+ret.Msg),
						duration : 2000,
						location : 'bottom'
					});
			    }
		  } else {
		  	api.toast({
			      msg : ('错误码：'+err.code+';错误信息：'
					+err.msg+';网络状态码：'+err.statusCode),
					duration : 2000,
					location : 'bottom'
			    });

		  };
		});
	}

	ajaxApi.exec = function (queryId,params,callback)
	{
		var data = $.extend({"queryId":queryId}, params); ;
		var datastr = JSON.stringify(data);

		api.ajax({
		  url:'http://'+TServerInfo.getHostUrl()+'/queryapi/execByCond',
		  method:'post',
		  cache: false,
		  timeout: 30,
		  dataType: 'json',
			data:{
				values:{"Data":datastr,"ProjectId":TServerInfo.getProjectId(),"__secret":"notoken"}
			}
		},function(ret,err){
			if (ret) {
			  	if(ret.Code == 0){
			  		callback(ret);
			  	}else{
				    api.toast({
							msg : ('错误码：'+ret.Code+'；错误信息：'
							+ret.Msg),
							duration : 2000,
							location : 'bottom'
						});
			    }
		  } else {
		  	api.toast({
			      msg : ('错误码：'+err.code+';错误信息：'
					+err.msg+';网络状态码：'+err.statusCode),
					duration : 2000,
					location : 'bottom'
			    });

		  };
		});
	}

	ajaxApi.batchSave = function (entityBatchOps,fileInfos,options,callback)
	{
		var datastr = JSON.stringify(entityBatchOps);
		var values = {"Data":datastr,"ProjectId":TServerInfo.getProjectId(),"__secret":"notoken"};
		if(options.hasOwnProperty("RelateModels")){
			values["RelateModels"]=options["RelateModels"];
		}
		var noTips = options.hasOwnProperty("noTips");

		if(options.hasOwnProperty("Globle")){
				values["ProjectId"]="";
		}

		var files = {};
		for(var i=0; i<fileInfos.length;++i){
			var item = fileInfos[i];

			values["ItemId"+i] = item["ItemId"];
			values["OwnerId"+i] = item["OwnerId"];
			values["FileName"+i] = item["FileName"];

			files["File"+i] = item["File"];
		}

		values["Count"] = fileInfos.length;

		api.ajax({
		  url:'http://'+TServerInfo.getHostUrl()+'/restapi/batchSaveEntities',
		  method:'post',
		  cache: false,
		  timeout: 60,
		  dataType: 'json',
			data:{
				values:values,
		  	files:files
			}
		},function(ret,err){
			if (ret) {
			  	if(ret.Code == 0){
						if( !noTips){
							api.toast({
								msg : '保存信息成功!',
								duration : 2000,
								location : 'bottom'
							});
			  		}

			  		callback(ret);
			  	}else{
				    api.toast({
							msg : ('错误码：'+ret.Code+'；错误信息：'
							+ret.Msg),
							duration : 2000,
							location : 'bottom'
						});
			    }
		  } else {
		  	api.toast({
			      msg : ('错误码：'+err.code+';错误信息：'
					+err.msg+';网络状态码：'+err.statusCode),
					duration : 2000,
					location : 'bottom'
			    });

		  };
		});
	}

	ajaxApi.keepalive = function(callback){
		var secret = $api.getStorage('secret');
		api.ajax({
		  url:'http://'+TServerInfo.getHostUrl()+'/keepalive',
		  method:'post',
		  cache: false,
		  timeout: 5,
		  dataType: 'json',
			data:{
				values:{"Data":secret,"__secret":"notoken"}
			}
		},function(ret,err){

			  	callback(ret,err);
		});
	}

	ajaxApi.fastUploadImages = function (fileInfos,ownerId,callback,isglobe){
		for(var i=0; i<fileInfos.length;++i){
			var fileInfo = fileInfos[i];
			fileInfo["OwnerId"] = ownerId;
		}

		//_this = this;
		this.UploadImages(fileInfos,isglobe,function(ret){
			callback(ret);
		});
	}

	ajaxApi.UploadImages = function (fileInfos,isglobe,callback)
	{
		var values = {};
		var files = {};
		for(var i=0; i<fileInfos.length;++i){
			var item = fileInfos[i];

			values["ItemId"+i] = item["ItemId"];
			values["OwnerId"+i] = item["OwnerId"];
			values["FileName"+i] = item["FileName"];

			files["File"+i] = item["File"];
		}

		values["Count"] = fileInfos.length;
		if(!isglobe)
			values["ProjectId"] = TServerInfo.getProjectId();

		values["__secret"]="notoken";

		api.ajax({
		  url:'http://'+TServerInfo.getHostUrl()+'/uploadImages',//TServerInfo.getCompanyCode()
		  method:'post',
		  charset:'UTF-8',
		  cache: false,
		  timeout: 30,
		  dataType: 'json',
		  data:{
		  	values:values,
		  	files:files
		  }
		},function(ret,err){
			if (ret) {
			  	if(ret.Code == 0){
			  		callback();
			  	}else{
				    api.toast({
						msg : ('错误码：'+ret.Code+'；错误信息：'
						+ret.Msg),
						duration : 2000,
						location : 'bottom'
					});
			    }
		  } else {
		  	api.toast({
			      msg : ('错误码：'+err.code+';错误信息：'
					+err.msg+';网络状态码：'+err.statusCode),
					duration : 2000,
					location : 'bottom'
			    });

		  };
		});
	}

	ajaxApi.getredpoint = function(moduleName,kind){
		var postparams = $.extend({"Module":moduleName,"Kind":kind+""},TServerInfo.getProjUserParam());

		this.query("query_1016",postparams,function(data){
			if(data && data.list)
			{
				for(var i=0;i<data.list.length;++i){
					 var item = data.list[i];
					 if(item[0]){
						 $("#dot_"+item[0]).css("display","block");
					 }else{
						 $("#dot_"+item[0]).css("display","none");
					 }
				}
			}
		});
	}

	ajaxApi.kindRedpointLoadMgr={};

	ajaxApi.getkindredpoint = function(moduleName){
		if(this.kindRedpointLoadMgr.hasOwnProperty(moduleName) && !this.kindRedpointLoadMgr[moduleName]){
			return ;
		}

		this.kindRedpointLoadMgr[moduleName] = false;

		var postparams = $.extend({"Module":moduleName},TServerInfo.getProjUserParam());

		this.query("query_1018",postparams,function(data){
			if(data && data.list)
			{
				for(var i=0;i<data.list.length;++i){
					 var item = data.list[i];
					 var elem = $("#badge_"+item[0]);
					 if(item[1]>0){
						 elem.css("display","block");
						 elem.html(item[1]);
					 }else{
						 elem.css("display","none");
					 }
				}
			}
		});
	}

	ajaxApi.removeredpoint = function(moduleKey,entityName){
			if($("#dot_"+moduleKey).length == 0){
				return ;
			}

		  if($("#dot_"+moduleKey).css("display") == "none"){
				 return ;
			}

			if(entityName)
				this.kindRedpointLoadMgr[entityName]=true;

			this.exec("query_9003",{"ModuleKey":moduleKey,"UserId":TServerInfo.getUserId()},function(ret){
					$("#dot_"+moduleKey).css("display","none");
			});
	}

    window.AjaxApi = ajaxApi;

})(window);
