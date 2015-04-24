module.exports = function ( grunt ) {

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        // SASS
        sass: {
            debug: {
                options: {
                    sourcemap: 'auto',
                    style: 'expanded',
                    cacheLocation: './src/sass/cache/'
                },
                files: {
                    './build/css/debug/mixins.css': './src/sass/sys/mixins.sass',
                    './build/css/debug/variables.css': './src/sass/sys/variables.sass'
                }
            },
            dev: {
                options: {
                    sourcemap: 'auto',
                    style: 'expanded',
                    cacheLocation: './src/sass/cache/'
                },
                files: {
                    './build/css/app.css': './src/sass/index.sass'
                }
            }
        },
        // File Watching
        watch: {
            sass: {
                files: './src/sass/**/*.sass',
                tasks: [ 'sass:dev', 'cssmin:minify' ]
            },
            js: {
                files: [ './src/js/app/**/*.js', './src/js/sys/**/*.js', './src/js/app.js' ],
                tasks: [ 'concat:js' ]
            },
            html: {
                files: './src/html/views/**/*.html',
                tasks: [ 'jst:compile' ]
            }
        },
        // Minify the CSS
        cssmin: {
            minify: {
                src: [
                    './vendor/bootstrap/dist/css/bootstrap.min.css',
                    './vendor/fontawesome/css/font-awesome.min.css',
                    './vendor/tb-ui-kit/dist/css/uikit.css',
                    './build/css/app.css'
                ],
                dest: './build/css/build.css'
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
                    './src/js/app.js',
                    // System libraries
                    './src/js/sys/lib/log.js',
                    './src/js/sys/lib/message.js',
                    './src/js/sys/lib/notification.js',
                    './src/js/sys/lib/request.js',
                    './src/js/sys/lib/url.js',
                    './src/js/sys/lib/template.js',
                    './src/js/sys/lib/text.js',
                    './src/js/sys/lib/url.js',
                    './src/js/sys/lang/english.js',
                    // Application files
                    './src/js/app/lang/english.js',
                    './src/js/app/pages/home.js'
                ],
                dest: './build/js/build.js'
            }
        },
        uglify: {
            js: {
                files: {
                    './build/js/build.min.js': [
                        './build/js/build.js',
                        './build/js/templates.js'
                    ]
                }
            }
        },
        // Template Views
        jst: {
            compile: {
                options: {
                    prettify: true,
                    namespace: 'App.Templates'
                },
                files: {
                    './build/js/templates.js': [ './src/html/views/**/*.html' ]
                }
            }
        },
        // HTML Templates
        template: {
            local: {
                options: {
                    data: {
                        environment: "development",
                        asset_version: 1,
                        asset_path: ".",
                        root_path: ".",
                        api_path: "localhost"
                    }
                },
                files: {
                    './build/index.html': [ './src/html/templates/index.html' ]
                }
            },
            development: {
                options: {
                    data: {
                        environment: "development",
                        asset_version: 1,
                        asset_path: "https://app.cdn",
                        root_path: "https://app.dev/name",
                        api_path: "https://app.dev"
                    }
                },
                files: {
                    './build/index.html': [ './src/html/templates/index.html' ]
                }
            }
        },
        // Images and Fonts
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: './vendor/tb-ui-kit/dist/images/',
                    src: '**',
                    dest: './build/images/'
                }, {
                    expand: true,
                    flatten: true,
                    src: './vendor/fontawesome/fonts/*',
                    dest: './build/fonts/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: './build/',
                    src: '**',
                    dest: './dist/'
                }]
            }
        }
    });

    grunt.loadNpmTasks( 'grunt-contrib-sass' );
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-jst' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-template' );

    grunt.registerTask( 'default', [ 'sass:dev', 'concat:js', 'jst:compile', 'watch' ] );
    grunt.registerTask( 'debug', [ 'sass:debug' ] );
    grunt.registerTask( 'js', [ 'jst:compile', 'concat:js' ] );
    grunt.registerTask( 'css', [ 'sass:dev', 'cssmin:minify' ] );
    grunt.registerTask( 'fonts', [ 'copy:main' ] );
    grunt.registerTask( 'images', [ 'copy:main' ] );
    grunt.registerTask( 'build', [ 'sass:dev', 'cssmin:minify', 'jst:compile', 'copy:main', 'concat:js' ] );
    grunt.registerTask( 'dist', [ 'uglify:js', 'copy:dist' ] );
    grunt.registerTask( 'printenv', function () {
        console.log( process.env );
    });

    // Environment builds
    grunt.registerTask( 'local', [ 'template:local', 'build' ] );
    grunt.registerTask( 'development', [ 'template:development', 'build' ] );

};
