/**
 * 提示层
 *
 * @namespace org.shen.Starfish.toolkit
 * @submodule toolkit
 * @module box
 * @requires window event dom fade
 */
starfish.toolkit.box = function() {
    var main_div, mask_div, cont_div, close_div, vc_div = null;
    var opts = null;

    return {
        show: function(o) {
            /**
             *  Parameters include (tag – description (type) – default):
             */
            opts = {
                opacity: 70,    // set the opacity of the mask from 0-100 (int) - 70
                close: 1,       // toggle close button (bool) - true
                animate: 1,     // toggle animation (bool) - true
                fixed: 1,       // toggle fixed position vs static (bool) - true
                mask: 1,        // toggle mask display (bool) - true
                maskid: '',     // ID of mask div for style overriding purposes (string) - ''
                boxid: '',      // ID of box div for style overriding purposes (string) - ''
                topsplit: 2,    // 1/x where x is the denominator in the split from the top (int) - 2
                url: 0,         // path for AJAX call (string) - false
                post: 0,        // post variable string, used in conjunction with url (string) - false
                height: 0,      // preset height (int) - false
                width: 0,       // preset width (int) - false
                html: 0,        // HTML content for window (string) - false
                iframe: 0,      // URL for embedded iframe (string) - false
                image: '',      // graphic path (string) - false
                openjs: '',     // generic function executed on open (string) - null
                closejs: '',    // generic function executed on close (string) - null
                autohide: 0,    // number of seconds to wait until auto-hiding (int) - false
                top: undefined, // absolute pixels from top (int) - null
                left: undefined // absolute pixels from left (int) - null
            };

            for (var s in o) {
                opts[s] = o[s];
            }

            if (!vc_div) {
                main_div = document.createElement('div'); // main div
                main_div.className = 'tbox';

                vc_div = document.createElement('div'); // vice-div
                vc_div.className = 'tinner';

                cont_div = document.createElement('div'); // 内容div
                cont_div.className = 'tcontent';

                mask_div = document.createElement('div'); // mask
                mask_div.className = 'tmask';

                close_div = document.createElement('div'); // 关闭按钮
                close_div.className = 'tclose';
                close_div.v = 0;
                document.body.appendChild(mask_div);
                document.body.appendChild(main_div);
                main_div.appendChild(vc_div);
                vc_div.appendChild(cont_div);
                mask_div.onclick = close_div.onclick = starfish.toolkit.box.hide;
                window.onresize = starfish.toolkit.box.resize;
            } else {
                main_div.style.display = 'none';
                clearTimeout(vc_div.autohide);
                if (close_div.v) {
                    vc_div.removeChild(close_div);
                    close_div.v = 0;
                }
            }
            vc_div.id = opts.boxid;
            mask_div.id = opts.maskid;
            //main_div.style.position = opts.fixed ? 'fixed' : 'absolute';
            if (opts.html && !opts.animate) {
                vc_div.style.backgroundImage = 'none';
                cont_div.innerHTML = opts.html;
                cont_div.style.display = '';
                vc_div.style.width = opts.width ? opts.width + 'px' : 'auto';
                vc_div.style.height = opts.height ? opts.height + 'px' : 'auto';
            } else {
                cont_div.style.display = 'none';
                if (!opts.animate && opts.width && opts.height) {
                    vc_div.style.width = opts.width + 'px';
                    vc_div.style.height = opts.height + 'px';
                } else {
                    vc_div.style.width = vc_div.style.height = '100px';
                }
            }
            if (opts.mask) {
                this.mask();
                this.alpha(mask_div, 1, opts.opacity);
            } else {
                this.alpha(main_div, 1, 100);
            }
            if (opts.autohide) {
                vc_div.autohide = delay(starfish.toolkit.box.hide, 1000 * opts.autohide);
            } else {
                document.onkeyup = starfish.toolkit.box.esc;
            }
        },

        /**
         * @method fill
         * @param {String}  url         url或html
         * @param {String}  type        url / iframe / graphic / string
         * @param {String}  post        post请求的名值对
         * @param {Boolean} animate     是否为 动画
         * @param {int}     width       宽度
         * @param {int}     height      高度
         */
        fill: function(url, type, post, animate, width, height) {
            if (type) {
                if (opts.image) {
                    var img = new Image();
                    img.onload = function() {
                        width = width || img.width;
                        height = height || img.height;
                        starfish.toolkit.box.psh(img, animate, width, height);
                    };
                    img.src = opts.image;
                } else if (opts.iframe) {
                    this.psh('<iframe src="' + opts.iframe + '" width="' + opts.width + '" frameborder="0" height="'
                            + opts.height + '"></iframe>', animate, width, height);
                } else {
                    var request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
                    request.onreadystatechange = function() {
                        if (request.readyState == 4 && request.status == 200) {
                            vc_div.style.backgroundImage = '';
                            starfish.toolkit.box.psh(request.responseText, animate, width, height);
                        }
                    };
                    if (post) {
                        request.open('POST', url, true);
                        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                        request.send(post);
                    } else {
                        request.open('GET', url, true);
                        request.send(null);
                    }
                }
            } else {
                this.psh(url, animate, width, height);
            }
        },

        /**
         * @method psh
         * @param {Object/String}  cont  node / string
         * @param {Boolean} animate     是否为 动画
         * @param {int}     width       宽度
         * @param {int}     height      高度
         */
        psh: function(cont, animate, width, height) {
            if (typeof cont == 'object') {
                cont_div.appendChild(cont);
            } else {
                cont_div.innerHTML = cont;
            }
            var x = vc_div.style.width, y = vc_div.style.height;
            if (!width || !height) {
                vc_div.style.width = width ? width + 'px' : '';
                vc_div.style.height = height ? height + 'px' : '';
                cont_div.style.display = '';
                if (!height) {
                    height = parseInt(cont_div.offsetHeight);
                }
                if (!width) {
                    width = parseInt(cont_div.offsetWidth);
                }
                cont_div.style.display = 'none';
            }
            vc_div.style.width = x;
            vc_div.style.height = y;
            this.size(width, height, animate);
        },

        esc: function(e) {
            e = e || window.event;
            if (e.keyCode == 27) { // esc
                starfish.toolkit.box.hide();
            }
        },

        /**
         * main div 隐藏
         *
         * @method hide
         */
        hide: function() {
            starfish.toolkit.box.alpha(main_div, -1, 0, 3);
            document.onkeypress = null;
            if (opts.closejs) {
                opts.closejs();
            }
        },

        /**
         * 窗口大小改变时触发
         *
         * @method resize
         */
        resize: function() {
            starfish.toolkit.box.pos();
            starfish.toolkit.box.mask();
        },

        mask: function() {
            mask_div.style.height = this.total(1) + 'px';
            mask_div.style.width = this.total(0) + 'px';
        },

        /**
         *  定位 main div
         */
        pos: function() {
            var t;
            if (type(opts.top) != 'undefined') {
                t = opts.top;
            } else {
                t = (this.height() / opts.topsplit) - (main_div.offsetHeight / 2);
                t = t < 20 ? 20 : t;
            }
            if (!opts.fixed && !opts.top) {
                t += this.top();
            }
            main_div.style.top = t + 'px';
            main_div.style.left = typeof opts.left != 'undefined' ? opts.left + 'px' : (this.width() / 2) - (main_div.offsetWidth / 2) + 'px';
        },

        /**
         * 设置透明度
         *
         * @method alpha
         * @param {Element} elem        元素
         * @param {int}     display     1 - 显示 / -1 - 隐藏
         * @param {int}     opacity     透明度
         */
        alpha: function(elem, display, opacity) {
            clearInterval(elem.ai);
            if (display == 1) {
                elem.style.opacity = 0;
                elem.style.filter = 'alpha(opacity=0)';
                elem.style.display = 'block';
                starfish.toolkit.box.pos();
            }
            elem.ai = setInterval(function() {
                starfish.toolkit.box.transAlpha(elem, opacity, display);
            }, 20);
        },

        /**
         * 渐变透明度
         *
         * @method transAlpha
         * @param {Element} elem        元素
         * @param {int}     opacity     透明度
         * @param {int}     display     1 - 显示 / -1 - 隐藏
         */
        transAlpha: function(elem, opacity, display) {
            var o = Math.round(elem.style.opacity * 100);
            if (o == opacity) {
                clearInterval(elem.ai);
                if (display == -1) {
                    elem.style.display = 'none';
                    elem == main_div ? starfish.toolkit.box.alpha(mask_div, -1, 0, 2) : cont_div.innerHTML = vc_div.style.backgroundImage = '';
                } else {
                    if (elem == mask_div) {
                        this.alpha(main_div, 1, 100);
                    } else {
                        main_div.style.filter = '';
                        starfish.toolkit.box.fill(opts.html || opts.url, opts.url || opts.iframe || opts.image,
                                opts.post, opts.animate, opts.width, opts.height);
                    }
                }
            } else {
                var n = opacity - Math.floor(Math.abs(opacity - o) * .5) * display;
                elem.style.opacity = n / 100;
                elem.style.filter = 'alpha(opacity=' + n + ')';
            }
        },

        /**
         * @method size
         * @param {int}     width       宽度
         * @param {int}     height      高度
         * @param {Boolean} animate     是否为 动画
         */
        size: function(width, height, animate) {
            if (animate) {
                clearInterval(vc_div.si);
                var wd = parseInt(vc_div.style.width) > width ? -1 : 1, hd = parseInt(vc_div.style.height) > height ? -1 : 1;
                vc_div.si = setInterval(function() {
                    starfish.toolkit.box.transSize(width, wd, height, hd);
                }, 20);
            } else {
                vc_div.style.backgroundImage = 'none';
                if (opts.close) {
                    vc_div.appendChild(close_div);
                    close_div.v = 1;
                }
                vc_div.style.width = width + 'px';
                vc_div.style.height = height + 'px';
                cont_div.style.display = '';
                this.pos();
                if (opts.openjs) {
                    opts.openjs();
                }
            }
        },

        /**
         * @method transSize
         * @param {int}     width       宽度
         * @param {int}     wd          1 - 放大 / -1 - 缩小
         * @param {int}     height      高度
         * @param {int}     hd          1 - 放大 / -1 - 缩小
         */
        transSize: function(width, wd, height, hd) {
            var cw = parseInt(vc_div.style.width), ch = parseInt(vc_div.style.height);
            if (cw == width && ch == height) {
                clearInterval(vc_div.si);
                vc_div.style.width = (parseInt(vc_div.style.width) + 10) + 'px';
                vc_div.style.backgroundImage = 'none';
                cont_div.style.display = 'block';
                if (opts.close) {
                    vc_div.appendChild(close_div);
                    close_div.v = 1;
                }
                if (opts.openjs) {
                    opts.openjs();
                }
            } else {
                if (cw != width) {
                    vc_div.style.width = (width - Math.floor(Math.abs(width - cw) * .6) * wd) + 'px';
                }
                if (ch != height) {
                    vc_div.style.height = (height - Math.floor(Math.abs(height - ch) * .6) * hd) + 'px';
                }
                this.pos();
            }
        },

        top: function() {
            return document.documentElement.scrollTop || document.body.scrollTop;
        },

        width: function() {
            return self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        },

        height: function() {
            return self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        },

        /**
         * 高度/宽度
         *
         * @method total
         * @param {int}   d     1 - height / 0 - width
         */
        total: function(d) {
            var b = document.body, e = document.documentElement;
            return d ? Math.max(Math.max(b.scrollHeight, e.scrollHeight), Math.max(b.clientHeight, e.clientHeight)) :
                    Math.max(Math.max(b.scrollWidth, e.scrollWidth), Math.max(b.clientWidth, e.clientWidth));
        }
    }
}();
