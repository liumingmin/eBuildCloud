var TServerInfo ={
	getHostUrl : function(){
		if(api.debug){
			return "192.168.1.105:8000";
		}else{
			return "47.96.248.36";
		}
	},
	getProjectId : function(){
		//return "f1f8b968780d4202889bd64c4777cf3b";
		return $api.getStorage('projectId');
	},
	getUserId:function(){
		//return "5acb0ee5c01c813700000001";
		return $api.getStorage('userId');
	},
	getProjUserParam:function(){
		return {"UserId":this.getUserId(),"ProjectId":this.getProjectId()}
	},
	getProjUserParamChart:function(){
		return {"UserId":window.localStorage.getItem('userId'),"ProjectId":window.localStorage.getItem('projectId')}
	},
	HasProjUserParam:function(){
		return this.getUserId() && this.getUserId()!=""
	    && this.getProjectId() && this.getProjectId()!="";
	},
	HasProjParam:function(){
		return this.getProjectId() && this.getProjectId()!="";
	},
	HasUserParam:function(){
		return this.getUserId() && this.getUserId()!="";
	},
	getRongCloudToken:function(){
		return  $api.getStorage('rongCloudToken');
	}
}

var gDayLtTimeSuffix = "T00:00:00+08:00";
var gDayGtTimeSuffix = "T23:59:59+08:00";
var gMinuteTimeSuffix = ":00+08:00";

function setStorageCurrLocation(lon,lat){
		$api.setStorage("currLon",lon);
		$api.setStorage("currLat",lat);
}

function getCurrLocationLon(){
	var currLon =  $api.getStorage("currLon");
	if(currLon==""){
		 return 116.4021310000;
	}else{
		 return parseFloat(currLon);
	}
}

function getCurrLocationLat(){
	var currLat = $api.getStorage("currLat");
	if(currLat==""){
		 return 39.9994480000;
	}else{
		 return parseFloat(currLat);
	}
}

function setStorageProjectInfo(id,name,lon,lat){
	var projUserParam = {"UserId":TServerInfo.getUserId(),"ProjectId":id};

	AjaxApi.exec("query_9004",projUserParam,function(ret){
		$api.setStorage('projectId',id);
		$api.setStorage('projectName',name);
		$api.setStorage('lon',lon);
		$api.setStorage('lat',lat);

		gClearLastProjectData();

		api.toast({
				msg : "已切换项目为:"+name,
			duration : 1000,
			location : 'bottom'
			});
	});


}

var gWeekDayCn = ["星期天","星期一","星期二","星期三","星期四","星期五","星期六"];
function gGetWeekDay(weekidx){
		return gWeekDayCn[weekidx];
}

function gClearLastProjectData(){
	try{
	api.execScript({
		name: 'root',
		frameName: 'index.work',
		script: 'clearLastProjectData()'
	 });
	}catch(e){}

	try{
	api.execScript({
		name: 'root',
		frameName: 'index.contact',
		script: 'clearLastProjectData()'
	 });
	}catch(e){}
}

function gClearLastUserData(){
	try{

		api.execScript({
			name: 'root',
			frameName: 'index.project',
			script: 'clearUserData()'
		 });
}catch(e){}

try{
	api.execScript({
		name: 'root',
		frameName: 'index.work',
		script: 'clearUserData()'
	 });
}catch(e){}

try{
		api.execScript({
			name: 'root',
			frameName: 'index.contact',
			script: 'clearUserData()'
		 });
	}catch(e){}
}



function checkSelectProject(tosel){
	if(!TServerInfo.getProjectId() || TServerInfo.getProjectId()==""){
		if(tosel) selectProject();
		else
		api.toast({
				msg : "请选择项目!",
				duration : 1000,
				location : 'bottom'
			});

		return false;
	}

	return true;
}

function execAMapLBS(callback){
	var aMapLBS = api.require('aMapLBS');
		aMapLBS.configManager({
				accuracy: 'tenMeters',
				filter: 1
		}, function(ret, err) {
				if (ret.status) {
					callback(aMapLBS);
				}else{
					api.toast({
							msg : "定位管理器初始化失败",
						duration : 1000,
						location : 'bottom'
						});
				}
		});
}

function calcDistance(lonA,latA,lonB,latB) {
    var earthR = 6371000;
    var x = Math.cos(latA * Math.PI / 180.) * Math.cos(latB * Math.PI / 180.) * Math.cos((lonA - lonB) * Math.PI / 180);
    var y = Math.sin(latA * Math.PI / 180.) * Math.sin(latB * Math.PI / 180.);
    var s = x + y;
    if (s > 1) s = 1;
    if (s < -1) s = -1;
    var alpha = Math.acos(s);
    var distance = alpha * earthR;
    return distance;
}

function renderProcessNodes(processId,callback){

	AjaxApi.query("query_1012",{"ProcessId":processId,"ProjectId":TServerInfo.getProjectId()},function(data){
			var datalist = data.list;
			if(datalist&& datalist.length>0){
				var tplData = {
					"list" : datalist
				};
				var html = template("processNodeTpl", tplData);
				$("#"+"processNodeContent").html(html);
			}

			if (callback){
				callback(datalist);
			}
		});
}

function renderInstanceNodes(queryId,instanceId,callback){

	AjaxApi.query(queryId,{"InstanceId":instanceId},function(data){
			var datalist = data.list;
			if(datalist&& datalist.length>0){
				var tplData = {
					"list" : datalist
				};
				var html = template("instanceNodeTpl", tplData);
				$("#"+"processNodeContent").html(html);
			}

			if (callback){
				callback(datalist);
			}
		});
}

function populateNodeUserIds(datalist){
	   var userIds =[];
		 if(datalist){
			 for (var i = 0; i < datalist.length; i++) {
 				  var item = datalist[i]
 					userIds.push(item[3]);
 			}
		 }
		return userIds;
}

Array.prototype.findBy =function(name,value){
	for(var i=0;i<this.length;++i){
		if(this[i][name] == value){
			return this[i];
		}
	}
	return null;
}

Array.prototype.moveToFirst =function(item){
	  if(this.length >0){
				var idx = $.inArray(item,this);
			 if(idx >0){
				 	var first = this[idx];
					this[idx] = this[0];
					this[0] = first;
			 }
		}
}

Array.prototype.removeItem = function(item){
		for(var i=0;i<this.length;++i){
			if(this[i] == item){
				this.splice(i,1);
				return ;
			}
		}
}

Array.prototype.constainsItem = function(item){
		for(var i=0;i<this.length;++i){
			if(this[i] == item){
				return true;
			}
		}

		return false;
}

Array.prototype.subtract = function(array2){
	var result=[];
	for(var i=0;i<this.length;++i){
		if(!array2.constainsItem(this[i])){
			result.push(this[i]);
		}
	}

	return result;
}

Array.prototype.subtractBy = function(fieldName, array2){
	var result=[];
	for(var i=0;i<this.length;++i){
		if(!array2.constainsItem(this[i][fieldName])){
			result.push(this[i]);
		}
	}

	return result;
}

Array.prototype.select = function(fieldName){
	var result=[];
	for(var i=0;i<this.length;++i){
			result.push(this[i][fieldName]);
	}
	return result;
}

Array.prototype.selectMany = function(fieldName){
	var result=[];
	for(var i=0;i<this.length;++i){
			var item = this[i][fieldName];
			if(item instanceof Array){
					for(var j=0;j<item.length;++j){
							result.push(item[j]);
					}
			}else{
				result.push(this[i][fieldName]);
			}
	}
	return result;
}

Array.prototype.distinct = function(){
	var result=[];
	for(var i=0;i<this.length;++i){
			var item = this[i];
			if($.inArray(item,result)<0){
					result.push(item);
			}
	}
	return result;
}

var statusMap ={0: "草稿", 1:"审批中", 2:"通过", 3:"退回", 4:"作废"};
var statusColorMap = {0: "#969696", 1:"blue", 2:"green", 3:"red", 4:"#969696"};
function formatStatus(status){
	return statusMap[status];
}

function formatStatusColor(status){
	return statusColorMap[status];
}

function formatPercent(f){
	return (f*100).toFixed(2)+"%";
}

// function initTitleByProjectName(id,name){
// 	try{
// 	api.execScript({
// 		name: 'root',
// 		frameName: 'index.work',
// 		script: 'setProjectInfo("'+id+'","'+name+'")'
// 	 });
// 	 api.execScript({
// 		 name: 'root',
// 		 frameName: 'index.app',
// 		 script: 'setProjectInfo("'+id+'","'+name+'")'
// 		});
// 		api.execScript({
//  		 name: 'root',
//  		 frameName: 'index.contact',
//  		 script: 'setProjectInfo("'+id+'","'+name+'")'
//  		});
// 	}catch(e){}
// }

function returnSelectUser(winName,frameName,data){
	var scriptobj = {
		name: winName,
		script: "setSelectUser('"+data+"')"
	};

	if(frameName&& frameName!=""){
		scriptobj["frameName"] = frameName;
	}

	try{
	api.execScript(scriptobj);

 }catch(e){}
}

function returnSelectUsers(winName,frameName,data,tags){
	var scriptobj = {
		name: winName,
		script: "setSelectUsers('"+data+"','"+tags+"')"
	};

	if(frameName&& frameName!=""){
		scriptobj["frameName"] = frameName;
	}

	try{
	api.execScript(scriptobj);

 }catch(e){}
}

function returnSelectProject(winName,frameName,id,name,lon,lat){
	try{
	api.execScript({
		name: winName,
		frameName: frameName,
		script: "setSelectProject('"+id+"','"+name+"',"+lon+","+lat+")"
	 });

 }catch(e){}
}

function returnSelectLocation(winName,frameName,lon,lat,address){
	try{
	api.execScript({
		name: winName,
		frameName: frameName,
		script: "setSelectLocation("+lon+","+lat+",'"+address+"')"
	 });

 }catch(e){}
}

function returnSearchLocation(winName,frameName,lon,lat,address){
	try{
	api.execScript({
		name: winName,
		frameName: frameName,
		script: "setSearchLocation("+lon+","+lat+",'"+address+"')"
	 });

	}catch(e){}
}

function DisableTouchMove(){
	document.addEventListener('touchmove', function(e) {
      e.preventDefault();
    }, false);
}

function RegDoubleBackQuit(){
        api.addEventListener({
            name: 'keyback'
        }, function(ret, err){
        	if(api.frameName != "root")
        		api.historyBack();

            api.toast({
                    msg: '再按一次返回键退出'+api.appName,
                    duration:2000,
                    location: 'bottom'
                });

                api.addEventListener({
                    name: 'keyback'
                }, function(ret, err){
                	if(api.frameName != "root")
                		api.historyBack();

                    api.closeWidget({
                            id: 'A6078652148122',     //这里改成自己的应用ID
                            retData: {name:'closeWidget'},
                            silent:true
                        });
                });

                setTimeout(function(){
                    RegDoubleBackQuit();
                },3000);
        });
}

function GetUuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "";

    var uuid = s.join("");
    return uuid;
}

Date.prototype.TrimDate = function () {
	this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
  this.setMilliseconds(0);
}

Date.prototype.NextMonth = function () {
	if (this.getMonth()<11){
		this.setMonth(this.getMonth()+1);
	}else{
		this.setFullYear(this.getFullYear()+1);
		this.setMonth(1);
	}
}

Date.prototype.PrevMonth = function () {
	if (this.getMonth()==0){
		this.setFullYear(this.getFullYear()-1);
		this.setMonth(11);
	}else{
		this.setMonth(this.getMonth()-1);
	}
}

Date.prototype.NextDay = function () {
	 this.TrimDate();
	 this.setTime(this.getTime()+ (1000 * 60 * 60 * 24));
}


Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

String.prototype.startWith = function(compareStr){
	return this.indexOf(compareStr) == 0;
}

String.prototype.endWith = function(compareStr,ignoreCase){
	  var suffix =  this.substr(this.length-compareStr.length,compareStr.length);
     if(ignoreCase){
			 return  (suffix.toLowerCase()) == (compareStr.toLowerCase());
		 }else{
			 return suffix==compareStr;
		 }
}



String.prototype.sliceWith = function(compareStr){
	var idx = this.indexOf(compareStr);
	if(idx>=0){
		return this.substr(0,idx);
	}

	return this;
}

String.prototype.PadLeft = function(totalWidth, paddingChar)
{
 if ( paddingChar != null )
 {
  return this.PadHelper(totalWidth, paddingChar, false);
 } else {
  return this.PadHelper(totalWidth, ' ', false);
 }
}
String.prototype.PadRight = function(totalWidth, paddingChar)
{
 if ( paddingChar != null )
 {
  return this.PadHelper(totalWidth, paddingChar, true);
 } else {
  return this.PadHelper(totalWidth, ' ', true);
 }

}

String.prototype.PadHelper = function(totalWidth, paddingChar, isRightPadded)
{

var reallen = this.getBytesLength();//.replace(/[^\u0000-\u00ff]/g,"aa")

 if ( reallen < totalWidth)
 {
  var paddingString = new String();
  for (i = 1; i <= (totalWidth - reallen); i++)
  {
   paddingString += paddingChar;
  }

  if ( isRightPadded )
  {
   return (this + paddingString);
  } else {
   return (paddingString + this);
  }
 } else {
  return this;
 }
}

String.prototype.getBytesLength = function() {
	return this.replace(/[^\x00-\xff]/gi, "--").length;
}

function gShowProgress(){
	api.showProgress({
	    style: 'default',
	    animationType: 'fade',
	    title: '努力加载中...',
	    text: '马上呈现...',
	    modal: true
	});
}

var gWhitespaceHtml = '<br/>  <br/><br/><br/><br/><br/><br/>  <br/><br/><br/><br/><br/>';
