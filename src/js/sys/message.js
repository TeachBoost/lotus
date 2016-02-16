/**
 * Messaging class
 *
 * Contains all of the alerting and messaging used throughout the app.
 */
App.Message.extend({
    // Elements
    $eltAlert: null,
    $eltStatus: null,
    $eltConfirm: null,
    $eltAlertOverlay: null,
    $eltConfirmOverlay: null,
    $eltWorkingOverlay: null,

    // Message stacks
    stack: [],
    timerStack: {},
    alertStack: [],
    confirmStack: [],

    // List of keys to preserve until removed
    preservedKeys: [],

    constructor: function () {},

    init: function () {
        var self = this;

        // Create the working element (this exists outside of the defer)
        if ( ! $( '#app-working-overlay' ).length ) {
            $( '<div/>', {
                id: 'app-working-overlay'
            }).appendTo( 'body' );
        }

        this.$eltWorkingOverlay = $( '#app-working-overlay' );

        _.defer( function () {
            // Create the status element
            $( '<div/>', {
                id: 'app-status'
            }).appendTo( 'body' );
            $( '<span/>' ).appendTo( '#app-status' );

            self.$eltStatus = $( '#app-status' );

            // Create the alert element and overlay
            $( '<div/>', {
                id: 'app-alert'
            }).appendTo( 'body' );
            $( '<p/>' ).appendTo( '#app-alert' );
            $( '<div/>', {
                'class' : 'app-buttons'
            }).appendTo( '#app-alert' );
            $( '<a/>', {
                'class' : 'app-close blue btn',
                'href' : 'javascript:;'
            }).appendTo( '#app-alert .app-buttons' );
            $( '<div/>', {
                id: 'app-alert-overlay'
            }).appendTo( 'body' );

            self.$eltAlert = $( '#app-alert' );
            self.$eltAlertOverlay = $( '#app-alert-overlay' );

            $( window ).resize( function () {
                self.repositionAlert();
            });

            // Create the confirm element and overlay
            $( '<div/>', {
                id: 'app-confirm'
            }).appendTo( 'body' );
            $( '<p/>' ).appendTo( '#app-confirm' );
            $( '<div/>', {
                'class' : 'app-buttons'
            }).appendTo( '#app-confirm' );
            $( '<a/>', {
                'class' : 'app-confirm-cancel red btn',
                'href' : 'javascript:;'
            }).appendTo( '#app-confirm .app-buttons' );
            $( '<a/>', {
                'class' : 'app-confirm-ok blue btn',
                'href' : 'javascript:;'
            }).appendTo( '#app-confirm .app-buttons' );
            $( '<div/>', {
                id: 'app-confirm-overlay'
            }).appendTo( 'body' );

            self.$eltConfirm = $( '#app-confirm' );
            self.$eltConfirmOverlay = $( '#app-confirm-overlay' );

            // Alert close click handler
            self.$eltAlert.on( 'click.message', '.app-close', function () {
                self.closeAlert( $( this ) );
            });

            // Confirm close click handler
            self.$eltConfirm.on( 'click.message', '.app-close', function () {
                self.closeConfirm( $( this ) );
            });
        });

        App.Log.debug( 'Message library loaded', 'sys' );
    },

    destroy: function () {
        // Undelegate namespace event handlers
        this.$eltAlert.off( 'message' );
        this.$eltConfirm.off( 'message' );
    },

    /**
     * Show an alert to the user
     */
    alert: function ( msg /*, displayOverlay */ ) {
        var displayOverlay = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : true;

        // If this alert is displayed, queue this one
        if ( this.$eltAlert.is( ':visible' ) ) {
            App.Log.debug(
                'Alert message already displayed, pushing message to '
                + 'alert stack' );

            this.alertStack.push({
                'msg' : msg,
                'displayOverlay' : displayOverlay
            });

            return false;
        }

        if ( displayOverlay ) {
            this.$eltAlertOverlay.show().fadeTo( 0, 0.6 );
        }

        // Set the alert content
        msg = msg || App.Lang.error_default;
        this.$eltAlert.find( 'p' ).html( msg );
        this.$eltAlert.find( '.app-buttons a' ).html( App.Lang.ok );

        this.repositionAlert( true );
    },

    closeAlert: function () {
        var alert;
        App.Log.debug( 'Closing alert window' );

        // Close alert window
        this.$eltAlert.find( 'p' ).html( '' );
        this.$eltAlertOverlay.hide();
        this.$eltAlert.hide();

        // Check the alert stack for any other messages
        if ( this.alertStack.length ) {
            alert = this.alertStack.shift();
            this.alert( alert.msg, alert.displayOverlay );
        }
    },

    repositionAlert: function ( /* show */ ) {
        var show = ( arguments.length > 0 )
            ? arguments[ 0 ]
            : false;
        var height, windowHeight, width, windowWidth,
            $window;

        if ( show ) {
            this.$eltAlert.show();
        }

        $window = $( window );
        windowWidth = $window.width();
        windowHeight = $window.height();
        width = this.$eltAlert.outerWidth();
        height = this.$eltAlert.outerHeight();

        this.$eltAlert.css({
            'top' : ( App.Config.message_center_alert )
                ? '( windowHeight / 2 ) - ( height / 2 )'
                : App.Config.message_alert_top,
            'left' : ( windowWidth / 2 ) - ( width / 2 )
        });
    },

    /**
     * Create a confirm dialog
     */
    confirm: function ( msg /*, okay, cancel, displayOverlay | params */ ) {
        var okay = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : function () { return; };
        var cancel = ( arguments.length > 2 )
            ? arguments[ 2 ]
            : function () { return; };
        var params = ( arguments.length > 3 )
            ? arguments[ 3 ]
            : {};
        var self = this;

        if ( _.isBoolean( params ) ) {
            params = {
                displayOverlay: ( params ? params : true )
            };
        }

        if ( _.isUndefined( params.displayOverlay ) ) {
            params.displayOverlay = true;
        }

        // If this alert is displayed, queue this one
        if ( this.$eltConfirm.is( ':visible' ) ) {
            App.Log.debug(
                'Confirm dialog already displayed, pushing message to '
                + 'confirm stack' );

            this.confirmStack.push({
                'msg' : msg,
                'displayOverlay' : params.displayOverlay
            });

            return false;
        }

        if ( params.displayOverlay ) {
            this.$eltConfirmOverlay.show().fadeTo( 0, 0.6 );
        }

        // Set the confirm content
        this.$eltConfirm.find( 'p' ).html( msg );
        this.$eltConfirm.find( '.app-confirm-ok' ).html(
            ( _.isUndefined( params.ok_text ) )
                ? App.Lang.ok
                : params.ok_text );
        this.$eltConfirm.find( '.app-confirm-cancel' ).html( App.Lang.cancel );

        // Confirm dialog button callbacks
        this.$eltConfirm.on( 'click.message', '.app-confirm-ok', function () {
            self.closeConfirm();
            okay();
        });

        this.$eltConfirm.on( 'click.message', '.app-confirm-cancel', function () {
            self.closeConfirm();
            cancel();
        });

        this.repositionConfirm( true );
    },

    closeConfirm: function () {
        var config;
        App.Log.debug( 'Closing confirm window' );

        // Close confirm window
        this.$eltConfirm.find( 'p' ).html( '' );
        this.$eltConfirmOverlay.hide();
        this.$eltConfirm.hide();
        this.$eltConfirm.off( 'click.message', '.app-confirm-ok' );
        this.$eltConfirm.off( 'click.message', '.app-confirm-cancel' );

        // Check the alert stack for any other messages
        if ( this.confirmStack.length ) {
            confirm = this.confirmStack.shift();
            this.confirm( confirm.msg, confirm.displayOverlay );
        }
    },

    repositionConfirm: function ( /* show */ ) {
        var show = ( arguments.length > 0 )
            ? arguments[ 0 ]
            : false;
        var height, width, windowHeight, windowWidth,
            $window = $( window );

        if ( show ) {
            this.$eltConfirm.show();
        }

        windowWidth = $window.width();
        windowHeight = $window.height();
        width = this.$eltConfirm.outerWidth();
        height = this.$eltConfirm.outerHeight();

        this.$eltConfirm.css({
            'top' : ( App.Config.message_center_confirm )
                ? ( windowHeight / 2 ) - ( height / 2 )
                : App.Config.message_confirm_top,
            'left' : ( windowWidth / 2 ) - ( width / 2 )
        });
    },

    /**
     * Set the global status message (loading indicator)
     */
    setStatus: function ( /* msg, key, preserve, delay */ ) {
        var self = this;
        var msg = ( ! arguments.length > 0 )
            ? App.Lang.loading
            : arguments[ 0 ];
        var key = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : null;
        var preserve = ( arguments.length > 2 )
            ? arguments[ 2 ]
            : false;
        var delay = ( arguments.length > 3 )
            ? arguments[ 3 ]
            : null;
        var obj = {}, width, windowWidth, setTheStatus;

        setTheStatus = function () {
            self.$eltStatus.find( 'span' ).html( msg );
            // Reposition the status message
            width = self.$eltStatus.outerWidth();
            windowWidth = $( window ).width();
            self.$eltStatus.css( 'left', ( windowWidth / 2 ) - ( width / 2 ) );
            self.$eltStatus.show();
        };

        App.Log.debug( 'Setting status: ' + msg + ', with key: ' + key );

        if ( preserve ) {
            App.Log.debug( 'Preserving status' );

            if ( ! _.contains( this.preservedKeys, key ) ) {
                this.preservedKeys.push( key );
            }
            else {
                return;
            }
        }

        if ( key ) {
            obj[ key ] = msg;
            this.stack.push( obj );

            if ( delay ) {
                this.timerStack[ key ] = _.delay( setTheStatus, delay );
            }
            else {
                setTheStatus();
            }
        }
        else {
            this.stack.push( msg );
            setTheStatus();
        }
    },

    unsetStatus: function ( /* key, preserve */ ) {
        var key = ( arguments.length )
            ? arguments[ 0 ]
            : null;
        var preserve = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : false;
        var found = false,
            poppedElement = null,
            newMessage = '',
            currentMessage, lastElement, keys;

        App.Log.debug( 'Un-setting status with key: ' + key );

        // If we're removing a preserved key, bounce out of here if the
        // requested key is not in the preserved list
        if ( preserve ) {
            App.Log.debug( 'Explicitly removing preserved key' );

            if ( ! _.contains( this.preservedKeys, key ) ) {
                return;
            }
        }

        // If we have a key, search and remove that. if we don't have a
        // key, try to remove an element with no key set. if no key is
        // found or if the array size is 1, pop the array.
        currentMessage = this.$eltStatus.find( 'span' ).html();

        if ( key ) {
            // Check for the key, if we find it then remove it
            this.stack = _.reject( this.stack, function ( item ) {
                return _.has( item, key );
            });

            // Kill the timer by key if this was a delayed status
            if ( _.has( this.timerStack, key ) ) {
                clearTimeout( this.timerStack[ key ] );
                this.timerStack = _.omit( this.timerStack, key );
            }
        }
        else {
            // Try to remove a non-keyed element
            for ( i in this.stack ) {
                if ( typeof this.stack[ i ] !== 'object' ) {
                    found = true;
                    this.stack.splice( i, 1 );
                    break;
                }
            }
        }

        // If nothing was found, remove an item that's not in the preserved
        // keys list
        if ( ! found ) {
            for ( i in this.stack ) {
                // If it's just a string, get it out of there. otherwise check
                // if the key is in the preserved list. if it's not remove it.
                if ( _.isString( this.stack[ i ] ) ) {
                    this.stack.splice( i, 1 );
                    break;
                }
                else {
                    keys = _.keys( this.stack[ i ] );
                    if ( ! _.intersection( keys, this.preservedKeys ) ) {
                        this.stack.splice( i, 1 );
                        break;
                    }
                }
            }
        }

        // If the key was preserved, remove it from the list
        if ( _.contains( this.preservedKeys, key ) ) {
            this.preservedKeys = _.without( this.preservedKeys, key );
        }

        // Finally, if the stack is still full set the element status to
        // the last message. otherwise hide it.
        if ( ! this.stack.length ) {
            this.$eltStatus.hide();
        }
        else {
            lastElement = _.last( this.stack );
            if ( typeof lastElement == 'object' ) {
                for ( i in lastElement ) {
                    newMessage = lastElement[ i ];
                    break;
                }
            }
            else {
                newMessage = lastElement;
            }

            this.$eltStatus.find( 'span' ).html( newMessage );
        }
    },

    /**
     * Loads the global working dialog to prevent action on the page
     */
    setWorking: function () {
        // Display the overlay
        this.$eltWorkingOverlay.show();
    },

    /**
     * Removes the working dialog
     */
    unsetWorking: function () {
        this.$eltWorkingOverlay.fadeOut();
    }
});