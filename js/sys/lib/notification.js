/**
 * Notification class
 *
 * Set up notification base. Uses notify.js.
 */
var NotifyClass = Base.extend({

    constructor: function() {},

    init: function() {
        // set up notifyjs
        $.notify.addStyle( 'flat', {
            html:
                '<div>' +
                    '<div class="icon" data-notify-html="icon"/>' +
                    '<div class="text-wrapper sans-font">' +
                        '<div class="md-text text" data-notify-text="text"/>' +
                    '</div>' +
                '</div>',
            classes: {}
        });

        $.notify.defaults({
            // whether to hide the notification on click
            clickToHide: true,
            // whether to auto-hide the notification
            autoHide: true,
            // if autoHide, hide after milliseconds
            autoHideDelay: 15000,
            // show the arrow pointing at the element
            arrowShow: false,
            // arrow size in pixels
            arrowSize: 5,
            // default positions
            elementPosition: 'bottom left',
            globalPosition: 'top right',
            // default style
            style: 'flat',
            // default class (string or [string])
            className: 'error',
            // show animation
            showAnimation: 'fadeIn',
            // show animation duration
            showDuration: 200,
            // hide animation
            hideAnimation: 'fadeOut',
            // hide animation duration
            hideDuration: 200,
            // padding between element and notification
            gap: 2
        });

        App.Log.debug( 'Notification library loaded', 'sys' );
    },

    success: function ( message ) {
        $.notify({
            text: message,
            icon: '<i class="fa fa-check" style="top:-2px;"></i>'
        }, 'success' );
    },

    error: function ( message ) {
        $.notify({
            text: message,
            icon: '<i class="fa fa-frown-o"></i>' // fa-times-circle
        }, 'error' );
    },

    info: function ( message ) {
        $.notify({
            text: message,
            icon: '<i class="fa fa-info-circle"></i>'
        }, 'info' );
    },

    warning: function ( message ) {
        $.notify({
            text: message,
            icon: '<i class="fa fa-warning"></i>'
        }, 'warning' );
    }

});