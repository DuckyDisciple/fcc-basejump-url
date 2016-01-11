//
// # URL Shortener
//
// Service that generates a new shortened url and then redirects to the site when entered.
//
var express = require('express');
var app = express();
var router = express.Router();
var fs = require("fs");

var urlsLoaded = false;
var urls = [];

function loadUrls(){
    fs.readFile("urlList.json", function(err, data){
        if(err) throw err;
        urlsLoaded = true;
        urls = JSON.parse(data).urls;
    });
}

function updateList(newObj){
    urls.push(newObj);
    var toWrite = {
        "urls": urls
    };
    fs.writeFile("urlList.json", JSON.stringify(toWrite));
}

router.get('/new/*', function(req, res){
    var website = req.url.substr(5);
    
    //check format for valid url
    if( (website.search("http://")!==0 && website.search("https://")!==0)
        || website.indexOf('.')<7){
      var errorRes = { "error": "Invalid url" };
      res.send(JSON.stringify(errorRes));
    }else if(urlsLoaded){
        var urlObj = {
            "short": "https://fcc-basejump-url-duckydisciple.c9users.io/" + urls.length,
            "full": website
        };
        updateList(urlObj);
        res.send(JSON.stringify(urlObj));
    }else{
        //return error
        res.send('{"error":"Unable to load urls"}');
    }
});

router.get('/*', function(req, res) {
    var path = req.url;
    //go to instruction page if blank
    if(path==="/"){
        res.sendfile(__dirname + "/client/index.html");
    }else if(urlsLoaded){
        var urlNum = path.substring(1);
        if(isNaN(urlNum) || Number(urlNum)>=urls.length){
            res.send('{"error":"Invalid shortened url"}');
        }else{
            //go to site if valid short url
            var fullUrl = urls[Number(urlNum)].full;
            res.redirect(fullUrl);
        }
    }else{
        //display error if not
        res.send('{"error":"Unable to load urls"');
    }
});

app.use('/', router);

var server = app.listen(process.env.PORT, function(){
  var port = server.address().port;
  console.log("Server connected on port %s", port);
  loadUrls();
});
