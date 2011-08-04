/**
 * IM 中用到的通用函数
 */

/**
 * 通过uid找到userlist中对应的div
 *
 * @param {String}  type  (buddy group recent)
 * @param {String}  id  用户id
 * @return {Element}  对应的div
 */
function im_findByUid(type, id) {
    var s_id = "";
    switch (type) {
        case 'buddy':
            s_id = 'uid';
            break;
        case 'group':
            s_id = 'gid';
            break;
        default:
            s_id = 'uid';
            break;
    }
    var list = starfish.web.className(type + '_list')[0];
    var containers = starfish.web.className(type + "_user_container", list, "div");
    for (var ii = 0, jj = containers.length; ii < jj; ii++) {
        var container = containers[ii];
        if (container.getAttribute(s_id) == id) {
            return container;
        }
    }
    return null;
}

/**
 * 根据uid找到所有的userlist中对应的div
 * @param {String}  uid  用户id
 * @return  {Array}  所有的div
 */
function im_allByUid(uid) {
    var result = [];
    var list = starfish.web.className('buddy_list')[0];
    var containers = starfish.web.className("buddy_user_container", list, "div");
    for (var ii = 0, jj = containers.length; ii < jj; ii++) {
        var container = containers[ii];
        if (container.getAttribute('uid') == uid) {
            result.push(container);
        }
    }
    return result;
}

/**
 * 生成 对话框 框架
 * @param  {Object}  options  选项
 *      options {
 *          left, top, width, height, border // {String} 样式
 *          closeable // 是否有关闭按钮
 *          closefun // 关闭时要执行的方法
 *      }
 */
function im_dialog(options) {
    var web = starfish.web;
    var border = web.dom.elem("div");
    border.className = "im_dialog";
    if (options) {
        if (options.left) web.css(border, 'left', parseInt(options.left) + 'px');
        if (options.top) web.css(border, 'top', parseInt(options.top) + 'px');
        if (options.width) web.css(border, 'width', parseInt(options.width) + 'px');
        if (options.height) web.css(border, 'height', parseInt(options.height) + 'px');
        if (options.border) web.css(border, 'border', options.border);
    }
    var outer = web.dom.elem("div");
    outer.className = "im_dialog_outer";

    var inner = web.dom.elem("div");
    inner.className = "im_dialog_inner";

    var html = [];
    html.push('<div class="panel_1_container">');
    html.push('  <div class="panel_1 panel_1_center"></div>');
    html.push('  <div class="panel_1 panel_1_t"></div>');
    html.push('  <div class="panel_1 panel_1_rt"></div>');
    html.push('  <div class="panel_1 panel_1_r"></div>');
    html.push('  <div class="panel_1 panel_1_rb"></div>');
    html.push('  <div class="panel_1 panel_1_b"></div>');
    html.push('  <div class="panel_1 panel_1_lb"></div>');
    html.push('  <div class="panel_1 panel_1_l"></div>');
    html.push('  <div class="panel_1 panel_1_lt"></div>');
    html.push('</div>');
    inner.innerHTML = html.join("");

    var content = web.dom.elem("div");
    content.className = "im_dialog_content";

    web.dom.insert(inner, content);
    web.dom.insert(outer, inner);
    web.dom.insert(border, outer);
    web.dom.insert(document.body, border);

    // 有关闭按钮
    if (options && options.closeable) {
        var close = web.dom.elem('div');
        close.className = 'im_close';
        web.dom.insert(border, close);
        close.title = "关闭";
        web.event.addEvent(close, 'click', function() {
            web.dom.dispose(border);
            if (options.closefun) {
                options.closefun();
            }
        });
    }

    // 修复 content 高度
    if (!starfish.client.browser.ie) {
        var h = parseInt(web.css(border, 'height'));
        web.css(inner, 'height', (h - 10) + 'px');
        web.css(content, 'height', (h - 10) + 'px');
    }

    return border;
}

/**
 * 生成右键菜单
 * @param  {Element}  src    在其上右键的元素
 * @param  {Object}   menus  key:菜单选项  value:点击的事件
 * @param  {Object}  options 选项
 */
function im_rightMenu(src, menus, options) {
    var web = starfish.web;

    // 右键 弹出菜单 事件
    web.event.addEvent(src, 'contextmenu', function(e) {
        e.stopPropagation();
        e.preventDefault();

        // 先 去除上一次的菜单
        var div = web.className('group_list_menu_div')[0];
        if (div) {
            web.dom.dispose(div);
        }

        var container = right_menu(menus);
        div = web.dom.elem('div');
        web.czz(div, {
            left: web.window.mouseX(e) + 'px',
            top: web.window.mouseY(e) + 'px',
            width: options.width + 'px',
            height: options.height + 'px',
            textAlign: 'left',
            textIndent: '30px'
        });
        web.addClass(div, 'group_list_menu_div');
        web.dom.insert(div, container);
        web.dom.insert(document.body, div);
    });

    // 去除右键菜单
    web.event.addEvent(document, 'click', function(e) {
        var div = web.className('group_list_menu_div')[0];
        if (div) {
            web.dom.dispose(div);
        }
    });

    function right_menu(menus) {
        var container = web.dom.elem('ul');
        container.className = 'group_list_menu_main';
        _parse(container, menus);

        function _parse(container, menus) {
            Object.each(menus, function(item, key, object) {
                var li = web.dom.elem('li');
                web.css(li, 'width', options.width + 'px');

                if (type(item) == 'object') {
                    var _container = web.dom.elem('ul');
                    _parse(_container, item);
                    web.dom.addText(key + " -> ", li);
                    web.dom.insert(li, _container);

                    // 鼠标over时 显示下层菜单
                    web.event.addEvent(li, 'mouseover', function(e) {
                        var ul = web.dom.first(li);
                        var top = web.window.parentY(li);
                        var width = parseInt(web.css(li, 'width'));
                        web.css(ul, 'left', (width - 10) + "px");
                        web.css(ul, 'top', (top - 2) + "px");
                        web.show(ul);
                    });

                    // 鼠标out时 隐藏下层菜单
                    web.event.addEvent(li, 'mouseout', function(e) {
                        var ul = web.dom.first(li);
                        web.hide(ul);
                    });
                } else {
                    web.dom.addText(key, li);
                    web.event.addEvent(li, 'click', function(e) {
                        var gid = src.getAttribute('gid');
                        var gname = src.getAttribute('gname');
                        var gdesc = web.className('im_group_list_info_desc', src)[0];
                        gdesc = gdesc.getAttribute('title');
                        item(gid, gname, gdesc);
                    });
                }

                // 鼠标 移动到li之上
                web.event.addEvent(li, 'mouseover', function(e) {
                    web.czz(li, {
                        backgroundColor: '#cce2ef',
                        color: '#1e8db6'
                    });
                });

                // 鼠标 移出li
                web.event.addEvent(li, 'mouseout', function(e) {
                    web.czz(li, {
                        backgroundColor: '#fff',
                        color: '#000'
                    });
                });

                web.dom.insert(container, li);
            });
        }

        return container;
    }

}

/**
 * 综合overlay和dialog框架
 */
function im_showDialog(width, height, closeable) {
    var web = starfish.web;

    starfish.toolkit.overlay.show({
        end: 50
    });

    return im_dialog({
        left: (web.window.docWidth() - width) / 2,
        top: (web.window.docHeight() - height) / 2,
        width: width,
        height: height,
        closeable: closeable,
        closefun: starfish.toolkit.overlay.hide, // 关闭时要执行的方法
        border: '1px solid #999'
    });

}

/**
 * 要确认的对话框
 * @param  {String}  str    显示的文字
 * @param  {Object}  options  选项
 * @return {Array}  html
 */
function im_confirmDialog(str, options) {
    var w = options.width, h = options.height;

    var html = [];
    html.push('<div class="im_confirm_icon" style="background-position:' + (w / 4) + 'px, center">注意</div>');
    html.push('<div class="im_confirm" style="width:' + (w - 20) + 'px;height:' + (h - 10) + 'px">');
    html.push('  <div class="im_confirm_line">');
    html.push('    <label>您确定要 <b><em>' + str + '</em></b> 吗?</label>');
    html.push('  </div>');
    html.push('  <div class="im_confirm_line">');
    html.push('    <input type="button" class="im_confirm_ok" value="我确定了!" />');
    html.push('    <input type="button" class="im_confirm_cancel" value="再考虑一下~~" />');
    html.push('  </div>');
    html.push('</div>');
    return html;
}

/**
 * 生成 聊天内容
 * @param o
 */
function im_makeChatList(o) {
    var html = [];

    var stylez = [];
    var style = o['stylz'].toString();
    stylez.push("font-family:" + style.getParamter("family"));
    stylez.push("font-size:" + style.getParamter("size") + "pt");
    stylez.push("font-weight:" + (style.getParamter("weight") == "true" ? "bold" : "normal"));
    stylez.push("font-style:" + (style.getParamter("italic") == "true" ? "italic" : "normal"));
    stylez.push("text-decoration:" + (style.getParamter("underline") == "true" ? "underline" : "none"));
    stylez.push("color:" + style.getParamter("color"));

    var from_id = o.from.split(IM_CONSTANT.hyphen)[0];
    var from_name = o.from.split(IM_CONSTANT.hyphen)[1];
    if (from_id == IM_CONSTANT.myself_id) {
        html.push('<dl class="chat_body_msglist_mymsg">');
    } else {
        html.push('<dl class="chat_body_msglist_buddymsg">');
    }
    html.push('<dt class="msgHead" title="' + from_name + '">');
    html.push(from_name);
    html.push('  <span>' + o.date + '</span>');
    html.push('</dt>');
    html.push('<dd class="msgBody defaultFontStyle" style="' + stylez.join(';') + '">');
    html.push(o.msg);
    html.push('</dd>');
    html.push('</dl>');

    //console.log(html.join(''));
    return html.join('');
}

/**
 * 设置 cookie
 *   用户聊天自定义样式
 */
function im_setCookie(key) {
    switch (key) {
        case 'userStyle':  // 用户自定义样式
            var str = Object.toQueryString(IM_CONSTANT.user_stylez);
            starfish.cookie.write(key, str);
            break;
        default:
            break;
    }
}

function im_getCookie(key) {
    var str = starfish.cookie.read(key);
    if (str) {
        switch (key) {
            case 'userStyle':
                str = decodeURIComponent(str);
                IM_CONSTANT.user_stylez.family = str.getParamter("family");
                IM_CONSTANT.user_stylez.size = parseInt(str.getParamter("size"));
                IM_CONSTANT.user_stylez.weight = str.getParamter("weight") === 'true';
                IM_CONSTANT.user_stylez.italic = str.getParamter("italic") === 'true';
                IM_CONSTANT.user_stylez.underline = str.getParamter("underline") === 'true';
                IM_CONSTANT.user_stylez.color = str.getParamter("color");
                break;
            default:
                break;
        }
    }
}

/**
 * 初始化 表情列表
 */
function im_face() {
    var web = starfish.web;
    var facePanel = web.dom.elem('div');
    facePanel.className = 'im_facePanel';
    web.dom.insert(document.body, facePanel);

    // 记录每一个目录中有多少张图片 (笨点~~ >_<)
    var nums = [33, 20, 33, 34, 21, 37, 26];

    // 记录每一个目录下图片的尺寸 假设宽高相等
    var sizes = [50, 90, 80, 95, 120, 90, 90];

    // tab
    var tabarea = web.dom.elem('div');
    tabarea.className = 'im_facePanel_tab_area';

    // 循环排列图片
    for (var i = 0; i < nums.length; i++) {
        (function() {
            var default_div = web.dom.elem('div');
            default_div.className = 'im_default_facePanel';
            var ul = web.dom.elem('ul');

            var sub = i + 1;
            var path = 'images/face/' + sub + '/';
            for (var j = 1; j <= nums[i]; j++) {
                (function() {
                    var li = web.dom.elem('li');
                    web.css(li, 'width', (sizes[i] + 2) + 'px');
                    web.css(li, 'height', (sizes[i] + 2) + 'px');
                    var mark = sub + '_' + (j < 10 ? '0' + j : j); // 每个图片的标记
                    li.setAttribute('mark', mark);

                    var img = web.dom.elem('img');
                    img.src = path + mark + '.gif';
                    web.css(img, 'width', (sizes[i]) + 'px');
                    web.css(img, 'height', (sizes[i]) + 'px');
                    web.dom.insert(li, img);
                    web.dom.insert(ul, li);
                    web.dom.insert(default_div, ul);

                    // 鼠标over时
                    web.event.addEvent(li, 'mouseover', function(e) {
                        web.addClass(li, 'borderfocus');
                    });

                    // 鼠标out时
                    web.event.addEvent(li, 'mouseout', function(e) {
                        web.removeClass(li, 'borderfocus');
                    });

                    // 点击 选定图片 单击事件
                    web.event.addEvent(li, 'click', function(e) {
                        var win_id = facePanel.getAttribute('caller'); // 得到调用的窗口
                        var win = $(win_id);
                        if (win) {
                            var editor = web.className('chat_body_inputbox_rich_editor_div', win)[0];
                            var pic = web.dom.elem('img');
                            pic.src = img.src;
                            pic.setAttribute('mark', mark);
                            pic.className = "system";  // 在 im_chat.css 中定义
                            web.dom.insert(editor, pic);
                        }
                        web.hide(facePanel); // 隐藏face panel
                    });
                })();
            }
            web.dom.insert(facePanel, default_div);

            // tab下的标签
            var a = web.dom.elem('a');
            a.href = "#";
            web.dom.addText('第' + (i + 1) + '组', a);

            // 为tab切换div 添加单击事件
            web.event.addEvent(a, 'click', function() {
                var divs = web.className('im_default_facePanel', facePanel);
                for (var ii = 0, jj = divs.length; ii < jj; ii++) {
                    web.hide(divs[ii]); // 先全部隐藏
                }
                web.show(default_div); // 再显示点击的

                var _a = web.className('current', tabarea)[0];
                if (_a) { // 把原有<a class='current'>的元素移除current class
                    web.removeClass(_a, 'current');
                }
                web.addClass(this, 'current');
                this.blur(); // 失去焦点 有虚框~~
            });
            web.dom.insert(tabarea, a);
        })();
    }
    web.dom.insert(facePanel, tabarea);

    // 初始时 触发'第一组'
    var as = $$(tabarea, 'a');
    if (as[0].click) {
        as[0].click();
    } else {  // chrome
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        as[0].dispatchEvent(evt);
    }

}

/**
 * 改变自己在线状态
 */
function im_state() {
    var web = starfish.web;

    var statePanel = web.dom.elem('div');
    statePanel.className = 'statePanel';
    var html = [];
    html.push('<li state="online">');
    html.push('    <div class="state_icon state_online"></div>');
    html.push('    <div class="state_text">我在线上</div>');
    html.push('</li>');
    html.push('<li state="away">');
    html.push('    <div class="state_icon state_away"></div>');
    html.push('    <div class="state_text">离开</div>');
    html.push('</li>');
    html.push('<li state="busy">');
    html.push('    <div class="state_icon state_busy"></div>');
    html.push('    <div class="state_text">忙碌</div>');
    html.push('</li>');
    html.push('<li state="silent">');
    html.push('    <div class="state_icon state_silent"></div>');
    html.push('    <div class="state_text">请勿打扰</div>');
    html.push('</li>');
    html.push('<li state="hidden">');
    html.push('    <div class="state_icon state_hidden"></div>');
    html.push('    <div class="state_text">隐身</div>');
    html.push('</li>');
    html.push('<li state="offline">');
    html.push('    <div class="state_icon state_offline"></div>');
    html.push('    <div class="state_text">离线</div>');
    html.push('</li>');
    statePanel.innerHTML = html.join('');
    web.dom.insert(document.body, statePanel);

    // 显示 statePanel 点击事件
    var my_panel_info_state = web.className('my_panel_info_state')[0];
    var state_show = web.className('my_panel_info_state_show')[0];
    web.event.addEvent(my_panel_info_state, 'click', function(e) {
        var left = web.window.pageX(this);
        var top = web.window.pageY(this) + web.window.fullHeight(this);
        web.czz(statePanel, {
            left: left + 'px',
            top: top + 'px'
        });
        web.show(statePanel);
    });

    var lis = $$(statePanel, 'li');
    for (var i = 0, j = lis.length; i < j; i++) {
        (function() {
            var li = lis[i];
            // 鼠标 移动到li内 改变背景
            web.event.addEvent(li, 'mouseover', function(e) {
                web.addClass(li, 'backgroundColor');
            });

            // 鼠标 移出li
            web.event.addEvent(li, 'mouseout', function(e) {
                web.removeClass(li, 'backgroundColor');
            });

            // 点击li 事件
            web.event.addEvent(li, 'click', function(e) {
                var state = li.getAttribute('state');
                state_show.className = "my_panel_info_state_show";
                web.addClass(state_show, 'state_' + state);
                web.hide(statePanel);

                // 到每一个用户的客户端上 ~~~
                var command = IM_CONSTANT.command.status.state;
                // 形如: state#*#uid#*#state
                var message = command + IM_CONSTANT.hyphen + IM_CONSTANT.myself_id + IM_CONSTANT.hyphen + state;
                // 发出消息   回调方法 im_chgState()
                IM_CONSTANT.socket.write(message);
            });

        })();
    }
}

/**
 * 改变别人的在线状态 后台回调方法
 * @param data
 */
function im_chgState(data) {
    //console.log(data);
    var web = starfish.web;

    var uid = data.split(IM_CONSTANT.hyphen)[0];
    var state = data.split(IM_CONSTANT.hyphen)[1];
    var containers = im_allByUid(uid);
    for (var i = 0; i < containers.length; i++) {
        var container = containers[i];
        var buddy_user_state = web.className('buddy_user_state', container)[0];
        buddy_user_state.className = 'buddy_user_state';
        web.addClass(buddy_user_state, 'buddy_user_state_' + state);
        // 改变保存在container上的status属性
        container.setAttribute('status', IM_CONSTANT.user_status[state]);
        // 改变title 显示
        web.dom.parent(buddy_user_state).title = IM_CONSTANT.user_status_desc[state];

        // 放到对应的div中
        var parent1 = web.dom.parent(container);
        var oldclass = parent1.className.split('_')[1]; // 原本处于的div的className
        var parent2 = web.dom.parent(container, 2);
        var div = web.className('buddy_' + state, parent2)[0];
        container = web.dom.dispose(container);
        web.dom.insert(div, container);

        // 改变统计在线人数显示
        parent2 = web.dom.prev(parent2);
        var span = web.className('onlineNumber', parent2)[0];
        if (span) {
            var num = parseInt(span.innerHTML);
            if ((oldclass != 'hidden' && oldclass != 'offline')  // 原来不是hidden/offline 现在是了
                    && (state === 'hidden' || state === 'offline')) {
                num -= 1;
            } else if ((oldclass === 'hidden' || oldclass === 'offline')  // 原来是hidden/offline 现在不是了
                    && (state != 'hidden' && state != 'offline')) {
                num += 1;
            }
            span.innerHTML = num;
        }

        // 判断是否有对应的用户的窗口打开着
        // 单聊窗口
    }
}
