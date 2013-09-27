module.exports = function (grunt) {
    'use strict';

    grunt.registerMultiTask('dirToJson', function () {
        var options = this.options();
        this.files.forEach(function (file) {
            var files = grunt.file.expand({cwd: options.basePath}, file.orig.src);
            grunt.file.write(file.dest, JSON.stringify(files));
            grunt.log.writeln('File "' + file.dest + '" created.');
        });
    });
};
