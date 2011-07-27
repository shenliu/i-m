var im_aflax = {
    init: function() {
        return new AFLAX("aflax.swf");
    },

    connection: null,

    join: function(o) {
        im_aflax.connection = new AFLAX.Socket(o, IM_AFLAX_HOST, IM_AFLAX_PORT,
                "im_aflax.connect", "im_aflax.receive", "im_aflax.close");
    },

    connect: function(val) {
        console.info(val);
    },

    receive: function(str) {
        console.info(str);
    },

    close: function() {
        console.info("the connection is already closed");
    }
};
