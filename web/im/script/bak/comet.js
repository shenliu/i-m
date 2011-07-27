var IM_SERVLET_URL = "http://10.0.0.99:8080/jsap/imchat?from=" + location.search.getParamter('userid');

var im_comet = {
    connection: null,
    iframediv: null,
    initialize: function() {
        if (starfish.client.browser.ie) {
            im_comet.connection = new ActiveXObject("htmlfile");
            im_comet.connection.open();
            im_comet.connection.write("<html>");
            im_comet.connection.write("<script>document.domain = '" + document.domain + "'");
            im_comet.connection.write("</html>");
            im_comet.connection.close();
            im_comet.iframediv = im_comet.connection.createElement("div");
            im_comet.connection.appendChild(im_comet.iframediv);
            im_comet.connection.parentWindow.im_comet = im_comet;
            im_comet.iframediv.innerHTML = "<iframe id='comet_iframe' src='" + IM_SERVLET_URL + "'></iframe>";
        } else if (starfish.client.browser.khtml) {
            im_comet.connection = document.createElement('iframe');
            im_comet.connection.setAttribute('id', 'comet_iframe');
            im_comet.connection.setAttribute('src', IM_SERVLET_URL);
            starfish.web.czz(im_comet.connection, {
                position: "absolute",
                left: "-100px",
                top: "-100px",
                height: "1px",
                width: "1px",
                visibility: "hidden"
            });
            document.body.appendChild(im_comet.connection);
        } else {
            im_comet.connection = document.createElement('iframe');
            im_comet.connection.setAttribute('id', 'comet_iframe');
            starfish.web.czz(im_comet.connection, {
                left: "-100px",
                top: "-100px",
                height: "1px",
                width: "1px",
                visibility: "hidden",
                display: 'none'
            });
            im_comet.iframediv = document.createElement('iframe');
            im_comet.iframediv.setAttribute('src', IM_SERVLET_URL);
            im_comet.connection.appendChild(im_comet.iframediv);
            document.body.appendChild(im_comet.connection);
        }
    },

    connect: function() {
        starfish.web.ajax.get(IM_SERVLET_URL + "&t=" + new Date(), function(text) {
            console.log("response...");
            delay(im_comet.connect, 5000);
        }, {});
    },

    initialize1: function() {
        console.log("init");
        im_comet.connect();
    },

    reload: function(data) {
        if (im_comet.connection != null) {
            im_comet.iframediv.setAttribute('src', IM_SERVLET_URL);
        }
        console.log("reload: " + data);
    },

    //添加用户
    login: function(data) {
        console.log("login: " + data);
    },

    //删除用户
    deleteUser: function(data) {
        console.log("delete: " + data);
    },

    //添加公共消息
    newMessage: function(data) {
        console.log("new msg: " + data);
    },

    //添加私人消息
    privateMessage: function(data) {
        console.log("private: " + data);
    },

    //退出
    loginout: function() {
        if (im_comet.connection != null) {
			im_comet.connection = null;
		}
    }
};

starfish.web.event.addEvent(window, 'unload', function() {
    //im_comet.loginout();
});
