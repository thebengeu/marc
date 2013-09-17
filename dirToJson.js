var fs = require('fs');

var dirToObj = function (dir, callback) {
    var ignore = [
        '.git',
        'node_modules',
        'dist',
        'temp',
        '.sass-cache',
        'bower_components',
        '.tmp'
    ];
    var results = {
        path: dir,
        children: []
    };
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
                console.log(file)
                if (stat && stat.isDirectory()) {
                    dirToObj(dir + '/' + file, function (err, res) {
                        results.children.push(res);
                        if (!--pending) {
                            callback(null, results);
                        }
                    });
                } else {
                    results.children.push({path: dir + '/' + file});
                    if (!--pending) {
                        callback(null, results);
                    }
                }
            });
        });
    });
};

dirToObj('.', function (err, res) {
    fs.writeFileSync('dir.json', JSON.stringify(res, null, '\t'));
});
