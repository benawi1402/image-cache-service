const express = require('express');
const md5 = require('md5');
const request = require('request');
const Datauri = require('datauri');
const path = require('path');
const piexifjs = require('piexifjs');
const parseDataUrl = require('parse-data-url');
const imageType = require('image-type');
const fs = require('fs');


var app = express();
var cachePrefix = __dirname + '/cache/';

var saveImage = function (filetype, filename, buffer, callback) {
    const datauri = new Datauri();
    var base64Data = datauri.format(filetype, buffer).content;
    if (filetype === 'jpg' || filetype === 'jpeg') {
        base64Data = piexifjs.remove(base64Data);
        const parsed = parseDataUrl(base64Data);
        buffer = parsed.toBuffer();
    }

    fs.writeFileSync(filename, buffer);
    callback();
};

var download = function (uri, filename, callback) {
    request({url: uri, encoding: null}, function (error, response, body) {
        var isImage = false;
        const imgType = imageType(body);
        if (['image/jpeg', 'image/jpg', 'image/png'].indexOf(imgType.mime) !== -1) {
            isImage = true;
        }
        if (isImage) {
            saveImage(imgType.ext, filename, body, callback);
        }
    });

};

var buildImagePath = function (uri, filename, minified) {
    var pathName = minified ? cachePrefix + 'minified/' + filename : cachePrefix + 'queue/' + filename;
    return pathName + path.extname(uri);
};


app.get('/image', function (req, res) {
    var imageHash = md5(req.query.url);
    var filename = buildImagePath(req.query.url, imageHash, false);
    var minifiedFilename = buildImagePath(req.query.url, imageHash, true);
    if (fs.existsSync(minifiedFilename)) {
        console.log('Image already known and minified, serving from cache.');
        res.sendFile(minifiedFilename);
    } else if (fs.existsSync(filename)) {
        console.log('Image already known but not yet minified, serving from cache.');
        res.sendFile(filename);
    } else {
        console.log('Unknown image url, downloading and caching.');
        download(req.query.url, filename, function () {
            res.sendFile(filename);

        });

    }
});

app.listen(3111, function () {
    console.log("Image Caching Service listening on port 3111");
});