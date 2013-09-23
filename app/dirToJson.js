var fs = require('fs');

var ignore = [
    '.git',
    'node_modules',
    'dist',
    'temp',
    '.sass-cache',
    'bower_components',
    '.tmp'
];
var results = [];

var dirToPaths = function (dir, callback) {
    fs.readdir(dir, function (err, list) {
        if (err) {
            return callback(err);
        }
        var pending = list.length;
        if (!pending) {
            return callback(null, results);
        }
        list.forEach(function (file) {
            fs.stat(dir + '/' + file, function (err, stat) {
                if (ignore.indexOf(file) !== -1) {
                    if (!--pending) {
                        callback(null, results);
                    }
                    return;
                }
                if (stat && stat.isDirectory()) {
                    dirToPaths(dir + '/' + file, function (err, res) {
                        if (!--pending) {
                            callback(null, results);
                        }
                    });
                } else {
                    results.push(dir + '/' + file);
                    if (!--pending) {
                        callback(null, results);
                    }
                }
            });
        });
    });
};

dirToPaths('.', function (err, res) {
    var files = res.map(function (file) {
        return {
            path: file.substring(2)
        };
    });
    fs.writeFileSync('dir.json', JSON.stringify(files, null, '\t'));
});
