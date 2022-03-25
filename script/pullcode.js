function pullcode(versionFileName) {
   api.download({
       url : 'http://'+TServerInfo.getHostUrl()+'/app/update/'+versionFileName,
       report : true,
      cache : true,
      allowResume : true
  }, function(ret, err) {
      if (ret.state == 1) {
         var savePath = ret.savePath;
         var obj = api.require('zip');
         obj.unarchive({//解压
              file : savePath,
              password : 'ebc^update#yueyuexxx#',
              toPath : 'widget://'//解压的资源替换当前widget资源
         }, function(ret, err) {
           if (ret.status) {//成功解压后刷新
              setTimeout(function(){api.rebootApp();},1000);
          } else {
               api.alert(err.msg);
          }
    });
  } else {
    api.alert("下载更新包失败,请手动更新");
  }
 });
}
