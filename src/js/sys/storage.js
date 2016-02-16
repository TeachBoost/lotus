/**
 * Storage class
 *
 * Handles all data storage. Some is saved internally, other stuff
 * can be written to local storage.
 */
App.Storage = new Base();
App.Storage.extend({
    // Storage area
    trunk: [],

    init: function () {
        App.Log.debug( 'Storage library loaded', 'sys' );
    },

    /**
     * Save data to a key.
     */
    set: function ( key, value /*, useLocalStorage = false */ ) {
        var useLocalStorage = ( arguments.length > 2 )
            ? arguments[ 2 ]
            : false;

        if ( useLocalStorage ) {
            simpleStorage.set( key, value );
        }

        this.trunk[ key ] = value;

        return true;
    },

    /**
     * Gets a value by key.
     */
    get: function ( key /*, useLocalStorage = false, defaultVal = null */ ) {
        var useLocalStorage = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : false;
        var defaultVal = ( arguments.length > 2 )
            ? arguments[ 2 ]
            : null;

        if ( useLocalStorage ) {
            var returnVal = simpleStorage.get( key );

            if ( ! _.isUndefined( returnVal )
                && ! _.isNull( returnVal )
                && returnVal )
            {
                return returnVal;
            }
        }

        if ( _.has( this.trunk, key ) ) {
            return this.trunk[ key ];
        }

        return defaultVal;
    },

    /**
     * Delete a storage entry.
     */
    deleteKey: function ( key /*, useLocalStorage = false */ ) {
        var useLocalStorage = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : false;

        if ( useLocalStorage ) {
            simpleStorage.deleteKey( key );
        }

        if ( _.has( this.trunk, key ) ) {
            delete this.trunk[ key ];
        }

        return true;
    },

    /**
     * Flush all stored data.
     */
    flush: function ( /* includeLocalStorage = true, preserveKeys = [] */ ) {
        var includeLocalStorage = ( arguments.length > 0 )
            ? arguments[ 0 ]
            : true;
        var preserveKeys = ( arguments.length > 1 )
            ? arguments[ 1 ]
            : [];
        this.trunk = [];

        if ( includeLocalStorage ) {
            this.flushLocalStorage( preserveKeys );
        }
    },

    /**
     * Wrapper to flush local storage data.
     */
    flushLocalStorage: function () {
        var preserveKeys = ( arguments.length )
            ? arguments[ 0 ]
            : [],
            preservedData = {};

        for ( var i in preserveKeys ) {
            preservedData[ preserveKeys[ i ] ] = this.get( preserveKeys[ i ], true );
        }

        simpleStorage.flush();

        for ( var i in preservedData ) {
            this.set( i, preservedData[ i ], true );
        }
    }
});