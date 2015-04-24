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
     * Updates font size setting based on a magnification level
     */
    setFontSize: function ( mag ) {
        var size;

        //@TODO Get from storage
        //if ( ! mag ) {
        //    mag = App.Storage.get( App.Const.storage_font_size, true );
        //}

        if ( ! mag ) {
            mag = 2;
        }

        size = _.findWhere( App.Config.bodySizes, { mag: mag } );

        //App.Storage.set(
        //    App.Const.storage_font_size,
        //    size,
        //    true );
        $( 'body' ).removeClass( 'x1 x2 x3 x4 x5' )
            .addClass( 'x' + mag );
        $( '#toggle-zoom' ).find( '.size' )
            .data( 'pt', size.pt )
            .data( 'mag', size.mag )
            .text( size.pt + ' pt' );
    },

    /**
     * Check if we're touch-enabled
     */
    isTouchDevice: function () {
        return App.iPad;
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
    },

    unlockScreen: function () {
        $( '#app-lock-overlay' ).fadeOut( 'fast' );
    }

});