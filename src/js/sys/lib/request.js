/**
 * Request class
 *
 * Handles all HTTP requests, both asynchronous and synchronous. Contains
 * error handling and optional failure logging.
 *
 * If success is set, overwrite the success. if onSuccess is set, call
 * that before the remaining success callback only if it evaluates to true.
 *
 * Response format for callbacks:
 *   -> status      Response status
 *   -> message     Response message
 *   -> html        Array with elements of the form target => content
 *   -> script      JavaScript code to execute
 *   -> redirect    Redirect to a URL
 *   -> data        Any data variables coming with the payload
 */
App.Request.extend({
    /**
     * Success callback hook
     */
    hook: false,

    /**
     * Default parameters for ajax form. options include:
     *    beforeSend       executed before form submits
     *    onSuccess        executed when successful complete
     *    onError          executed when an error status comes back
     *    postSuccess      executed after all success handlers finished
     *    dataType         type of expected data returned
     * as well as any other option that jQuery .ajax takes
     */
    defaults: {
        dataType: 'json',
        data: {
            ajax: true
        },
        setStatus: true,
        statusMessage: null,
        redirectLast: false
    },

    /**
     * Initialise the ajax/request library
     */
    init: function() {
        App.Log.debug( 'Request library loaded', 'sys' );
    },

    /**
     * Set up the form for ajax submit. overwrite and options and set
     * up the defaults
     */
    ajaxForm: function( form /*, formOptions */ ) {
        var formOptions = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : {};
        var $form = ( _.isString( form ) )
            ? $( form )
            : form;
        var options = this.getOptions( formOptions );

        options.data = $.extend( true, this.defaults.data, options.data );
        $form.ajaxForm( options );
    },

    /**
     * Prepare the options for an ajax form
     */
    getOptions: function( formOptions ) {
        var self = this,
            options = _.extend( {}, this.defaults, formOptions );

        var successCallback = ( ! _.isUndefined( formOptions.onSuccess )
                && _.isFunction( formOptions.onSuccess ))
            ? formOptions.onSuccess
            : function() { return true; };

        var postSuccessCallback = ( ! _.isUndefined( formOptions.postSuccess )
                && _.isFunction( formOptions.postSuccess ))
            ? formOptions.postSuccess
            : function() { return true; };

        var errorCallback = ( ! _.isUndefined( formOptions.onError )
                && _.isFunction( formOptions.onError ))
            ? formOptions.onError
            : function() { return true; };

        var beforeSendCallback = ( ! _.isUndefined( formOptions.beforeSend )
                && _.isFunction( formOptions.beforeSend ))
            ? formOptions.beforeSend
            : function() { return true; };

        options.beforeSend = function() {
            if ( options.setStatus ) {
                var msg = ( options.statusMessage )
                    ? options.statusMessage
                    : App.Lang.loading;
                App.Message.setStatus( msg, 'request' );
            }

            return beforeSendCallback();
        };

        options.success = function( response, status, xhr, jqForm ) {
            // Set up defaults if we didn't get something in the response
            response = ( response ) ? response : {};
            response.status = ( ! _.isUndefined( response.status )
                    && response.status != null )
                ? response.status
                : App.Const.success;
            response.message = ( ! _.isUndefined( response.message )
                    && response.message != null )
                ? response.message
                : '';

            App.Log.info(
                'Completed ajax request with status: ' +
                JSON.stringify( response.status ) );

            // Process any hooks if there are any
            if ( _.isFunction( self.hook ) ) {
                if ( ! self.hook( response, status, xhr, jqForm ) ) {
                    if ( options.setStatus ) {
                        App.Message.unsetStatus( 'request' );
                    }
                    return false;
                }
            }

            // Handle the response
            var redirectFunction = null;

            if ( ! _.isUndefined( response.redirect )
                && response.redirect != null
                && response.redirect.length )
            {
                redirectFunction = function() {
                    App.Message.setStatus( App.Lang.redirecting, 'request' );
                    window.location = response.redirect;
                    return;
                };
            }

            if ( _.isFunction( redirectFunction ) && ! options.redirectLast ) {
                return redirectFunction();
            }

            if ( ! _.isUndefined( response.status ) ) {
                if ( response.status == App.Const.error ) {
                    if ( ! errorCallback( response, status, xhr, jqForm ) ) {
                        if ( options.setStatus ) {
                            App.Message.unsetStatus( 'request' );
                        }
                        return;
                    }
                    if ( response.message.length ) {
                        App.Notify.error( response.message );
                    }
                    else {
                        App.Notify.error( App.Lang.error_default );
                    }
                }
                else if ( response.status == App.Const.success ) {
                    if ( ! successCallback( response, status, xhr, jqForm ) ) {
                        if ( options.setStatus ) {
                            App.Message.unsetStatus( 'request' );
                        }
                        return;
                    }
                    if ( response.message.length ) {
                        App.Notify.success( response.message );
                    }
                }
                else if ( response.status == App.Const.info && response.message.length ) {
                    App.Notify.info( response.message );

                    if ( ! successCallback( response, status, xhr, jqForm ) ) {
                        if ( options.setStatus ) {
                            App.Message.unsetStatus( 'request' );
                        }
                        return;
                    }
                }
            }

            if ( ! _.isUndefined( response.html ) && response.html != null ) {
                // Iterate thru each target->content and update the target accordingly
                for ( target in response.html ) {
                    App.Log.debug( "Updating HTML in " + target );

                    try {
                        $( target ).html( response.html[ target ] );
                    }
                    catch ( err ) {
                        if ( options.setStatus ) {
                            App.Message.unsetStatus( 'request' );
                        }
                        App.Log.error( err );
                    }
                }
            }

            if ( ! _.isUndefined( response.script ) && response.script != null && response.script.length ) {
                eval( response.script );
            }

            if ( options.setStatus ) {
                App.Message.unsetStatus( 'request' );
            }

            postSuccessCallback( response, status, xhr, jqForm );

            if ( _.isFunction( redirectFunction ) && options.redirectLast ) {
                return redirectFunction();
            }
        };

        if ( _.isUndefined( options.error ) || ! options.error ) {
            options.error = function( qXHR, textStatus, errorThrown ) {
                // Check if request was aborted from lack of connectivity.
                if ( options.setStatus ) {
                    App.Message.unsetStatus( 'request' );
                }

                // Handle errors accordingly
                App.Log.error(
                    'Failed ajax request with status: ' + textStatus + '. Error thrown: ' +
                    JSON.stringify( errorThrown ), {
                        url: options.url,
                        data: options.data,
                        type: options.type,
                        response: qXHR.responseText
                    });

                App.Notify.error( App.Lang.error_request );
                errorCallback();
            };
        }

        return options;
    },

    /**
     * Submits an ajax form
     */
    submit: function( form ) {
        var $form = ( _.isString( form ) )
            ? $( form )
            : form;
        $form.submit();
    },

    /**
     * Submit a dynamically created form to the specified URL
     */
    standardSubmit: function( url, data /* , method */ ) {
        var count = $( '.app-js-standard-submit' ).length,
            formId = 'app-js-standard-submit-' + count;
            method = ( arguments.length > 2 )
                ? arguments[ 2 ]
                : 'POST';

        $( 'body' ).append( $( '<form/>', {
            id: formId,
            method: method,
            action: url
        }) );

        $form = $( '#' + formId );

        for ( i in data ) {
            $( '<input>' ).attr({
                type: 'hidden',
                name: i,
                value: data[ i ]
            }).appendTo( $form );
        }

        $form.submit();
    },

    /**
     * Serialize a form to be in object notation for the plugin
     */
    serializeForm: function( form ) {
        var $form = ( _.isString( form ) )
            ? $( form )
            : form;
        var data = $form.serializeArray();
        var ret = {};

        for ( i in data ) {
            ret[ data[ i ].name ] = data[ i ].value;
        };

        ret.ajax = true;

        return ret;
    },

    /**
     * Performs an ajax POST request
     */
    ajaxPost: function( url, data, callback /*, formOptions */ ) {
        var formOptions = ( arguments.length > 3 )
            ? arguments[ 3 ]
            : {};

        this._ajaxCall( url, data, callback, formOptions, 'POST' );
    },

    /**
     * Performs an ajax GET request
     */
    ajaxGet: function( url, data, callback /*, formOptions */ ) {
        var formOptions = ( arguments.length > 3 )
            ? arguments[ 3 ]
            : {};

        this._ajaxCall( url, data, callback, formOptions, 'GET' );
    },

    /**
     * Perform an ajax call (internal)
     */
    _ajaxCall: function( url, data, callback, formOptions, method ) {
        formOptions.type = method;
        formOptions.data = data;
        formOptions.postSuccess = callback;

        // If the URL starts with http:// then use it as is, otherwise add the
        // url to the base href and use that as the string
        var expression = /([hH][tT][tT][pP]|[hH][tT][tT][pP][sS]):\/\/(([A-Za-z0-9\.-])+(:[0-9]+)?\.[A-Za-z]{2,5}|((\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(:[0-9]+)?))/;
        var regex = new RegExp( expression );
        var options;

        if ( _.isUndefined( url ) || ! url.length ) {
            App.Log.error( "Attempted ajaxCall on an empty URL" );
            return false;
        }

        if ( url.match( regex ) ) {
            formOptions.url = url;
        }
        else {
            url = ( url.charAt( 0 ) == '/' )
                ? url.substr( 1 )
                : url;
            formOptions.url = App.rootPath + url;
        }

        if ( formOptions.serialized ) {
            formOptions.data.push({
                name: 'ajax',
                value: true
            });
        }
        else {
            formOptions.data.ajax = true;
        }

        options = this.getOptions( formOptions );

        $.ajax( options );
    }
});