/**
 * Home page
 */
App.Pages.Home = new Base;
App.Pages.Home.extend({
    /**
     * onbeforeunload switch
     */
    allowUnload: false,

    /**
     * Set up page event handlers.
     */
    load: function () {
        var self = this;
        this.base();

        // Defer DOM handling until after callstack is finished
        _.defer( function () {
            // Check for any fatal errors with the browser
            if ( ! self.checkFatalErrors() ) {
                return false;
            }

            // Add specific DOM classes for certain browsers
            self.addBrowserInfoToDom();
            // Resize for browser heights, set up modals and event handlers
            self.browserDetect();
            self.fontSizeEvents();
            self.init();
            // Run integrity checks
            App.runTests();
            // Trigger to integrity check that we're done here
            App.IC.EventTarget.fire( App.Tests.HOME_LOADED.key );
        });

        App.Log.debug( 'Home page loaded', 'sys' );
    },

    /**
     * Initialize state
     */
    init: function () {
        if ( this.isTouchDevice() ) {
            $( 'body' )
                .addClass( 'touch' )
                .removeClass( 'notouch' );
        }

        // Attach font size click events
        this.fontSizeEvents();
        // Set font size
        this.setFontSize( false );
    },

    /**
     * Sets up events for toggling font size
     */
    fontSizeEvents: function () {
        var self = this,
            $toggle = $( '#toggle-zoom' );

        // When the + or - button is pressed
        $toggle.on( 'click.home', 'button.adjust', function ( e ) {
            var $this = $( this ),
                $size = $this.parent().find( '.size' ),
                direction = $this.data( 'direction' ),
                mag = $size.data( 'mag' ),
                sizes = App.Config.bodySizes;

            if ( direction === 'up' ) {
                mag++;
            }
            else if ( direction === 'down' ) {
                mag--;
            }

            mag = Math.min( sizes[ _.size( sizes ) - 1 ].mag, mag );
            mag = Math.max( sizes[ 0 ].mag, mag );
            self.setFontSize( mag );
            e.stopPropagation();
            e.preventDefault();
        });

        // When the middle divider is pressed, do nothing
        $( '#toggle-zoom' ).on( 'click.home', 'button.size', function ( e ) {
            e.stopPropagation();
        });
    },

    /**
     * Updates font size setting based on a magnification level.
     */
    setFontSize: function ( mag ) {
        var size;

        if ( ! mag ) {
            mag = App.Storage.get( App.Const.storage_font_mag, true );
        }

        if ( ! mag ) {
            mag = 2;
        }

        App.Storage.set(
            App.Const.storage_font_mag,
            mag,
            true );
        size = _.findWhere( App.Config.bodySizes, { mag: mag } );
        $( 'body' ).removeClass( 'x1 x2 x3 x4 x5' )
            .addClass( 'x' + mag );
        $( '#toggle-zoom' ).find( '.size' )
            .data( 'pt', size.pt )
            .data( 'mag', size.mag )
            .text( size.pt + ' pt' );
        $( window ).trigger( 'resize' );
    },

    /**
     * Add browser class to the DOM.
     */
    browserDetect: function ( ) {
        switch ( App.browser.name ) {
            case "chrome":
                $( 'html' ).addClass( 'webkit' );
                break;
            case "safari":
                $( 'html' ).addClass( 'safari' );
                break;
            case "firefox":
                $( 'html' ).addClass( 'firefox' );
                break;
            case "msedge":
            case "msie":
                $( 'html' ).addClass( 'ie' );
                break;
            case "opera":
                $( 'html' ).addClass( 'opera' );
                break;
        }
    },

    /**
     * Check if we're touch-enabled
     */
    isTouchDevice: function () {
        return App.browser.mobile;
    },

    /**
     * Set up chat
     */
    initChat: function () {
        if ( _.isUndefined( window.$zopim )
            || ! window.$zopim
            || ! _.has( window.$zopim, 'livechat' ) )
        {
            $( '#live-chat' ).hide();
            return false;
        }

        // Configure user info
        // @TODO bring in Storage library
        $zopim.livechat.setName( App.Storage.get( App.Const.storage_user_name ) );
        $zopim.livechat.setEmail( App.Storage.get( App.Const.storage_user_email ) );

        // Attach click event handler
        $( '#live-chat' ).on( 'click', function () {
            $zopim.livechat.window.show();
        });

        $( '#live-chat' ).parent().show();

        return true;
    },

    /**
     * Performs tests if the user's browser is okay to continue.
     */
    checkFatalErrors: function () {
        // Check for localstorage
        if ( ! Modernizr.localstorage ) {
            this.showError( App.Lang.error_no_localstorage );
            return false;
        }

        // Check for an unsupported browser.
        if ( ! App.browserOkay() ) {
            this.showError( this.getBadBrowserMessage() );
            return false;
        }

        return true;
    },

    getBadBrowserMessage: function () {
        var browserMsg, updateUrl;

        // First get the start of the message and the update URL
        if ( App.browser.msie || App.browser.msedge ) {
            browserMsg = App.Lang.error_bad_ie;
            updateUrl = "http://windows.microsoft.com/en-us/internet-explorer/download-ie";
        }
        else if ( App.browser.ipad || App.browser.iphone ) {
            browserMsg = App.Lang.error_bad_ios;
            updateUrl = "https://support.apple.com/en-us/HT204204";
        }
        else if ( App.browser.chrome ) {
            browserMsg = App.Lang.error_bad_chrome;
            updateUrl = "https://www.google.com/chrome/";
        }
        else if ( App.browser.safari ) {
            browserMsg = App.Lang.error_bad_safari;
            updateUrl = "https://www.apple.com/safari/";
        }
        else if ( App.browser.firefox ) {
            browserMsg = App.Lang.error_bad_firefox;
            updateUrl = "https://firefox.com";
        }
        else {
            browserMsg = App.Lang.error_bad_browser;
        }

        // If we have a RL add one.
        if ( updateUrl ) {
            browserMsg +=
                '<br><br><center><i class="fa fa-download top-3 relative-position right-margin-5"></i>&nbsp;' +
                '<a class="underline" href="' + updateUrl + '" target="_blank">Upgrade your browser here</a></center>';
        }

        return browserMsg;
    },

    addBrowserInfoToDom: function () {
        if ( App.browser.msie ) {
            if ( App.browser.versionNumber == 10 ) {
                $( 'html' ).addClass( 'ie10' );
            }
            else if ( App.browser.versionNumber == 11 ) {
                $( 'html' ).addClass( 'ie11' );
            }
        }
    },

    /**
     * Display an error page
     */
    showError: function ( message ) {
        App.Pages.Home.allowUnload = true;
        App.IC.Done();
        $( '#app-error-overlay' )
            .find( 'span' )
            .html( message );
        $( '#app-error-overlay' ).fadeIn();
    },

    /**
     * Show the lock screen
     */
    lockScreen: function () {
        $( '#app-lock-overlay' ).fadeIn();
    },

    unlockScreen: function () {
        $( '#app-lock-overlay' ).fadeOut( 'fast' );
    }
});