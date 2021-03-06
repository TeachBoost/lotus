/**
 * Log class
 *
 * Configured for setting up document ready scripts and
 * page specific tasks.
 */
App.Log.extend({
    init: function () {
        App.Log.debug( 'Logging library loaded', 'sys' );
    },

    debug: function ( msg /* , prefix */ ) {
        var prefix, args;

        if ( App.Config.log_level >= 4 ) {
            prefix = ( arguments.length > 1 )
                ? this.getBenchmarkPrefix( arguments[ 1 ] )
                : ''
            args = ( _.isArray( msg ) ) ? msg : [ msg ];
            prefix.length && args.unshift( prefix );
            ( 'apply' in console.log )
                ? console.log.apply( console, args )
                : console.log( prefix, msg );
        }
    },

    info: function ( msg /* , prefix */ ) {
        var prefix, args;

        if ( App.Config.log_level >= 3 ) {
            prefix = ( arguments.length > 1 )
                ? this.getBenchmarkPrefix( arguments[ 1 ] )
                : '';
            args = ( _.isArray( msg ) ) ? msg : [ msg ];
            prefix.length && args.unshift( prefix );
            ( 'apply' in console.log )
                ? console.info.apply( console, args )
                : console.info( prefix, msg );
        }
    },

    warn: function ( msg /* , prefix */ ) {
        var prefix, args;

        if ( App.Config.log_level >= 2 ) {
            prefix = ( arguments.length > 1 )
                ? this.getBenchmarkPrefix( arguments[ 1 ] )
                : '';
            args = ( _.isArray( msg ) ) ? msg : [ msg ];
            prefix.length && args.unshift( prefix );
            ( 'apply' in console.log )
                ? console.warn.apply( console, args )
                : console.warn( prefix, msg );
        }
    },

    error: function ( msg /*, prefix, data */ ) {
        var prefix = '',
            data = {},
            args;

        if ( App.Config.log_level >= 1 ) {
            if ( arguments.length > 1 ) {
                if ( _.isString( arguments[ 1 ] ) ) {
                    prefix = this.getBenchmarkPrefix( arguments[ 1 ] );
                }
                if ( _.isObject( arguments[ 1 ] ) ) {
                    data = arguments[ 1 ];
                }
            }

            if ( arguments.length == 3 ) {
                data = arguments[ 2 ];
            }

            args = ( _.isArray( msg ) ) ? msg : [ msg ];
            prefix.length && args.unshift( prefix );
            data.message = msg;
            ( 'apply' in console.log )
                ? console.error.apply( console, args )
                : console.error( prefix, msg );
        }
    },

    startBenchmark: function ( key ) {
        App.benchmark( key );
    },

    stopBenchmark: function ( key ) {
        App.benchmark( key, true );
    },

    getBenchmarkPrefix: function ( key ) {
        return '[' + key + ' ' + App.benchmark( key ) + ']';
    }
});