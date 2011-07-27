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

    web.event.addEvent(src, 'contextmenu', function(e) {
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
