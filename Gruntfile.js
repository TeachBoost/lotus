module.exports = function( grunt ) {

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        // SASS
        sass: {
            debug: {
                options: {
                    sourcemap: 'auto',
                    style: 'expanded'
                },
                files: {
                    './css/debug/mixins.css': './sass/sys/mixins.sass',
                    './css/debug/variables.css': './sass/sys/variables.sass',
                    './css/debug/main.css': './sass/sys/main.sass',
                    './css/debug/centaurfixes.css': './sass/sys/centaurfixes.sass',
                    './css/debug/trunk.css': './sass/sys/dialogs.sass',
                    './css/debug/modals.css': './sass/modals.sass'
                }
            },
            dev: {
                options: {
                    sourcemap: 'auto',
                    style: 'expanded'
                },
                files: {
                    './css/app.css': './sass/index.sass'
                }
            }
        },
        // File Watching
        watch: {
            sass: {
                files: './sass/**/*.sass',
                tasks: [ 'sass:dev' ]
            },
            js: {
                files: [ './js/app/**/*.js', './js/sys/**/*.js', './js/app.js' ],
                tasks: [ 'concat:js' ]
            }
        },
        // Minify the CSS
        cssmin: {
            minify: {
                src: [
                    './vendor/bootstrap/dist/css/bootstrap.min.css',
                    './vendor/fontawesome/css/font-awesome.min.css',
                    './css/centaur.css', // should be ./vendor/teachboost/centaur.css
                    './css/app.css'
                ],
                dest: './css/build.css'
          }
        },
        // JavaScript
        concat: {
            options : {
                sourceMap: true
            },
            js: {
                src: [
                    // Vendor libraries
                    './vendor/jquery/dist/jquery.js',
                    './vendor/modernizr/modernizr.js',
                    './vendor/underscore/underscore.js',
                    './vendor/fastclick/lib/fastclick.js',
                    './vendor/notifyjs/dist/notify.js',
                    './vendor/bootstrap/dist/js/bootstrap.js',
                    './vendor/iCheck/icheck.js',
                    './vendor/moment/moment.js',
                    './vendor/jquery-form/jquery.form.js',
                    './vendor/jquery.easing/js/jquery.easing.js',
                    './vendor/jquery.scrollTo/jquery.scrollTo.js',
                    // App bootstrap
                    './js/app.js',
                    // System libraries
                    './js/sys/lib/log.js',
                    './js/sys/lib/message.js',
                    './js/sys/lib/notification.js',
                    './js/sys/lib/request.js',
                    './js/sys/lib/url.js',
                    './js/sys/lib/template.js',
                    './js/sys/lib/text.js',
                    './js/sys/lib/url.js',
                    './js/sys/lang/english.js',
                    // Application files
                    './js/app/lang/english.js',
                    './js/app/pages/home.js',
                    './js/app/templates.js'
                ],
                dest: './js/dist/build.js'
            }
        },
        uglify: {
            js: {
                files: {
                    './js/dist/build.min.js': [ './js/dist/build.js' ]
                }
            }
        },
        // Templates
        jst: {
            compile: {
                options: {
                    templateSettings: {
                        interpolate : /\{\{(.+?)\}\}/g
                    },
                    prettify: true,
                    namespace: 'App.Templates'
                },
                files: {
                    './js/app/templates.js': [ './js/app/views/**/*.html' ]
                }
            }
        }
    });

    grunt.loadNpmTasks( 'grunt-contrib-sass' );
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-jst' );

    grunt.registerTask( 'default', [ 'sass:dev', 'concat:js', 'watch' ] );
    grunt.registerTask( 'debug', [ 'sass:debug' ] );
    grunt.registerTask( 'js', [ 'concat:js', 'uglify:js' ] );
    grunt.registerTask( 'css', [ 'sass:dev', 'cssmin:minify' ] );
    grunt.registerTask( 'build', [ 'sass:dev', 'cssmin:minify', 'concat:js', 'uglify:js' ] );
    // grunt.registerTask( 'test', [ 'sass:test' ] );

};