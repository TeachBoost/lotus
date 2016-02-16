// Load libraries
var _ = require( 'underscore' );

module.exports = function ( grunt ) {
    // Template configuration option defaults
    var TEMPLATE_CONFIG = {
        page: "",
        root_path: ".",
        root_stem: "/",
        embedly_key: '',
        minified: false,
        asset_path: ".",
        thumb_path: ".",
        asset_version: "",
        tracking_code: "",
        chat_enabled: false,
        google_client_id: '',
        api_path: "localhost",
        use_asset_version: true,
        tracking_enabled: false,
        max_file_size: 10485760,
        google_developer_key: '',
        cdn_path: 'localhost:5984',
        environment: "development",
        root_stems: {
            'index': '/'
        }
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        // SASS
        sass: {
            main: {
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
                tasks: [ 'sass:main', 'concat:css' ]
            },
            js: {
                files: [ './src/js/app/**/*.js', './src/js/sys/**/*.js', './src/js/app.js' ],
                tasks: [ 'concat:jsapp' ]
            },
            html: {
                files: './src/html/views/**/*.html',
                tasks: [ 'jst:compile' ]
            },
            grunt: {
                files: [ 'Gruntfile.js' ]
            }
        },
        // Minify the CSS
        cssmin: {
            build: {
                src: [
                    './build/css/build.css'
                ],
                dest: './build/css/build.min.css'
            }
        },
        // JavaScript
        concat: {
            jsvendor: {
                options : {
                    sourceMap: false,
                    separator: ';\n'
                },
                src: [
                    // Vendor libraries
                    './vendor/jquery/dist/jquery.js',
                    './vendor/modernizr/modernizr.js',
                    './vendor/underscore/underscore.js',
                    './vendor/fastclick/lib/fastclick.js',
                    './vendor/notifyjs/dist/notify.js',
                    './vendor/bootstrap/dist/js/bootstrap.js',
                    './vendor/page/page.js',
                    './vendor/iCheck/icheck.js',
                    './vendor/moment/moment.js',
                    './vendor/jquery-form/jquery.form.js',
                    './vendor/jquery.easing/js/jquery.easing.js',
                    './vendor/jquery.scrollTo/jquery.scrollTo.js',
                    './vendor/validatejs/validate.js',
                    './vendor/simpleStorage/simpleStorage.js',
                    './vendor/lawnchair/src/Lawnchair.js',
                    './vendor/lawnchair/src/adapters/dom.js',
                    './vendor/lawnchair/src/adapters/indexed-db.js',
                    './vendor/lawnchair/src/adapters/webkit-sqlite.js',
                    './vendor/jquery.browser/dist/jquery.browser.js'
                ],
                dest: './build/js/vendor.build.js'
            },
            jsapp: {
                options : {
                    sourceMap: true,
                    separator: ';\n'
                },
                src: [
                    // App bootstrap
                    './src/js/app.js',
                    // System libraries
                    './src/js/sys/log.js',
                    './src/js/sys/url.js',
                    './src/js/sys/text.js',
                    './src/js/sys/message.js',
                    './src/js/sys/request.js',
                    './src/js/sys/storage.js',
                    './src/js/sys/notification.js',
                    './src/js/sys/lang/english.js',
                    // Application files
                    './src/js/app/constants.js',
                    './src/js/app/lang/english.js',
                    './src/js/app/pages/home.js'
                ],
                dest: './build/js/app.build.js'
            },
            jsbuild: {
                options : {
                    sourceMap: false,
                    separator: '\n'
                },
                src: [
                    './build/js/vendor.build.js',
                    './build/js/app.build.js',
                    './build/js/templates.js'
                ],
                dest: './build/js/build.js'
            },
            css: {
                options : {
                    sourceMap: false
                },
                src: [
                    './vendor/bootstrap/dist/css/bootstrap.min.css',
                    './vendor/tb-ui-kit/dist/css/uikit.css'
                ],
                dest: './build/css/vendor.css'
            },
            cssbuild: {
                options : {
                    sourceMap: false
                },
                src: [
                    './vendor/bootstrap/dist/css/bootstrap.min.css',
                    './vendor/tb-ui-kit/dist/css/uikit.css',
                    './build/css/app.css'
                ],
                dest: './build/css/build.css'
            }
        },
        uglify: {
            js: {
                files: {
                    './build/js/build.min.js': [ './build/js/build.js' ]
                }
            }
        },
        // Template Views
        jst: {
            compile: {
                options: {
                    prettify: true,
                    namespace: 'App.Templates',
                    templateSettings: { variable: '_o' },
                    // Replace all beginning and trailing whitespace with one space
                    processContent: function ( src ) {
                        return src.replace( /(^\s+|\s+$)/gm, ' ' );
                    }
                },
                files: {
                    './build/js/templates.js': [ './src/html/views/**/*.html' ]
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
                    cwd: './src/images/',
                    src: '**',
                    dest: './build/images/'
                }, {
                    expand: true,
                    flatten: true,
                    src: './vendor/tb-ui-kit/dist/fonts/*',
                    dest: './build/fonts/'
                }]
            },
            dev: {
                files: [{
                    expand: true,
                    cwd: './build/',
                    src: '**',
                    dest: './dist/dev/'
                }]
            },
            devbeta: {
                files: [{
                    expand: true,
                    cwd: './build/',
                    src: '**',
                    dest: './dist/devbeta/'
                }]
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: './build/',
                    src: '**',
                    dest: './dist/prod/'
                }]
            },
            prodbeta: {
                files: [{
                    expand: true,
                    cwd: './build/',
                    src: '**',
                    dest: './dist/prodbeta/'
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

    grunt.registerTask( 'default', [ 'sass:main', 'concat', 'jst:compile', 'watch' ] );
    grunt.registerTask( 'js', [ 'jst:compile', 'concat:jsvendor', 'concat:jsapp' ] );
    grunt.registerTask( 'css', [ 'sass:main', 'concat:css', 'concat:cssbuild', 'cssmin' ] );
    grunt.registerTask( 'fonts', [ 'copy:main' ] );
    grunt.registerTask( 'images', [ 'copy:main' ] );
    grunt.registerTask( 'build', [ 'sass:main', 'jst:compile', 'concat', 'cssmin', 'copy:main' ] );
    grunt.registerTask( 'dev', [ 'build', 'uglify:js', 'copy:dev', 'html:dev' ] );
    grunt.registerTask( 'devbeta', [ 'build', 'uglify:js', 'copy:devbeta', 'html:devbeta' ] );
    grunt.registerTask( 'prod', [ 'build', 'uglify:js', 'copy:prod', 'html:prod' ] );
    grunt.registerTask( 'prodbeta', [ 'build', 'uglify:js', 'copy:prodbeta', 'html:prodbeta' ] );
    grunt.registerTask( 'release', [ 'build', 'uglify:js', 'copy', 'html:devbeta', 'html:dev', 'html:prod', 'html:prodbeta' ] );
    grunt.registerTask( 'printenv', function () {
        console.log( process.env );
    });

    // Environment builds
    grunt.registerTask( 'local', [ 'html:local', 'build' ] );

    // Run everything
    grunt.registerTask( 'yah', [ 'html', 'build', 'watch' ] );

    // To generate the HTML file, we need to read configuration files
    // from the config directory.
    grunt.registerTask( 'html', 'Generate the HTML files.', function ( env ) {
        var assetVersion, config, options, template, html,
            serverEnvs = [
                'dev', 'devbeta', 'prod', 'prodbeta'
            ];

        if ( typeof env == 'undefined' || ! env.length ) {
            if ( process.env.ENVIRONMENT ) {
                env = process.env.ENVIRONMENT;
            }
            else {
                grunt.fail.warn( "Missing environment! Usage: grunt html:(<env>|dist)" );
            }
        }

        // Try to read the config files, and extend the options
        assetVersion = grunt.file.read( 'asset_version' );
        config = grunt.file.readJSON( './config/' + env + '.json' );
        options = _.extend( TEMPLATE_CONFIG, config );
        options.asset_version = assetVersion;

        // For each of our pages, write out an index file. This will
        // default to writing to /build but for server environments
        // we want to write to /dist.
        _.each( options.root_stems, function ( stem, page ) {
            console.log( " ↳ " + page + " " + stem );
            options.page = page;
            options.root_stem = stem;
            template = grunt.file.read( './src/html/template.html' );
            html = grunt.template.process( template, { data: options } );

            // Write the file to the appropriate location
            if ( _.indexOf( serverEnvs, env ) !== -1 ) {
                grunt.file.write( './dist/' + env + '/' + page + '.html', html );
            }
            else {
                grunt.file.write( './build/' + page + '.html', html );
            }
        });
    });

    // Generate a production distribution for the requested profile, or
    // generate them for all profiles.
    grunt.registerTask( 'dist', 'Create a distribution build.', function ( env ) {
        if ( typeof env == 'undefined' || ! env.length ) {
            grunt.task.run( 'release' );
        }
        else {
            grunt.task.run( 'build' );
            grunt.task.run( 'uglify:js' );
            grunt.task.run( 'copy:' + env );
            grunt.task.run( 'html:' + env );
        }
    });
};
