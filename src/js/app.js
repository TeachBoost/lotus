/*!
 * TeachBoost JavaScript Skeleton
 * Version 1.0
 * Copyright 2015, TeachBoost
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */

// Globals: Base, App
window.App = window.App || {};
window.Base = window.Base || function () {};

// Create console if it doesn't exist (IE)
if ( ! window.console ) {
    window.console = {
        log: function () {},
        info: function () {},
        warn: function () {},
        error: function () {}
    };
}

// Base class
// Version 1.1
// Copyright 2006-2010, Dean Edwards
// Licensed under the MIT license
Base.extend = function ( _instance, _static ) { // subclass
    var extend = Base.prototype.extend,
        proto, constructor, klass;

    // Build the prototype
    Base._prototyping = true;
    proto = new this;
    extend.call( proto, _instance );
    proto.base = function () {
        // call this method from any other method to invoke that
        // method's ancestor
    };

    delete Base._prototyping;

    // Create the wrapper for the constructor function
    // var constructor = proto.constructor.valueOf(); //-dean
    constructor = proto.constructor;
    klass = proto.constructor = function () {
        if ( ! Base._prototyping ) {
            if ( this._constructing || this.constructor == klass ) { // instantiation
                this._constructing = true;
                constructor.apply( this, arguments );
                delete this._constructing;
            }
            else if ( arguments[ 0 ] != null ) { // casting
                return ( arguments[ 0 ].extend || extend ).call( arguments[ 0 ], proto );
            }
        }
    };

    // Build the class interface
    klass.ancestor = this;
    klass.extend = this.extend;
    klass.forEach = this.forEach;
    klass.implement = this.implement;
    klass.prototype = proto;
    klass.toString = this.toString;
    klass.valueOf = function ( type ) {
        return ( type == "object" ) ? klass : constructor.valueOf();
    };

    extend.call( klass, _static );

    // Class initialisation
    if ( typeof klass.init == "function" ) {
        klass.init();
    }

    return klass;
};

Base.prototype = {
    extend: function ( source, value ) {
        // Extending with a name/value pair
        if ( arguments.length > 1 ) {
            var ancestor = this[ source ],
                method;

            if ( ancestor
                && ( typeof value == "function" ) // overriding a method?
                // The valueOf() comparison is to avoid circular references
                && ( ! ancestor.valueOf || ancestor.valueOf() != value.valueOf() )
                && /\bbase\b/.test( value ) )
            {
                // Get the underlying method
                method = value.valueOf();
                // Override
                value = function () {
                    var previous = this.base || Base.prototype.base;
                    this.base = ancestor;
                    var returnValue = method.apply( this, arguments );
                    this.base = previous;
                    return returnValue;
                };

                // point to the underlying method
                value.valueOf = function ( type ) {
                    return ( type == "object" ) ? value : method;
                };

                value.toString = Base.toString;
            }
            this[ source ] = value;
        }
        // Extending with an object literal
        else if ( source ) {
            var extend = Base.prototype.extend,
                proto = { toSource: null },
                // Do the "toString" and other methods manually
                hidden = [ "constructor", "toString", "valueOf" ],
                i;

            // If this object has a customised extend method then use it
            if ( ! Base._prototyping && typeof this != "function" ) {
                extend = this.extend || extend;
            }

            // If we are prototyping then include the constructor
            i = Base._prototyping ? 0 : 1;
            while ( key = hidden[ i++ ] ) {
                if ( source[ key ] != proto[ key ] ) {
                    extend.call( this, key, source[ key ] );
                }
            }

            // Copy each of the source object's properties to this object
            for ( var key in source ) {
                if ( ! proto[ key ] ) {
                    extend.call( this, key, source[ key ] );
                }
            }
        }
        return this;
    }
};

Base = Base.extend({
    constructor: function () {
        this.extend( arguments[ 0 ] );
    }
}, {
    ancestor: Object,
    version: "1.1",

    forEach: function ( object, block, context ) {
        for ( var key in object ) {
            if ( this.prototype[ key ] === undefined ) {
                block.call( context, object[ key ], key, object );
            }
        }
    },

    implement: function () {
        for ( var i = 0; i < arguments.length; i++ ) {
            if ( typeof arguments[ i ] == "function" ) {
                // If it's a function, call it
                arguments[ i ]( this.prototype );
            } else {
                // Add the interface using the extend method
                this.prototype.extend( arguments[ i ] );
            }
        }
        return this;
    },

    toString: function () {
        return String(this.valueOf());
    }
});

// Initialise our App
App = new Base();

// Cross-browser eventing
// Copyright 2010 Nicholas C. Zakas. All rights reserved.
// Licensed under the MIT license
App.EventTarget = ( function () {
    function EventTarget () {
        this._listeners = {};
    }

    EventTarget.prototype = {
        constructor: EventTarget,

        on: function ( type, listener ) {
            if ( typeof this._listeners[ type ] == "undefined" ) {
                this._listeners[ type ] = [];
            }

            this._listeners[ type ].push( listener );
        },

        fire: function ( event ) {
            if ( typeof event == "string" ) {
                event = { type: event };
            }

            if ( ! event.target ) {
                event.target = this;
            }

            if ( ! event.type ) {  // falsy
                throw new Error( "Event object missing 'type' property." );
            }

            if ( this._listeners[ event.type ] instanceof Array ) {
                var listeners = this._listeners[ event.type ];

                for ( var i = 0, len = listeners.length; i < len; i++ ) {
                    listeners[ i ].call( this, event );
                }
            }
        },

        off: function ( type, listener ) {
            if ( this._listeners[ type ] instanceof Array ) {
                var listeners = this._listeners[ type ];

                for ( var i = 0, len = listeners.length; i < len; i++ ) {
                    if ( listeners[ i ] === listener ) {
                        listeners.splice( i, 1 );
                        break;
                    }
                }
            }
        }
    };

    return EventTarget;
}());

/**
 * Set up the application object. The flow of operations:
 *   0. Start timer
 *   1. Register integrity-check (IC) events
 *   2. Initialise the system libraries
 *   3. Initialise any registered app libraries
 *   4. Flush ready queues and execute onLoad callback
 *   5. Stop timer
 *
 * Normal procudure is to App.extend({...}) followed by App.init();
 */
App.extend({
    // Application variables
    benchTime: {},
    env: 'development',
    icConsole: 'system-console',
    icEvent: 'system-event',
    language: 'english',
    languages: {
        english: 'english'
    },
    loadCallback: null,
    loadComplete: false,
    readyQueue: [],
    readySysQueue: [],
    rootPath: '',
    version: null,
    working: false,
    workingDelay: 0,
    srcPath: './src/',
    // Browser info
    iPad: false,
    ie7: false,
    ie8: false,
    ios4: false,
    ios5: false,
    ios6: false,
    ios7: false,
    ios8: false,
    // System configs
    Config: {},
    Const: {},
    Lang: {
        english: {}
    },
    // System classes
    Log: new Base(),
    Message: new Base(),
    Notify: new Base(),
    Request: new Base(),
    Text: new Base(),
    Url: new Base(),
    Pages: {},
    // Integrity Tests
    Tests: [],

    /**
     * Base level error reporting to the browser
     */
    err: function ( type, message ) {
        var err = new Error();
        err.type = type;
        err.message = message;
        throw( err );
    },

    /**
     * Base level console writing
     */
    debug: function ( message ) {
        console.log( message );
    },

    /**
     * Implement ready queue of javascript to be executed when the
     * document is loaded. this replaces jQuery's $(document).ready()
     * function since jQuery may not be loaded by the time a ready()
     * is invoked in page JS.
     */
    ready: function ( code ) {
        if ( this.finalComplete === true ) {
            code();
        }
        else {
            this.readyQueue.push( code );
        }
    },

    /**
     * Queue for post system
     */
    readySys: function ( code ) {
        if ( this.sysComplete === true ) {
            code();
        }
        else {
            this.readySysQueue.push( code );
        }
    },

    /**
     * Benchmarking utility. This tracks execution time for a given
     * key.
     */
    benchmark: function ( /* key, destroy */ ) {
        var key = ( arguments.length >= 1 ) ? 'sys' : arguments[ 0 ],
            date, ret;

        // If the key isn't set then we need to initiate the start time for
        // the key in benchTime.
        date = new Date();

        if ( ! this.benchTime.hasOwnProperty( key ) ) {
            this.benchTime[ key ] = {
                startMs: date.getTime(),
                currentMs: date.getTime()
            };
        }
        else {
            this.benchTime[ key ].currentMs = date.getTime();
        }

        ret = this.benchTime[ key ].currentMs - this.benchTime[ key ].startMs;

        if ( arguments.length >= 2
            && arguments[ 1 ] === true
            && this.benchTime.hasOwnProperty( key ) )
        {
            delete this.benchTime[ key ];
        }

        return ret;
    },

    /**
     * Initialize the application based on environment.
     */
    init: function ( callback ) {
        var self = this,
            ua;
        // Start logger
        this.debug( '[sys ' + this.benchmark() + '] Initialising application' );

        if ( callback != undefined ) {
            this.loadCallback = callback;
        }

        // Browser checking
        ua = ( ! _.isUndefined( navigator ) && _.has( navigator, 'userAgent' ) )
            ? navigator.userAgent
            : '';
        this.iPad = /iPad/i.test( ua );

        if ( this.iPad ) {
            this.ios4 = /CPU OS 4_/i.test( ua );
            this.ios5 = /CPU OS 5_/i.test( ua );
            this.ios6 = /CPU OS 6_/i.test( ua );
            this.ios7 = /CPU OS 7_/i.test( ua );
            this.ios8 = /CPU OS 8_/i.test( ua );
        }

        // Initialise the system libraries
        this.initClasses();

        // Set up Integrity Check system
        this.integrityCheck();
        this.registerTests();
        this.runTests();

        // Initialise any registered app libraries
        for ( i in this.readySysQueue ) {
            this.readySysQueue[ i ]();
        }

        this.readySysQueue = [];

        // If we're in production mode set the prod log level
        if ( this.env === 'production' ) {
            this.Config.log_level = this.Config.prod_log_level;
        }

        // Instantiate the classes
        this.Log.init();
        this.Message.init();
        this.Notify.init();
        this.Request.init();
        this.Url.init();

        // Set up working dialog if enabled
        if ( this.working ) {
            this.Message.setWorking();
        }

        // Flush ready queues and execute onLoad callback
        $( document ).ready( _.defer( function () {
            self.loadCallback();
            self.loadComplete = true;

            for ( i in self.readyQueue ) {
                self.readyQueue[ i ]();
                delete self.readyQueue[ i ];
            }

            // Destroy 'sys' using second param
            self.debug(
                '[sys ' + self.benchmark( 'sys', true ) +
                '] Document ready complete' );
        }));

        // Benchmarking finished
        this.debug(
            '[sys ' + this.benchmark( 'sys' ) +
            '] Application initialisation complete' );
    },

    initClasses: function () {
        // Config
        this.Config = _.extend( this.Config, {
            log_level: 4,                  // integer, 0-4 with 0 being none
            prod_log_level: 1,             // 1 for just errors, 0 for none
            message_center_alert: false,   // bool
            message_alert_top: '25%',      // string
            message_center_confirm: false, // bool
            message_confirm_top: '25%'     // string
        });

        // Constants
        this.Const = _.extend( this.Const, {
            error: 'error',
            success: 'success',
            info: 'info'
        });
    },

    /**
     * Integrity checks
     * A series of events need to be caught before the application can be
     * finalized and rendered to the screen. We want:
     *    1. To know the API call succeeded
     *    2. To know the Home page finished loading
     * When both of those are caught, we want to run a few integrity tests
     * to make sure the app behaves properly:
     *    1. On save button click, code is executed
     *    2. On vault write, code is executed
     * Once these are all done, then we can hide the lock screen.
     */
    integrityCheck: function () {
        var self = this;
        this.IC = {
            EventTarget: new self.EventTarget(),
            Console: document.getElementById( self.icConsole ),
            Event: document.getElementById( self.icEvent ),
            Complete: false,
            ListenSuccess: 0,
            ListenTotal: 0,
            EvDone: {},
            ListenErrors: {},
            Listen: function ( e ) {
                App.IC.ListenSuccess++;
                App.IC.EvDone[ e.type ] = true;
                if ( App.IC.ListenSuccess >= App.IC.ListenTotal ) {
                    App.IC.Done();
                }
            },
            // Run our tests. When these succeed we're done.
            RunTests: function () {
                _.each( self.Tests, function ( Test ) {
                    Test.run();
                });
            },
            // Boot the application
            Done: function () {
                _.delay( function () {
                    App.Message.unsetWorking();
                }, App.workingDelay );
                App.IC.Complete = true;
            },
            // Timeout functions for error handling and message display
            Timeout: {
                // first check, display running message
                running: function () {
                    if ( App.IC.Complete ) {
                        return;
                    }
                    App.IC._consoleLog(
                        "Please wait a moment, the application is taking a little long to load&hellip;",
                        "info",
                        true );
                },
                // second check, something could be wrong
                warning: function () {
                    if ( App.IC.Complete ) {
                        return;
                    }
                    App.IC._consoleLog(
                        "Something could be wrong. I'm going to run one more test, please wait&hellip;",
                        "warn",
                        false );
                },
                // third check, display error. One of the triggers
                // must not have fired.
                error: function () {
                    if ( App.IC.Complete ) {
                        return;
                    }
                    // Check if any of the boot events failed
                    for ( i in App.IC.ListenErrors ) {
                        if ( ! App.IC.EvDone[ i ] ) {
                            App.IC._consoleLog( App.IC.ListenErrors[ i ], 'error', true );
                            return;
                        }
                    }
                    // Check if any of the tests failed
                    for ( i in App.IC.TestErrors ) {
                        if ( ! App.IC.EvDone[ i ] ) {
                            App.IC._consoleLog( App.IC.TestErrors[ i ], 'error', true );
                            return;
                        }
                    }
                }
            },
            _consoleLog: function ( message, type, overwrite ) {
                App.IC.Console.innerHTML =
                    '<p class="' + type + '">' + message +
                    "</p>" +
                    ( overwrite ? '' : App.IC.Console.innerHTML );
            }
        };
    },

    /**
     * Register the tests for the IC system
     */
    registerTests: function () {
        var self = this,
            total = 0;
        // Instantiate all test scripts
        _.each( this.Tests, function ( Test, key ) {
            self.IC.ListenErrors[ Test.key ] = Test.error;
            self.IC.EvDone[ Test.key ] = false;
            // Attach listener
            self.IC.EventTarget.on( Test.key, self.IC.Listen );
            total++;
        });
        // Set total count
        this.IC.ListenTotal = total;
    },

    /**
     * Set up test timeouts
     */
    runTests: function () {
        this.IC.RunTests();
        // In 5 seconds put up a message that we're running tests
        setTimeout( this.IC.Timeout.running, 5000 );
        // In 10 seconds let them know something could be wrong
        setTimeout( this.IC.Timeout.warning, 15000 );
        // In 20 seconds we can assume the tests should have run so
        // check which have not and display the appropriate errors.
        setTimeout( this.IC.Timeout.error, 20000 );
    },

    /**
     * Render a view
     */
    view: function ( path, data, returnView ) {
        var key = this.srcPath + 'html/views/' + path + '.html',
            returnView = returnView || false;

        if ( ! _.has( this.Templates, key ) ) {
            App.Log.info( "Template key " + path + " doesn't exist!" );
            return '';
        }

        return ( returnView )
            ? this.Templates[ this.srcPath + 'html/views/' + path + '.html' ]
            : this.Templates[ this.srcPath + 'html/views/' + path + '.html' ]( data );
    }
});