starfish.web.fx.animate = function() {
    return {
        animator: function() {
            var self = this;
            var intervalRate = 24;
            this.tweenTypes = {
                'default' : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
                'blast' : [12, 12, 11, 10, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
                'linear' : [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
            };
            this.queue = [];
            this.queueHash = [];
            this.active = false;
            this.timer = null;
            this.createTween = function(start, end, type) {
                // return array of tween coordinate data (start->end)
                type = type || 'default';
                var tween = [start];
                var tmp = start;
                var diff = end - start;
                var x = self.tweenTypes[type].length;
                for (var i = 0; i < x; i++) {
                    tmp += diff * self.tweenTypes[type][i] * 0.01;
                    tween[i] = {};
                    tween[i].data = tmp;
                    tween[i].event = null;
                }
                return tween;
            };

            this.enqueue = function(o, fMethod, fOnComplete) {
                // add object and associated methods to animation queue
                self.queue.push(o);
                o.active = true;
            };

            this.animate = function() {
                var active = 0;
                for (var i = 0, j = self.queue.length; i < j; i++) {
                    if (self.queue[i].active) {
                        self.queue[i].animate();
                        active++;
                    }
                }
                if (active == 0 && self.timer) {
                    // all animations finished
                    self.stop();
                } else {
                    // ~~
                }
            };

            this.start = function() {
                if (self.timer || self.active) {
                    return false;
                }
                self.active = true;
                self.timer = setInterval(self.animate, intervalRate);
            };

            this.stop = function() {
                clearInterval(self.timer);
                self.timer = null;
                self.active = false;
                self.queue = [];
            };

            this.hide = function(elem, type) {
                (function() {
                    var len = self.tweenTypes[type].length;
                    setTimeout(function() {
                        starfish.web.css(elem, "display", "none");
                    }, intervalRate * (len + 10));
                })();
            };

        },

        animation: function(animator, oParams) {
            var self = this;
            if (typeof oParams.tweenType == 'undefined') {
                oParams.tweenType = 'default';
            }
            this.ontween = (oParams.ontween || null);
            this.oncomplete = (oParams.oncomplete || null);
            this.tween = animator.createTween(oParams.from, oParams.to,
                    oParams.tweenType);
            this.frameCount = animator.tweenTypes[oParams.tweenType].length;
            this.frame = 0;
            this.active = false;

            this.animate = function() {
                // generic animation method
                if (self.active) {
                    if (self.ontween && self.tween[self.frame]) {
                        self.ontween(self.tween[self.frame].data);
                    }
                    if (self.frame++ >= self.frameCount - 1) {
                        self.active = false;
                        self.frame = 0;
                        if (self.oncomplete) {
                            self.oncomplete();
                        }
                        return false;
                    }
                    return true;
                }
                return false;
            };

            this.start = function() {
                animator.enqueue(self, self.animate, self.oncomplete);
                if (!animator.active) {
                    animator.start();
                }
            };

            this.stop = function() {
                self.active = false;
            };

        },

        toggle: function(elem, opts) {
            var web = starfish.web;
            var animator = new web.fx.animate.animator();

            var animations = [];
            var animationCount = 0;

            function nextAnimation() {
                if (animations[animationCount]) {
                    animations[animationCount].start();
                    animationCount++;
                }
            }

            // 改变width
            function chgWidth(value) {
                web.css(elem, "width", value + "px");
            }

            // 改变height
            function chgHeight(value) {
                web.css(elem, "height", value + "px");
            }

            // 改变left
            function moveHor(value) {
                web.css(elem, "left", value + "px");
            }

            // 改变top
            function moveVer(value) {
                web.css(elem, "top", value + "px");
            }

            // 隐藏elem
            function hideElem() {
                web.css(elem, "display", "none");
            }

            function makeAnimate() {
                // to size
                var to_w = opts.to ? opts.to[0] : -1;
                var to_h = opts.to ? opts.to[1] : -1;

                // slide in
                if (web.css(elem, "display") === "none") {
                    to_w = web.attr(elem, "__last__")[0];
                    to_h = web.attr(elem, "__last__")[1];
                    delete elem["__last__"];

                    // 显示元素
                    web.css(elem, "display", "block");
                }

                // now size
                var now_w = web.window.fullWidth(elem);
                var now_h = web.window.fullHeight(elem);

                var isSlideOut = false;
                // slide out
                if (to_w === 0 || to_h === 0 || to_w === -1 || to_h === -1) {
                    web.attr(elem, "__last__", [now_w, now_h]);
                    isSlideOut = true;
                }

                var type = opts.type ? opts.type : "default";

                // width/horizontal
                animations.push(new web.fx.animate.animation(animator, {
                    from: now_w,
                    to: to_w,
                    tweenType: type,
                    ontween: chgWidth,
                    oncomplete: function() {
                        nextAnimation();
                        nextAnimation();
                        (function() { // slide out, hide elem
                            if (isSlideOut) {
                                animator.hide(elem, type);
                            }
                        })();
                    }
                }));

                // height/vertical
                animations.push(new web.fx.animate.animation(animator, {
                    from: now_h,
                    to: to_h,
                    tweenType: type,
                    ontween: chgHeight
                }));
                nextAnimation(); // start the sequence
            }
            makeAnimate(); // start it~~!
        }
    }
}();
