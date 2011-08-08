/**
 * im窗口改变大小
 * @param {Element}  windows  窗口
 */
var im_resize = function(windows) {
    var web = starfish.web;

    var resizing = false;
    var step = 10; // 最小移动量

    var left = web.window.pageX(windows);
    var top = web.window.pageY(windows);
    var width = web.window.getWidth(windows);
    var height = web.window.getHeight(windows);
    var right = left + width;
    var bottom = top + height;

    var ex, ey;

    var which = null; // 八个方向其中之一

    var w_t = web.className('window_resize_t', windows)[0];    // top
    var w_rt = web.className('window_resize_rt', windows)[0];  // right top
    var w_r = web.className('window_resize_r', windows)[0];    // right
    var w_rb = web.className('window_resize_rb', windows)[0];  // right bottom
    var w_b = web.className('window_resize_b', windows)[0];    // bottom
    var w_lb = web.className('window_resize_lb', windows)[0];  // left bottom
    var w_l = web.className('window_resize_l', windows)[0];    // left
    var w_lt = web.className('window_resize_lt', windows)[0];  // left top

    var content = web.className('im_window_content', windows)[0];
    var outer = web.className('im_window_body_outer', windows)[0];

    web.event.addEvent(document, 'mousedown', function(e) {
        ex = web.window.mouseX(e);
        ey = web.window.mouseY(e);
        im_resize_mouse_down(e);
    });

    web.event.addEvent(document, 'mousemove', function(e) {
        im_resize_mouse_move(e);
    });

    web.event.addEvent(document, 'mouseup', function(e) {
        im_resize_mouse_up(e);
    });

    function loc() {
        left = web.window.pageX(windows);
        top = web.window.pageY(windows);
        width = web.window.getWidth(windows);
        height = web.window.getHeight(windows);
        right = left + width;
        bottom = top + height;
    }

    function im_resize_mouse_down(e) {
        var src = e.target || e.srcElement;
        if (src === w_t) {
            which = 'n';
            resizing = true;
        } else if (src === w_rt) {
            which = 'ne';
            resizing = true;
        } else if (src === w_r) {
            which = 'e';
            resizing = true;
        } else if (src === w_rb) {
            which = 'se';
            resizing = true;
        } else if (src === w_b) {
            which = 's';
            resizing = true;
        } else if (src === w_lb) {
            which = 'sw';
            resizing = true;
        } else if (src === w_l) {
            which = 'w';
            resizing = true;
        } else if (src === w_lt) {
            which = 'nw';
            resizing = true;
        }
    }

    function im_resize_mouse_move(e) {
        if (resizing) {
            var dx = web.window.mouseX(e) - ex;
            var dy = web.window.mouseY(e) - ey;

            if (which.indexOf("w") !== -1) {
                left += dx;
            } else if (which.indexOf("e") !== -1) {
                right += dx;
            }

            if (which.indexOf("n") !== -1) {
                top += dy;
            } else if (which.indexOf("s") !== -1) {
                bottom += dy;
            }

            if (right - left > step) {
                var w = right - left;
                web.css(windows, 'left', left + 'px');
                web.css(windows, 'width', w < IM_CONSTANT.width_min ? IM_CONSTANT.width_min : w + 'px');

                var fullwidth = web.window.fullWidth(content) - 2;
                web.css(outer, 'width', fullwidth + 'px');

                var win_body = web.className('win_body', windows)[0];
                web.css(win_body, 'width', fullwidth + 'px');
            }

            if (bottom - top > step) {
                var h = bottom - top;
                web.css(windows, 'top', top + 'px');
                web.css(windows, 'height', h < IM_CONSTANT.height_min ? IM_CONSTANT.height_min : h + 'px');

                // 修补 im_window_body_outer 的高度问题
                var _h = web.className('im_window_outer', windows)[0];
                web.css(_h, 'height', (parseInt(web.css(windows, 'height')) - 20) + 'px');
                web.css(outer, 'height', (web.window.fullHeight(content) - 30) + 'px');
            }

            if (windows.id && windows.id === "im_window") {
                im_fix_mainTabContainer_height(windows);
            } else {
                im_fix_chat_size(outer);
            }

            ex += dx;
            ey += dy;
        } else {
            loc();
        }
    }

    function im_resize_mouse_up(e) {
        if (resizing) {
            resizing = false;
        }
    }

};

/**
 * 确定 main_tab_container 的高度,使得可以出现纵向滚动条
 *
 * @param {Element}  parent  相对的节点 (className可能找到相同的节点, 此参数指定相对于该参数节点下的className元素)
 */
function im_fix_mainTabContainer_height(parent) {
    var web = starfish.web;
    var im_window_body_outer = web.className('im_window_body_outer', parent)[0];
    var h = web.window.fullHeight(im_window_body_outer);

    var my_panel = web.className('my_panel', parent)[0];
    var h1 = web.window.fullHeight(my_panel);

    var my_toolbar = web.className('my_toolbar', parent)[0];
    var h2 = web.window.fullHeight(my_toolbar);
    h2 = 0; // 现在不包括 my_toolbar

    var main_searchBar = web.className('main_searchBar', parent)[0];
    var h3 = web.window.fullHeight(main_searchBar);

    var main_tab = web.className('main_tab', parent)[0];
    var h4 = web.window.fullHeight(main_tab);

    var height = h - h1 - h2 - h3 - h4;

    var main_tab_container = web.className('main_tab_container', parent)[0];
    web.css(main_tab_container, 'height', height + 'px');

    var main_tab_buddy_panel = web.className('main_tab_buddy_panel', parent)[0];
    var main_tab_group_panel = web.className('main_tab_group_panel', parent)[0];
    var main_tab_recent_panel = web.className('main_tab_recent_panel', parent)[0];
    var buddy_list = web.className('buddy_list')[0];

    height -= 3;
    web.css(main_tab_buddy_panel, 'height', height + 'px', parent);
    web.css(main_tab_group_panel, 'height', height + 'px', parent);
    web.css(main_tab_recent_panel, 'height', height + 'px', parent);
    web.css(buddy_list, 'height', height + 'px');

    // group
    var group_box = web.className('group_box')[0];
    var group_tab = web.className('group_tab')[0];
    var main_tab_group_panel_height = parseInt(web.css(main_tab_group_panel, 'height'));
    var group_tab_height = parseInt(web.css(group_tab, 'height'));
    web.css(group_box, 'height', (main_tab_group_panel_height - group_tab_height) + 'px');

    // recent
}

/**
 * 改变对话窗口时相应改变 chat_body_chatboard 的高度
 * @param  {Document}  elem
 */
function im_fix_chat_size(elem) {
    var web = starfish.web;

    var win_body = web.className('win_body', elem)[0];
    var fullwidth = web.window.fullWidth(win_body);

    // 修补 im_window_body_outer的border出界问题
    var chat_body_sidebar = web.className('chat_body_sidebar', elem)[0];
    if (chat_body_sidebar) { // 群聊有sidebar时
        var sider_width = web.window.fullWidth(chat_body_sidebar);
        web.css(chat_body_sidebar, 'height', web.css(elem, 'height'));
    } else {
        sider_width = 0;
    }
    var chat_body_main_area = web.className('chat_body_main_area', elem)[0];
    if (!chat_body_main_area) {
        return;
    }
    web.css(chat_body_main_area, 'width', (fullwidth - sider_width) + 'px');

    var chat_body_main_area_height = web.window.fullHeight(chat_body_main_area);

    var chat_body_toolbar_top = web.className('chat_body_toolbar_top', elem)[0];
    var chat_body_toolbar_top_height = web.window.fullHeight(chat_body_toolbar_top);

    var chat_body_toolbar = web.className('chat_body_toolbar', elem)[0];
    var chat_body_toolbar_height = web.window.fullHeight(chat_body_toolbar);

    var chat_body_inputbox = web.className('chat_body_inputbox', elem)[0];
    var chat_body_inputbox_height = web.window.fullHeight(chat_body_inputbox);

    var chat_body_control_panel = web.className('chat_body_control_panel', elem)[0];
    var chat_body_control_panel_height = web.window.fullHeight(chat_body_control_panel);

    var chat_body_chatboard = web.className('chat_body_chatboard', elem)[0];
    var height = chat_body_main_area_height - chat_body_toolbar_top_height - chat_body_toolbar_height
            - chat_body_inputbox_height - chat_body_control_panel_height;
    web.css(chat_body_chatboard, 'height', height + 'px');
}
