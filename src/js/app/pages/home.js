/**
 * Home page
 */
var HomePage = new Base;
HomePage.extend({
    /**
     * onbeforeunload switch
     */
    allowUnload: false,

    /**
     * Set up page event handlers
     */
    load: function () {
        var self = this;
        this.base();

        // defer DOM handling until after callstack is finished
        _.defer( function () {
            // check if IE8 @todo better
            if ( App.ie8 || App.ie7 ) {
                HomePage.showError( App.Lang.error_bad_ie );
                return false;
            }

            if ( App.ios4 || App.ios5 ) {
                HomePage.showError( App.Lang.error_bad_ios );
                return false;
            }

            // Initialize the page
            self.init();
            // Trigger to integrity check that we're done here
            App.IC.EventTarget.fire( App.Tests.PAGE_LOADED.key );
        });

        App.Log.debug( 'HomePage load()', 'sys' );
    },

    /**
     * Initialize state
     */
    init: function () {
        // Set font size
        //this.setFontSize( false );
    },

    /**
     * Updates font size setting
     */
    setFontSize: function ( size ) {
        if ( ! size ) {
            size = App.Storage.get( App.Const.storage_font_size, true );
        }

        if ( ! size ) {
            size = 16;
        }

        App.Storage.set(
            App.Const.storage_font_size,
            size,
            true );
        $( 'body' ).css( 'font-size', size )
            .removeClass( 's14 s15 s16 s17 s18 s19' )
            .addClass( 's' + size );
        $( '#toggle-zoom' ).find( '.percent' ).text( size + ' pt' );
    },

    /**
     * Check if we're touch-enabled
     */
    isTouchDevice: function () {
        return App.iPad;
    },

    /**
     * Handle admin events
     */
    processAdmin: function () {
        if ( ! App.Storage.get( App.Const.storage_is_admin ) ) {
            return false;
        }

        $( '.admin-feature' ).show();
    },

    /**
     * Handle beta features
     */
    processBeta: function () {
        if ( ! App.Storage.get( App.Const.storage_is_beta ) ) {
            return false;
        }
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

        // configure user info
        $zopim.livechat.setName( App.Storage.get( App.Const.storage_user_name ) );
        $zopim.livechat.setEmail( App.Storage.get( App.Const.storage_user_email ) );

        // attach click event handler
        $( '#live-chat' ).on( 'click', function () {
            $zopim.livechat.window.show();
        });

        $( '#live-chat' ).parent().show();

        return true;
    },

    /**
     * Display an error page
     */
    showError: function ( message ) {
        HomePage.allowUnload = true;
        IC.Done();
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
        App.Form.autosaveEnabled = false;
    },

    unlockScreen: function () {
        $( '#app-lock-overlay' ).fadeOut( 'fast' );
        App.Form.autosaveEnabled = true;
    }

});