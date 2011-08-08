/**
 * 生成 window的基本框架
 *
 *  整体窗口
 <div class="im_window">
 外边框
 <div class="im_window_outer">
 内边框
 <div class="im_window_inner">
 窗口边框
 <div class="window_bg_container">
 <div class="window_bg window_center"></div>
 <div class="window_bg window_t"></div>
 <div class="window_bg window_rt"></div>
 <div class="window_bg window_r"></div>
 <div class="window_bg window_rb"></div>
 <div class="window_bg window_b"></div>
 <div class="window_bg window_lb"></div>
 <div class="window_bg window_l"></div>
 <div class="window_bg window_lt"></div>
 </div>
 内容
 <div class="im_window_content">
 内容标题栏
 <div class="im_window_content_titleBar">
 内容标题栏 按钮栏
 <div class="im_window_content_titleBar_buttonBar">
 *******************
 </div>
 内容标题栏标题内容
 <div class="window_title titleText">
 ******************
 </div>
 </div>
 内容主体 边框
 <div class="im_window_body_outer">
 <div class="win_body">
 ******************
 </div>
 </div>
 </div>
 改变大小用
 <div class="window_resize_t user_select_none"></div>
 <div class="window_resize_rt user_select_none"></div>
 <div class="window_resize_r user_select_none"></div>
 <div class="window_resize_rb user_select_none"></div>
 <div class="window_resize_b user_select_none"></div>
 <div class="window_resize_lb user_select_none"></div>
 <div class="window_resize_l user_select_none"></div>
 <div class="window_resize_lt user_select_none"></div>
 </div>
 </div>
 </div>

 @param {Object}  options  选项: 样式 id etc.
 @return {Document}  整体window DOM
 */
function im_window(options) {
    var web = starfish.web;

    // 整体窗口
    var im_window = web.dom.elem('div');
    im_window.className = 'im_window';

    web.czz(im_window, options.clazz);

    im_window.id = options.id || '';

    web.dom.insert(document.body, im_window);

    // 外边框
    var im_window_outer = web.dom.elem('div');
    im_window_outer.className = 'im_window_outer';

    // 内边框
    var im_window_inner = web.dom.elem('div');
    im_window_inner.className = 'im_window_inner';

    // 窗口边框
    var window_bg_container = web.dom.elem('div');
    window_bg_container.className = 'window_bg_container';

    // 外边框
    var temp = web.dom.elem('div');
    temp.className = 'window_bg window_center';
    web.dom.insert(window_bg_container, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_bg window_t';
    web.dom.insert(window_bg_container, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_bg window_rt';
    web.dom.insert(window_bg_container, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_bg window_r';
    web.dom.insert(window_bg_container, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_bg window_rb';
    web.dom.insert(window_bg_container, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_bg window_b';
    web.dom.insert(window_bg_container, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_bg window_lb';
    web.dom.insert(window_bg_container, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_bg window_l';
    web.dom.insert(window_bg_container, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_bg window_lt';
    web.dom.insert(window_bg_container, temp);

    // 内容
    var im_window_content = web.dom.elem('div');
    im_window_content.className = 'im_window_content';

    // 内容标题栏
    var im_window_content_titleBar = web.dom.elem('div');
    im_window_content_titleBar.className = 'im_window_content_titleBar';

    // 内容标题栏 按钮栏
    var im_window_content_titleBar_buttonBar = web.dom.elem('div');
    im_window_content_titleBar_buttonBar.className = 'im_window_content_titleBar_buttonBar';

    // 右上角按钮
    var window_close = web.dom.elem('a');
    window_close.className = 'ui_button window_action_button window_close';
    window_close.title = '关闭';
    window_close.href = '#';
    web.dom.insert(im_window_content_titleBar_buttonBar, window_close);

    var window_max = web.dom.elem('a');
    window_max.className = 'ui_button window_action_button window_max';
    window_max.title = '最大化';
    window_max.href = '#';
    web.dom.insert(im_window_content_titleBar_buttonBar, window_max);

    var window_restore = web.dom.elem('a');
    window_restore.className = 'ui_button window_action_button window_restore';
    window_restore.title = '还原';
    window_restore.href = '#';
    web.dom.insert(im_window_content_titleBar_buttonBar, window_restore);

    var window_min = web.dom.elem('a');
    window_min.className = 'ui_button window_action_button window_min';
    window_min.title = '最小化';
    window_min.href = '#';
    web.dom.insert(im_window_content_titleBar_buttonBar, window_min);

    var window_fullscreen = web.dom.elem('a');
    window_fullscreen.className = 'ui_button window_action_button window_fullscreen';
    window_fullscreen.title = '全屏';
    window_fullscreen.href = '#';
    web.dom.insert(im_window_content_titleBar_buttonBar, window_fullscreen);

    var window_restore_full = web.dom.elem('a');
    window_restore_full.className = 'ui_button window_action_button window_restore_full';
    window_restore_full.title = '退出全屏';
    window_restore_full.href = '#';
    web.dom.insert(im_window_content_titleBar_buttonBar, window_restore_full);

    // 内容标题栏标题内容
    var window_title = web.dom.elem('div');
    window_title.className = 'window_title titleText';

    web.dom.insert(im_window_content_titleBar, im_window_content_titleBar_buttonBar);
    web.dom.insert(im_window_content_titleBar, window_title);

    // 最大化/最小化
    if (options.id !== "im_window") {
        web.show(window_max); // 显示最大化按钮
        web.event.addEvent(window_max, 'click', function() {
            _max_restore(im_window);
        });

        web.event.addEvent(window_restore, 'click', function() {
            _max_restore(im_window);
        });

        // 双击title栏
        web.event.addEvent(window_title, 'dblclick', function() {
            _max_restore(im_window);
        });
    }

    // 内容主体 边框
    var im_window_body_outer = web.dom.elem('div');
    im_window_body_outer.className = 'im_window_body_outer';

    // 内容主体
    var win_body = web.dom.elem('div');
    win_body.className = 'win_body';

    web.dom.insert(im_window_body_outer, win_body);

    web.dom.insert(im_window_content, im_window_content_titleBar);
    web.dom.insert(im_window_content, im_window_body_outer);

    web.dom.insert(im_window_inner, window_bg_container);
    web.dom.insert(im_window_inner, im_window_content);

    // 改变大小用
    temp = web.dom.elem('div');
    temp.className = 'window_resize_t user_select_none';
    web.dom.insert(im_window_inner, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_resize_rt user_select_none';
    web.dom.insert(im_window_inner, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_resize_r user_select_none';
    web.dom.insert(im_window_inner, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_resize_rb user_select_none';
    web.dom.insert(im_window_inner, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_resize_b user_select_none';
    web.dom.insert(im_window_inner, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_resize_lb user_select_none';
    web.dom.insert(im_window_inner, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_resize_l user_select_none';
    web.dom.insert(im_window_inner, temp);

    temp = web.dom.elem('div');
    temp.className = 'window_resize_lt user_select_none';
    web.dom.insert(im_window_inner, temp);

    web.dom.insert(im_window_outer, im_window_inner);
    web.dom.insert(im_window, im_window_outer);

    // 修补 im_window_body_outer的border出界问题
    web.css(im_window_body_outer, 'width', (web.window.fullWidth(im_window_content) - 2) + 'px');

    // 修补 im_window_body_outer 的高度问题
    web.css(im_window_outer, 'height', (parseInt(web.css(im_window, 'height')) - 20) + 'px');
    web.css(im_window_body_outer, 'height', (web.window.fullHeight(im_window_content) - 30) + 'px');

    // 移动事件
    web.fx.dd.init(im_window_content_titleBar, im_window, null, null, null, null);

    // resize
    im_resize(im_window);

    // 该窗口在最上层显示
    web.event.addEvent(im_window, 'click', function() {
        if (this !== IM_CONSTANT.last_chatwindow) {
            web.css(this, 'zIndex', 30);
            if (IM_CONSTANT.last_chatwindow) {
                web.css(IM_CONSTANT.last_chatwindow, 'zIndex', 25);
            }
            IM_CONSTANT.last_chatwindow = this;
        }
    });

    /**
     * 窗口最大化/还原
     * @param im_window
     */
    function _max_restore(im_window) {
        var top = parseInt(web.css(im_window, 'top'));
        var left = parseInt(web.css(im_window, 'left'));
        var width = parseInt(web.css(im_window, 'width'));
        var height = parseInt(web.css(im_window, 'height'));
        if (top > 1 && left > 1) {
            im_window.setAttribute('old_top', top);
            im_window.setAttribute('old_left', left);
            im_window.setAttribute('old_width', width);
            im_window.setAttribute('old_height', height);

            web.css(im_window, 'top', '0px');
            web.css(im_window, 'left', '0px');
            var screen_w = web.window.docWidth();
            var screen_h = web.window.docHeight();
            web.css(im_window, 'width', (screen_w - 1) + 'px');
            web.css(im_window, 'height', (screen_h - 1) + 'px');
            web.hide(window_max);
            web.show(window_restore);
        } else {
            web.css(im_window, 'top', im_window.getAttribute('old_top') + 'px');
            web.css(im_window, 'left', im_window.getAttribute('old_left') + 'px');
            web.css(im_window, 'width', im_window.getAttribute('old_width') + 'px');
            web.css(im_window, 'height', im_window.getAttribute('old_height') + 'px');
            web.hide(window_restore);
            web.show(window_max);
        }
        var content = web.className('im_window_content', im_window)[0];
        var outer = web.className('im_window_body_outer', im_window)[0];

        var fullwidth = web.window.fullWidth(content) - 2;
        web.css(outer, 'width', fullwidth + 'px');

        var win_body = web.className('win_body', im_window)[0];
        web.css(win_body, 'width', fullwidth + 'px');

        var _h = web.className('im_window_outer', im_window)[0];
        web.css(_h, 'height', (parseInt(web.css(im_window, 'height')) - 20) + 'px');
        web.css(outer, 'height', (web.window.fullHeight(content) - 30) + 'px');
        im_fix_chat_size(outer);
    }

    return im_window;
}
