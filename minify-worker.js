const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const chokidar = require('chokidar');
const fs = require('fs');


var minifyFiles = function()  {

    (async () => {
        console.log('Want to minify');
        const files = await imagemin(['cache/queue/*.{jpg,png}'], {
            destination: 'cache/minified',
            plugins: [
                imageminMozjpeg([100]),
                imageminPngquant({
                    quality: [0.6, 0.8]
                })
            ]
        });



    })();
};
var watcher = chokidar.watch('cache/queue', {
    persistent: true,
    followSymlinks: false,
    usePolling: true,
    depth: undefined,
    interval: 100,
    ignorePermissionErrors: false
});
class Logger {
    info(text) {
        console.log('[INFO] ' + text);
    }

    error(text) {
        console.log('[ERROR] ' + text);
    }
}

const logger = new Logger();
const fileCopyDelaySeconds = 3;

watcher
    .on('ready', function() { logger.info('Initial scan complete. Ready for changes.'); })
    .on('unlink', function(path) { logger.info('File: ' + path + ', has been REMOVED'); })
    .on('error', function(err) {
        logger.error('Chokidar file watcher failed. ERR: ' + err.message);
    })
    .on('add', function(path) {
        logger.info('File', path, 'has been ADDED');

        fs.stat(path, function (err, stat) {

            if (err){
                logger.error('Error watching file for copy completion. ERR: ' + err.message);
                logger.error('Error file not processed. PATH: ' + path);
            } else {
                logger.info('File copy started...');
                setTimeout(checkFileCopyComplete, fileCopyDelaySeconds*1000, path, stat);
            }
        });
    });

// Makes sure that the file added to the directory, but may not have been completely copied yet by the
// Operating System, finishes being copied before it attempts to do anything with the file.
function checkFileCopyComplete(path, prev) {
    fs.stat(path, function (err, stat) {

        if (err) {
            throw err;
        }
        if (stat.mtime.getTime() === prev.mtime.getTime()) {
            logger.info('File copy complete => beginning processing');
            minifyFiles();
        }
        else {
            setTimeout(checkFileCopyComplete, fileCopyDelaySeconds*1000, path, stat);
        }
    });
}