/**
 * Messaging class
 *
 * Contains all of the alerting and messaging used throughout the app.
 */
var MessageClass = Base.extend({
    /**
     * Elements
     */
    $eltWorking: null,
    $eltWorkingOverlay: null,
    $eltStatus: null,
    $eltAlert: null,
    $eltAlertOverlay: null,
    $eltConfirm: null,
    $eltConfirmOverlay: null,

    /**
     * Message stacks
     */
    stack: [],
    alertStack: [],
    confirmStack: [],

    /**
     * List of keys to preserve until removed
     */
    preservedKeys: [],

    constructor: function() {},

    init: function() {
        var self = this;

        // Create the working element (this exists outside of the defer)
        if ( ! $( '#app-working' ).length ) {
            jQuery( '<div/>', {
                id: 'app-working'
            }).appendTo( 'body' );
            jQuery( '<span/>' ).appendTo( '#app-working' );
            jQuery( '<div/>', {
                id: 'app-working-overlay'
            }).appendTo( 'body' );
        }

        this.$eltWorking = $( '#app-working' );
        this.$eltWorkingOverlay = $( '#app-working-overlay' );

        _.defer( function() {
            // Create the status element
            jQuery( '<div/>', {
                id: 'app-status'
            }).appendTo( 'body' );
            jQuery( '<span/>' ).appendTo( '#app-status' );

            self.$eltStatus = $( '#app-status' );

            // Create the alert element and overlay
            jQuery( '<div/>', {
                id: 'app-alert'
            }).appendTo( 'body' );
            jQuery( '<p/>' ).appendTo( '#app-alert' );
            jQuery( '<div/>', {
                'class' : 'app-buttons'
            }).appendTo( '#app-alert' );
            jQuery( '<a/>', {
                'class' : 'app-close blue btn',
                'href' : 'javascript:;'
            }).appendTo( '#app-alert .app-buttons' );
            jQuery( '<div/>', {
                id: 'app-alert-overlay'
            }).appendTo( 'body' );

            self.$eltAlert = $( '#app-alert' );
            self.$eltAlertOverlay = $( '#app-alert-overlay' );

            $( window ).resize( function() {
                self.repositionAlert();
            });

            // Create the confirm element and overlay
            jQuery( '<div/>', {
                id: 'app-confirm'
            }).appendTo( 'body' );
            jQuery( '<p/>' ).appendTo( '#app-confirm' );
            jQuery( '<div/>', {
                'class' : 'app-buttons'
            }).appendTo( '#app-confirm' );
            jQuery( '<a/>', {
                'class' : 'app-confirm-cancel red btn',
                'href' : 'javascript:;'
            }).appendTo( '#app-confirm .app-buttons' );
            jQuery( '<a/>', {
                'class' : 'app-confirm-ok blue btn',
                'href' : 'javascript:;'
            }).appendTo( '#app-confirm .app-buttons' );
            jQuery( '<div/>', {
                id: 'app-confirm-overlay'
            }).appendTo( 'body' );

            self.$eltConfirm = $( '#app-confirm' );
            self.$eltConfirmOverlay = $( '#app-confirm-overlay' );

            // Alert close click handler
            self.$eltAlert.delegate( ".app-close", "click.message", function() {
                self.closeAlert( $( this ) );
            });

            // Confirm close click handler
            self.$eltConfirm.delegate( ".app-close", "click.message", function() {
                self.closeConfirm( $( this ) );
            });
        });

        App.Log.debug( 'Message library loaded', 'sys' );
    },

    destroy: function() {
        // Undelegate namespace event handlers
        this.$eltAlert.undelegate( 'message' );
        this.$eltConfirm.undelegate( 'message' );
    },

    /**
     * Show an alert to the user
     */
    alert: function( msg /*, displayOverlay */ ) {
        // If this alert is displayed, queue this one
        if ( this.$eltAlert.is( ':visible' ) ) {
            App.Log.debug( 'Alert message already displayed, pushing message to alert stack' );

            this.alertStack.push({
                'msg' : msg,
                'displayOverlay' : displayOverlay
            });

            return false;
        }

        // Display the overlay
        var displayOverlay = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : true;

        if ( displayOverlay ) {
            this.$eltAlertOverlay.show().fadeTo( 0, 0.6 );
        }

        // Set the alert content
        msg = msg || App.Lang.error_default;
        this.$eltAlert.find( 'p' ).html( msg );
        this.$eltAlert.find( '.app-buttons a' ).html( App.Lang.ok );

        this.repositionAlert( true );
    },

    closeAlert: function() {
        App.Log.debug( "Closing alert window" );

        // Close alert window
        this.$eltAlert.find( 'p' ).html( '' );
        this.$eltAlertOverlay.hide();
        this.$eltAlert.hide();

        // Check the alert stack for any other messages
        if ( this.alertStack.length ) {
            var alert = this.alertStack.shift();
            this.alert( alert.msg, alert.displayOverlay );
        }
    },

    repositionAlert: function( /* show */ ) {
        var show = ( arguments.length > 0 )
            ? arguments[ 0 ]
            : false;

        if ( show ) {
            this.$eltAlert.show();
        }

        var height = this.$eltAlert.outerHeight(),
            windowHeight = $( window ).height(),
            width = this.$eltAlert.outerWidth(),
            windowWidth = $( window ).width();

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
    confirm: function( msg /*, okay, cancel, displayOverlay | params */ ) {
        // If this alert is displayed, queue this one
        if ( this.$eltConfirm.is( ':visible' ) ) {
            App.Log.debug( 'Confirm dialog already displayed, pushing message to confirm stack' );

            this.confirmStack.push({
                'msg' : msg,
                'displayOverlay' : displayOverlay
            });

            return false;
        }

        // Display the overlay
        var params = ( arguments.length > 3 )
            ? arguments[ 3 ]
            : {};

        if ( _.isBoolean( params ) ) {
            params = {
                displayOverlay: ( params ? params : true )
            };
        }

        if ( _.isUndefined( params.displayOverlay ) ) {
            params.displayOverlay = true;
        }

        if ( params.displayOverlay ) {
            this.$eltConfirmOverlay.show().fadeTo( 0, 0.6 );
        }

        // Set up the callbacks
        var okay = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : function() { return; };
        var cancel = ( arguments.length > 2 )
            ? arguments[ 2 ]
            : function() { return; };

        // Set the confirm content
        this.$eltConfirm.find( 'p' ).html( msg );
        this.$eltConfirm.find( '.app-confirm-ok' ).html(
            ( _.isUndefined( params.ok_text ) )
                ? App.Lang.ok
                : params.ok_text );
        this.$eltConfirm.find( '.app-confirm-cancel' ).html( App.Lang.cancel );

        // Confirm dialog button callbacks
        var self = this;

        this.$eltConfirm.on( "click.message", ".app-confirm-ok", function() {
            self.closeConfirm();
            okay();
        });

        this.$eltConfirm.on( "click.message", ".app-confirm-cancel", function() {
            self.closeConfirm();
            cancel();
        });

        this.repositionConfirm( true );
    },

    closeConfirm: function() {
        App.Log.debug( "Closing confirm window" );

        // Close confirm window
        this.$eltConfirm.find( 'p' ).html( '' );
        this.$eltConfirmOverlay.hide();
        this.$eltConfirm.hide();
        this.$eltConfirm.off( "click.message", ".app-confirm-ok" );
        this.$eltConfirm.off( "click.message", ".app-confirm-cancel" );

        // Check the alert stack for any other messages
        if ( this.confirmStack.length ) {
            var confirm = this.confirmStack.shift();
            this.confirm( confirm.msg, confirm.displayOverlay );
        }
    },

    repositionConfirm: function( /* show */ ) {
        var show = ( arguments.length > 0 )
            ? arguments[ 0 ]
            : false;

        if ( show ) {
            this.$eltConfirm.show();
        }

        var height = this.$eltConfirm.outerHeight(),
            windowHeight = $( window ).height(),
            width = this.$eltConfirm.outerWidth(),
            windowWidth = $( window ).width();

        this.$eltConfirm.css({
            'top' : ( App.Config.message_center_confirm )
                ? '( windowHeight / 2 ) - ( height / 2 )'
                : App.Config.message_confirm_top,
            'left' : ( windowWidth / 2 ) - ( width / 2 )
        });
    },

    // Set the global status
    setStatus: function( /* msg, key, preserve */ ) {
        var msg = ( ! arguments.length )
            ? App.Lang.loading
            : arguments[ 0 ];
        var key = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : null;
        var preserve = ( arguments.length > 2 )
            ? arguments[ 2 ]
            : false;

        App.Log.debug( "Setting status: " + msg + ", with key: " + key );

        if ( preserve ) {
            App.Log.debug( "Preserving status" );

            if ( ! _.contains( this.preservedKeys, key ) ) {
                this.preservedKeys.push( key );
            }
            else {
                return;
            }
        }

        if ( key ) {
            var obj = {};
            obj[ key ] = msg;
            this.stack.push( obj );
        }
        else {
            this.stack.push( msg );
        }

        this.$eltStatus.find( 'span' ).html( msg );

        // Reposition the status message
        var width = this.$eltStatus.outerWidth(),
            windowWidth = $( window ).width();
        this.$eltStatus.css( 'left', ( windowWidth / 2 ) - ( width / 2 ) );
        this.$eltStatus.show();
    },

    // Unset the global status
    unsetStatus: function( /* key, preserve */ ) {
        var key = ( arguments.length )
            ? arguments[ 0 ]
            : null;
        var preserve = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : false;

        App.Log.debug( "Un-setting status with key: " + key );

        // If we're removing a preserved key, bounce out of here if the
        // requested key is not in the preserved list
        if ( preserve ) {
            App.Log.debug( "Explicitly removing preserved key" );

            if ( ! _.contains( this.preservedKeys, key ) ) {
                return;
            }
        }

        // If we have a key, search and remove that. if we don't have a key,
        // try to remove an element with no key set. if no key is found or if
        // the array size is 1, pop the array.
        var found = false;
        var currentMessage = this.$eltStatus.find( 'span' ).html();
        var poppedElement = null;

        if ( key ) {
            // Check for the key, if we find it then remove it
            for ( i in this.stack ) {
                if ( this.stack[ i ][ key ] ) {
                    found = true;
                    this.stack.splice( i, 1 );
                    break;
                }
            }
        }
        else {
            // Try to remove a non-keyed element
            for ( i in this.stack ) {
                if ( typeof this.stack[ i ] != 'object' ) {
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
                    var keys = _.keys( this.stack[ i ] );
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

        // Finally, if the stack is still full set the element status to the last
        // message. otherwise hide it.
        if ( ! this.stack.length ) {
            this.$eltStatus.hide();
        }
        else {
            var newMessage = "",
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
    setWorking: function( msg ) {
        // Display the overlay
        this.$eltWorkingOverlay.show();

        // Set the working content
        msg = msg || App.Lang.working;
        this.$eltWorking.find( 'span' ).html( msg );

        this.repositionWorking( true );
    },

    /**
     * Removes the working dialog
     */
    unsetWorking: function() {
        this.$eltWorkingOverlay.fadeOut();
        this.$eltWorking.hide();
        this.$eltWorking.find( 'span' ).html( '' );
    },

    /**
     * Set the working dialog in the center of the page
     */
    repositionWorking: function( /* show */ ) {
        var show = ( arguments.length > 0 )
            ? arguments[ 0 ]
            : false;

        if ( show ) {
            this.$eltWorking.show();
        }

        var height = this.$eltWorking.outerHeight(),
            windowHeight = $( window ).height(),
            width = this.$eltWorking.outerWidth(),
            windowWidth = $( window ).width();

        this.$eltWorking.css({
            'top' : ( windowHeight / 2 ) - ( height / 2 ),
            'left' : ( windowWidth / 2 ) - ( width / 2 )
        });
    }

});