Parse.Cloud.job("convertFiles", function(request, status) { //Cuts the rundata out of poor runs
    function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
          break;
        }
      }
    }
    
    // Tell the JS cloud code to keep a log of where it's upto. Manually create one row (in class "debugclass") to get an object Id
    Parse.Cloud.useMasterKey();
    
    var Debug = Parse.Object.extend("debugclass");
    var queryForDebugObj = new Parse.Query(Debug);
    queryForDebugObj.equalTo("objectId", "KbwwDV2S57");
    
    // Query for all users
    // var queryForSublist = new Parse.Query(Parse.Object.extend("gentest"));
    
    
    queryForDebugObj.find({
        success: function(results) {
            var debugObj = results[0];
  
            var processCallback = function(res) {
                    var entry = res[0];
                    var debugObj = results[0];
                    debugObj.set("LastObject", entry.id);
                    debugObj.save();
     
                    Parse.Cloud.httpRequest({
                        url: entry.get("smallImage2"),
                        method: "GET",
                        success: function(httpImgFile) 
                        {
                            console.log("httpImgFile: " + String(httpImgFile.buffer));
                            var imgFile = new Parse.File("picture.jpg", {base64: httpImgFile.buffer.toString('base64')});
    
                            imgFile.save().then(function () {
                                console.log("2");
                                entry.set("smallImage1", imgFile);
                                entry.save(null, {
                                  success: function(unused) {
                                    debugObj.increment("itemDone");
                                    sleep(20);
                                    res.shift();
                                    if (res.length === 0) {
                                        process(entry.id);
                                        return;
                                    }
                                    else {
                                        processCallback(res);
                                    }
    
                                        
                                  },
                                  error: function(unused, error) {
                                    response.error("failed to save entry");
                                  }
                                });    
                            });                                             
                        },
                        error: function(httpResponse) 
                        {
                            console.log("unsuccessful http request");
                            response.error(responseString);
                        }
                    });
            };
            var process = function(skip) {{
                var queryForSublist = new Parse.Query("genpants");
    
                if (skip) {
                    queryForSublist.greaterThan("objectId", skip);
                    console.error("last object retrieved:" + skip);
                }
                queryForSublist.ascending("objectId");
                queryForSublist.find().then(function querySuccess(res) {
                    processCallback(res);
                }, function queryFailed(reason) {
                    status.error("query unsuccessful, length of result " + result.length + ", error:" + error.code + " " + error.message);
                });
            }};
    
            process(debugObj.get("LastObject"));
             
        },
        error: function(error) {
            status.error("xxx Uh oh, something went wrong 2:" + error + "  " + error.message);
        }
    });  
});