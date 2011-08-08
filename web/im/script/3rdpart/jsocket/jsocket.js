/**
 * Construct
 * @param {function} onReady When the SWF is added the to document and ready for use
 * @param {function} onConnect Connection attempt finished (either succesfully or with an error)
 * @param {function} onData Socket received data from the remote host
 * @param {function} onClose Remote host disconnects the connection
 */
function JSocket(onReady, onConnect, onData, onClose) {
    this.onReady = onReady;
    this.onConnect = onConnect;
    this.onData = onData;
    this.onClose = onClose;

    this.id = "jSocket_" + (++JSocket.last_id);
    JSocket.sockets[this.id] = this;

    // Connection state
    this.connected = false;
}

/**
 * String defining the default swf file
 * @var String
 */
JSocket.swf = "script/3rdpart/jsocket/jsocket.swf";

/**
 * Object used as array with named keys to
 * keep references to the instantiated sockets
 * @var Object
 */
JSocket.sockets = {};

/**
 * Id used to generate a unique id for the embedded swf
 * @var int
 */
JSocket.last_id = 0;

/**
 * A nonexisting public flash object variable
 * This variable is used for testing access to the object.
 * @var String
 */
JSocket.variableTest = 'xt';

/**
 * Find the SWF in the DOM and return it
 * @return DOMNode
 */
JSocket.prototype.findSwf = function() {
    return document.getElementById(this.target);
};

/**
 * Insert the SWF into the DOM
 * @param {String} target The id of the DOMnode that will get replaced by the SWF
 * @param {String} swflocation The filepath to the SWF
 */
JSocket.prototype.setup = function(target, swflocation) {
    if (typeof(swfobject) == 'undefined')
        throw 'SWFObject not found! Please download from http://code.google.com/p/swfobject/';
    if (typeof(this.target) != 'undefined')
        throw 'Can only call setup on a jSocket Object once.';
    this.target = target;

    // Add the object to the dom
    return swfobject.embedSWF(
            (swflocation ? swflocation : JSocket.swf) + '?' + this.id,
            this.target,
            '0', // width
            '0', // height
            '9.0.0',
            'expressInstall.swf',
            // Flashvars
            false,
            // Params
            {'menu' : 'false'},
            // Attributes
            {}
    );

};

/**
 * Connect to the specified host on the specified port
 * @param {String} host Hostname or ip to connect to
 * @param {int} port Port to connect to on the given host
 */
JSocket.prototype.connect = function(host, port) {
    if (!this.movie)
        throw "jSocket isn't ready yet, use the onReady event";
    if (this.connected)
        this.movie.close();
    this.movie.connect(host, port);
};

/**
 * Close the current socket connection
 */
JSocket.prototype.close = function() {
    this.connected = false;
    if (this.movie)
        this.movie.close();
};

/**
 * Send data trough the socket to the server
 * @param {Object} data The data to be send to the sever
 */
JSocket.prototype.write = function(data) {
    this.assertConnected();
    this.movie.write(data);
};

/**
 * Make sure the socked is connected.
 * @throws {Object} Throws an exception when the socket isn't connected
 */
JSocket.prototype.assertConnected = function() {
    if (!this.connected || !this.movie)
        throw "JSocket not connected~~";
};

/**
 * Callback that the flash object calls using externalInterface
 * @param {String} name What callback is called
 * @param {String} id Id of the socket
 * @param {String} data Used for data and errors
 */
JSocket.flashCallback = function(name, id, data) {
    // Because the swf locks up untill the callback is done executing we want to get this over with asap!
    // http://www.calypso88.com/?p=25
    var f = function() {
        JSocket.executeFlashCallback(name, id, data);
    };
    setTimeout(f, 0);
};

/**
 * Execute the Callbacks
 * @param {String} name What callback is called
 * @param {String} id Id of the socket
 * @param {String} data Used for data and errors
 */
JSocket.executeFlashCallback = function(name, id, data) {
    var socket = JSocket.sockets[id];

    switch (name) {
        // Callback for the flash object to signal the flash file is loaded
        // triggers jsXMLSocket.onReady
        case 'init':
            var v = JSocket.variableTest;
            // Wait until we can actually set Variables in flash
            var f = function() {
                var err = true;
                try {
                    // Needs to be in the loop, early results might fail, when DOM hasn't updated yet
                    var m = socket.findSwf();
                    m.SetVariable(v, 't');
                    if ('t' != m.GetVariable(v))
                        throw null;
                    m.SetVariable(v, '');
                    // Store the found movie for later use
                    socket.movie = m;
                    err = false;
                } catch(e) {
                    setTimeout(f, 0);
                }
                // Fire the onReady event
                if (!err && typeof socket.onReady == "function")
                    socket.onReady();
            };
            setTimeout(f, 0);
            break;

        // Callback for the flash object to signal data is received
        // triggers jSocket.onData
        case 'data':
            if (typeof socket.onData == "function")
                socket.onData(data);
            break;

        // Callback for the flash object to signal the connection attempt is finished
        // triggers jSocket.onConnect
        case 'connect':
            socket.connected = true;
            if (typeof socket.onConnect == "function")
                socket.onConnect(true);
            break;

        // Callback for the flash object to signal the connection attempt is finished
        // triggers jSocket.onConnect
        case 'error':
            if (typeof socket.onConnect == "function")
                socket.onConnect(false, data);
            break;

        // Callback for the flash object to signal the connection was closed from the other end
        // triggers jSocket.onClose
        case 'close':
            socket.connected = false;
            if (typeof socket.onClose == "function")
                socket.onClose();
            break;

        default:
            throw "jSocket: unknown callback '" + name + "' used";
    }
};
