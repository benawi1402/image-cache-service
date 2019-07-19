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

var buildImagePath = function(uri, filename) {
    return cachePrefix + filename + path.extname(uri);
};


app.get('/image', function(req, res) {
    var imageHash = md5(req.query.url);
    var filename = buildImagePath(req.query.url, imageHash);
    if(fs.existsSync(filename)) {
        console.log('Image already known, serving from cache.');
        res.sendFile(filename);
    }else {
        console.log('Unknown image url, downloading and caching.');
        download(req.query.url, filename, function() {
            res.sendFile(filename);
        });

    }
});

app.listen(3000, function() {
    console.log("Image Caching Service listening on port 3000");
});