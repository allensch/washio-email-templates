require('sugar');

var async = require('async');
var request = require('request');

var templatesFolder = './templates';

function buildRequest(path, data) {
    var o = { json:true };
    o.uri = 'https://mandrillapp.com/api/1.0/' + path;
    o.body = data;
    return o;
}

module.exports = function(grunt) {

    grunt.registerTask('mandrill', 'Sync with mandrill', function() {
        var calls = [], done = this.async(), config = grunt.file.readJSON('mandryll.json');

        grunt.file.recurse(templatesFolder, function(abspath, rootdir, subdir, filename) {
            var payload = Object.clone(config);
            payload.code = grunt.file.read(abspath);
            payload.name = filename.substr(0, filename.indexOf('.'));

            calls.push(function(data, callback) {
                request.post(buildRequest('templates/add.json', data), function(error, response, body) {
                    if (body.code == 6) {
                        request.post(buildRequest('templates/update.json', data), function(error, response, body) {
                            if (error) {
                                callback(null, 'error - ' + data.name, error);
                            } else {
                                callback(null, 'updated - ' + data.name);
                            }
                        });
                    } else {
                        if (error) {
                            callback(null, 'error - ' + data.name, error);
                        } else {
                            callback(null, 'added - ' + data.name);
                        }
                    }
                });
            }.fill(payload));
        });

        async.series(calls, function(error, results) {
            console.log(results);
            done();
        });
    });

};




