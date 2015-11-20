module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        cucumberjs: {
            features: ['tests/features/test.feature', 'tests/features'],
            options: {
                format: 'pretty'
            }
        },

        nodemon: {
            dev: {
                script: 'bin/www',
                options: {
                    watch: [
                        'public', 'bin/www'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-cucumberjs');

    grunt.registerTask('server', ['nodemon']);
};
