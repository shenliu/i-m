/**
 * Cookie
 *
 * @namespace org.shen.Starfish
 * @module cookie
 * @requires string object
 */
starfish.cookie = function() {
    var default_options = {
        path: '/',
        domain: '',
        duration: 30,
        secure: '',
        doc: document,
        encode: true
    };

    /**
     * 构造函数
     *
     * @method cookie
     * @constructor
     * @param {String}  key  键
     * @param {Object}  options  选项
     *      options {
                path:       '/',        {String}    路径 '/'整个网站
                domain:     '',         {String}    域
                duration:   30,         {int}       到期时间 天数
                secure:     '',         {String}    安全 '' 或 'secure'
                document:   document,   {Element}   元素
                encode:     true        {Boolean}   编码
            }
     *
     */
    function cookie(key, options) {
        this.options = default_options;
        this.key = key;
        if (options) {
            options.each(function(item, key, object) {
                if (key in this.options) {
                    this.options[key] = item;
                }
            });
        }
    }

    cookie.prototype = {
        /**
         * @method write
         * @param {String}  value  cookie值
         * @return {Object}
         */
        write: function(value) {
            var val = [];
            if (this.options.encode) {
                val.push(encodeURIComponent(value));
            }
            if (this.options.domain) {
                val.push('; domain=' + this.options.domain);
            }
            if (this.options.path) {
                val.push('; path=' + this.options.path);
            }
            if (this.options.duration) {
                var date = new Date();
                date.setTime(date.getTime() + this.options.duration * 24 * 60 * 60 * 1000);
                val.push('; expires=' + date.toGMTString());
            }
            if (this.options.secure) {
                val.push('; secure');
            }
            this.options.doc.cookie = this.key + '=' + val.join("");
            return this;
        },

        /**
         * @method read
         */
        read: function() {
            var value = this.options.doc.cookie.match(new RegExp('(?:^|;)\\s*' + this.key.escapeRegExp() + '=([^;]*)'));
            return (value) ? decodeURIComponent(value[1]) : null;
        },

        /**
         * @method dispose
         */
        dispose: function() {
            new starfish.cookie(this.key, Object.merge({}, this.options, {duration: -1})).write('');
            return this;
        }
    };

    return cookie;
}();

/**
 * 写入cookie
 * @method write
 * @static
 * @param {String}  key      键
 * @param {String}  value    值
 * @param {Object}  options  选项
 * @return {Object} cookie对象
 */
starfish.cookie.write = function(key, value, options){
    return new starfish.cookie(key, options).write(value);
};

/**
 * 得到cookie
 *
 * @method read
 * @static
 * @param {String}  key  键
 * @return {Object} cookie对象
 */
starfish.cookie.read = function(key){
    return new starfish.cookie(key).read();
};

/**
 * 取消cookie
 *
 * @method dispose
 * @static
 * @param {String}  key  键
 * @param {Object}  options  选项(可选)
 * @return {Object} cookie对象
 */
starfish.cookie.dispose = function(key, options){
    return new starfish.cookie(key, options).dispose();
};
