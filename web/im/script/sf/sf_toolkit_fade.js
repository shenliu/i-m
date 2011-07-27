/**
 * fade in/out
 *
 * @namespace org.shen.Starfish.toolkit
 * @submodule toolkit
 * @module fade
 */
starfish.toolkit.fade = function() {
    return {
        /**
         * fade it
         *
         * @method init
         * @param {String}  id      元素id
         * @param {int}     flag    -1 - 隐藏 / 1 - 显示
         * @param {int}     target  透明度0-100 (可选)
         */
        init: function(id, flag, target) {
            this.elem = $(id);
            clearInterval(this.si);
            this.target = target ? target : flag ? 100 : 0;
            this.flag = flag || -1;
            this.alpha = this.elem.style.opacity ? parseFloat(this.elem.style.opacity) * 100 : 0;
            this.si = setInterval(function() {
                starfish.toolkit.fade.tween();
            }, 20);
        },

        /**
         * @method tween
         */
        tween: function() {
            if (this.alpha == this.target) {
                clearInterval(this.si);
            } else {
                var value = Math.round(this.alpha + ((this.target - this.alpha) * .05)) + this.flag;
                starfish.web.css(this.elem, "opacity", value / 100);
                starfish.web.css(this.elem, "filter", 'alpha(opacity=' + value + ')');
                this.alpha = value;
            }
        }
    }
}();
