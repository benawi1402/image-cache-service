var express = require('express');

var md5 = require('md5');
var app = express();
var request = require('request');
var path = require('path');

const fs = require('fs');

var cachePrefix = __dirname + '/cache/';

var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    })
};

var buildImagePath = function(uri, filename, minified) {
    var pathName = minified ? cachePrefix + 'minified/' + filename : cachePrefix + 'queue/' + filename;
    return pathName + path.extname(uri);
};


app.get('/image', function(req, res) {
    var imageHash = md5(req.query.url);
    var filename = buildImagePath(req.query.url, imageHash, false);
    var minifiedFilename = buildImagePath(req.query.url, imageHash, true);
    if(fs.existsSync(minifiedFilename)) {
        console.log('Image already known and minified, serving from cache.');
        res.sendFile(minifiedFilename);
    }else if(fs.existsSync(filename))  {
        console.log('Image already known but not yet minified, serving from cache.');
        res.sendFile(filename);
    }else {
        console.log('Unknown image url, downloading and caching.');
        download(req.query.url, filename, function() {
            res.sendFile(filename);
        });

    }
});

app.listen(3111, function() {
    console.log("Image Caching Service listening on port 3111");
});