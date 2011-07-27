function im_callback(data) {
    //console.log("back -> " + data);
    var offset = data.indexOf(IM_CONSTANT.hyphen);
    var command = data.substring(0, offset);
    var result = data.substring(offset + IM_CONSTANT.hyphen.length);
    switch (command) {
        case IM_CONSTANT.command.msg:
            im_message(result);
            break;
        case IM_CONSTANT.command.group:
            im_group_message(result);
            break;
        case IM_CONSTANT.command.broadcast:
            break;
        default:  // 改变状态
            // todo
            break;
    }
}

/**
 * 普通发送/接收消息
 * @param  {String}  data  消息
 */
function im_message(data) {
    //console.log("im_message -> " + data);
    //alert("im_message -> " + data);
    var web = starfish.web;

    var obj = eval("(" + data + ")");
    /*
     * 窗口 判断各方是否打开了此窗口 id为 window_from_to
     */
    var win = null;
    var from = obj.from.split(IM_CONSTANT.hyphen)[0];
    var to = obj.to;
    if (to == "*") {
        // 广播 todo
    } else {
        var toes = to.split(",");
        for (var x = 0, y = toes.length; x < y; x++) {
            var _to = toes[x];
            var uid = _to.split(IM_CONSTANT.hyphen)[0];
            win = $("window_" + from + "_" + uid);  // 发出消息的人的窗口id
            if (!win) {
                win = $("window_" + uid + "_" + from); // 接受消息的人的窗口id
            }
            var html = im_makeChatList(obj);
            if (win) {   // 双方都打开了对话窗口
                // 得到的返回字符串转成对象
                var msglist_div = web.className('chat_body_msglist', win)[0];
                var dom = web.dom.parseDOM(html)[0];
                web.dom.insert(msglist_div, dom);
                msglist_div.scrollTop = msglist_div.scrollHeight;
            } else { // 对方没有打开对话窗口
                // 把留言用户放到对应的callme div中
                var userDiv = im_findByUid('buddy', from);
                var oldParent = web.dom.parent(userDiv);
                var callmeDiv = web.dom.first(web.dom.parent(oldParent));
                userDiv = web.dom.dispose(userDiv);
                web.dom.insert(callmeDiv, userDiv);

                // 振动~~
                IM_CONSTANT.online_message_shake[from] = _shakeAvatar(userDiv);

                // 判断是否有多条消息
                if (IM_CONSTANT.online_message[from]) {
                    IM_CONSTANT.online_message[from].push(html);
                } else {
                    IM_CONSTANT.online_message[from] = [html];
                }

                // 显示提示
                _displayTips(userDiv);
            }
        }
    }

    /**
     * 留言人头像 晃动
     * @param parent
     */
    function _shakeAvatar(parent) {
        var buddy_user_avatar_container = web.className('buddy_user_avatar_container', parent)[0];
        web.css(buddy_user_avatar_container, 'position', 'relative');
        var y = web.window.parentY(buddy_user_avatar_container);
        var i = 2;
        return setInterval(function() {
            web.window.setY(buddy_user_avatar_container, y + i);
            i = -i;
        }, 150);
    }

    /**
     * 显示 有留言 提示
     * @param parent
     */
    function _displayTips(parent) {
        var tbox = web.className('tbox')[0];
        var uid = parent.getAttribute('uid');
        var username = parent.getAttribute('username');
        var options = {
            html: (function(uid, username) {
                var html = [];
                html.push('用户 <b>');
                html.push(username);
                html.push('</b> 给您发来消息。<a href="#" onclick="im_showMessage(\'' + uid + '\');">点击查看</a>');
                return html.join('');
            })(uid, username),
            animate:true,close:false,mask:false,boxid:'hasMessage',autohide:0,top:5
        };
        starfish.toolkit.box.show(options);
    }

}

/**
 * 提示有留言 点击"点击查看"的事件
 * @param uid
 */
function im_showMessage(uid) {
    var container = im_findByUid('buddy', uid);
    im_genChatWindow(container);
}

/**
 * 生成 对话窗口
 * @param {Element}  container  双击的对象
 */
function im_genChatWindow(container) {
    var web = starfish.web;

    var win = im_window({
        id: 'window_' + IM_CONSTANT.myself_id + "_" + container.getAttribute('uid'), // window_自己id_对象id(或群id)
        clazz: {
            width: '445px',
            height: '405px',
            left: '387px',
            top: '20px',
            'z-index': 25
        }
    });

    im_setWindowFront(win);

    _genTitle(win, container);

    im_genWindowBody(win, container, 'chat');

    im_fix_chat_size(win);

    im_addEventWindow(win, container);

    _addEvent(win, container);

    _showMessage(win, container);

    ///////////////////////////////

    /**
     * 生成 chat window title
     * @param win
     * @param o
     */
    function _genTitle(win, o) {
        var web = starfish.web;

        var uid = o.getAttribute('uid');
        var status = o.getAttribute('status');
        var username = o.getAttribute('username');
        var gender = o.getAttribute('gender');
        var sign = o.getAttribute('sign');
        var picture = o.getAttribute('picture');
        var telephone = o.getAttribute('telephone');
        var mobile = o.getAttribute('mobile');
        var dept = o.getAttribute('dept');
        var duty = o.getAttribute('duty');
        var statusClass = o.getAttribute('statusClass');

        var html = [];
        // chat window 标头
        html.push('<div class="chat_avatar_area">');
        html.push('  <img class="chat_avatar" src="' + picture + '" />');
        html.push('  <div class="chat_user_state ' + statusClass + '"></div>');
        html.push('</div>');
        html.push('<div class="chat_userinfo_area">');
        html.push('  <a class="chat_username titleText" href="#" title="' + username + '">');
        html.push('    <span>' + username + '</span>');
        html.push('  </a>');
        html.push('  <div class="chat_user_sign_area">');
        html.push('    <span title="' + sign + '">(' + sign + ')</span>');
        html.push('  </div>');
        html.push('</div>');

        var window_title = web.className('window_title titleText', win)[0];
        window_title.innerHTML = html.join('');
    }

    function _addEvent(win, o) {
        // 发送按钮 点击事件
        var chat_body_control_panel_sendmsg_button = web.className('chat_body_control_panel_sendmsg_button', win)[0];
        web.event.addEvent(chat_body_control_panel_sendmsg_button, 'click', function() {
            var text = web.className('chat_body_inputbox_rich_editor_div', win)[0];
            var val = text.innerHTML.trim();
            if (val.stripTags().replace(/&nbsp;/g, '') == "") {  // 空信息
                var tip = web.className('chat_body_emptystring_tip', win)[0];
                web.show(tip);
                delay(function() {
                    web.hide(tip);
                }, 3000);
            } else {
                var uid = o.getAttribute('uid');
                var username = o.getAttribute('username');
                var status = o.getAttribute('status');

                var command = IM_CONSTANT.command.msg;

                var from = "<from>" + IM_CONSTANT.myself_id + IM_CONSTANT.hyphen + IM_CONSTANT.myself_name + "<from>";
                var to = "<to>" + uid + IM_CONSTANT.hyphen + username + IM_CONSTANT.hyphen + status + "<to>";  // 消息发送至
                var msg = "<msg>" + val + "<msg>";
                var style = "<style>" + decodeURIComponent(Object.toQueryString(IM_CONSTANT.user_stylez)) + "<style>";
                // 今后还有<file><file> todo

                var message = command + IM_CONSTANT.hyphen + from + to + msg + style;
                //console.log(message);

                // 清空打字区
                var editor_div = web.className('chat_body_inputbox_rich_editor_div', win)[0];
                editor_div.innerHTML = "";

                // 发出消息
                IM_CONSTANT.socket.write(message);

                // 此处 去调用 im_chat.js 中的 im_callback方法  ~~~~
            }
        });
    }

    /**
     * 查看是否有留言
     * @param win
     * @param o
     */
    function _showMessage(win, o) {
        var uid = o.getAttribute('uid');
        var msgs = IM_CONSTANT.online_message[uid];
        if (msgs) {
            var chat_body_msglist = web.className('chat_body_msglist', win)[0];
            for (var i = 0; i < msgs.length; i++) {
                var dom = web.dom.parseDOM(msgs[i])[0];
                web.dom.insert(chat_body_msglist, dom);
            }
            // 清理~~ IM_ONLINE_MESSAGE[uid]
            delete IM_CONSTANT.online_message[uid];

            // 删除tbox
            starfish.toolkit.box.hide();

            // 取消 头像晃动
            window.clearInterval(IM_CONSTANT.online_message_shake[uid]);
            delete IM_CONSTANT.online_message_shake[uid];
            var buddy_user_avatar_container = web.className('buddy_user_avatar_container', o)[0];
            web.css(buddy_user_avatar_container, 'position', 'static');

            // 把该用户放回对应的div
            var oldParent = web.dom.parent(o, 2);
            var status = o.getAttribute('status');
            var key = Object.keyOf(IM_CONSTANT.user_status, parseInt(status));
            var div = web.className('buddy_' + key, oldParent)[0];
            o = web.dom.dispose(o);
            web.dom.insert(div, o);
        }
    }

}

///////////////////////////////////////

/**
 * 使window在最前面显示
 * @param win
 */
function im_setWindowFront(win) {
    var web = starfish.web;
    // 该窗口在最上层显示
    web.css(win, 'zIndex', 30);
    if (IM_CONSTANT.last_chatwindow) {
        web.css(IM_CONSTANT.last_chatwindow, 'zIndex', 25);
    }
    IM_CONSTANT.last_chatwindow = win;
}

/**
 * window 主体
 * @param win
 * @param o
 * @param  {String}  type  类型  [group | chat]
 */
function im_genWindowBody(win, o, type) {
    var web = starfish.web;

    var html = [];
    if (type && type === 'group') {
        html.push('<div class="chat_body_sidebar_2" title="收起"></div>');
        html.push('<div class="chat_body_sidebar">');
        html.push('    <div class="buddy_callme"></div>');
        html.push('    <div class="buddy_online"></div>');
        html.push('    <div class="buddy_away"></div>');
        html.push('    <div class="buddy_busy"></div>');
        html.push('    <div class="buddy_silent"></div>');
        html.push('    <div class="buddy_hidden"></div>');
        html.push('    <div class="buddy_offline"></div>');
        html.push('</div>');
    }
    html.push('<div class="chat_body_main_area">');
    html.push('    <div class="chat_body_chatboard">');
    html.push('        <div class="chat_body_msglist"></div>');
    html.push('        <div class="chat_body_emptystring_tip">提示：消息内容不能为空，请输入内容。</div>');
    html.push('    </div>');
    html.push('    <div class="chat_body_editor_toolbar" unselectable="on">');
    html.push('        <ul class="toolbar" unselectable="on">');
    html.push('            <li>');
    html.push('                <select class="fontFamily">');
    for (var i = 0; i < IM_CONSTANT.fonts.length; i++) {
        var f = IM_CONSTANT.fonts[i];
        html.push('<option value="' + f + '" '
                + (f == IM_CONSTANT.user_stylez.family ? 'selected="selected"' : '') + '>'
                + f + '</option>');
    }
    html.push('                </select>');
    html.push('            </li>');
    html.push('            <li>');
    html.push('                <select class="fontSize">');
    for (var s = 8; s <= 22; s++) {
        html.push('<option value="' + s + '" '
                + (s == IM_CONSTANT.user_stylez.size ? 'selected="selected"' : '') + '>'
                + s + '</option>');
    }
    html.push('                </select>');
    html.push('            </li>');
    html.push('            <li>');
    html.push('                <a class="icon" title="粗体" href="#">');
    html.push('                    <span class="bold"></span>');
    html.push('                </a>');
    html.push('            </li>');
    html.push('            <li>');
    html.push('                <a class="icon" title="斜体" href="#">');
    html.push('                    <span class="italic"></span>');
    html.push('                </a>');
    html.push('            </li>');
    html.push('            <li>');
    html.push('                <a class="icon" title="下划线" href="#">');
    html.push('                    <span class="underline"></span>');
    html.push('                </a>');
    html.push('            </li>');
    html.push('            <li>');
    html.push('                <a class="icon selected" title="颜色" href="#">');
    html.push('                    <span class="color"></span>');
    html.push('                </a>');
    html.push('            </li>');
    html.push('        </ul>');
    html.push('        <ul class="colorPanel">');
    html.push('        </ul>');
    html.push('    </div>');
    html.push('    <div class="chat_body_toolbar_top user_select_none">pull me</div>');
    html.push('    <div class="chat_body_toolbar">');
    html.push('        <div class="chat_body_toolbar_font_button" title="设置字体颜色和格式"></div>');
    html.push('        <div class="chat_body_toolbar_face_button" title="表情"></div>');
    html.push('        <a class="chat_body_toolbar_history_button" href="#" title="消息记录"></a>');
    html.push('    </div>');
    html.push('    <div class="chat_body_inputbox">');
    html.push('        <div class="chat_body_inputbox_rich_editor">');
    html.push('            <div class="chat_body_inputbox_rich_editor_div" contenteditable="true"></div>');
    html.push('            <textarea class="chat_body_inputbox_rich_editor_text"></textarea>');
    html.push('        </div>');
    html.push('    </div>');
    html.push('    <div class="chat_body_control_panel">');
    html.push('        <div class="chat_body_control_panel_sendmsg_button" title="发送">发　送</div>');
    html.push('        <div class="chat_body_control_panel_close_button" title="关闭">关　闭</div>');
    html.push('    </div>');
    html.push('</div>');

    var win_body = web.className('win_body', win)[0];
    win_body.innerHTML = html.join('');

    // 初始化 用户自定义样式
    (function() {
        var chat_body_inputbox_rich_editor = web.className('chat_body_inputbox_rich_editor', win)[0];

        web.css(chat_body_inputbox_rich_editor, 'fontFamily', IM_CONSTANT.user_stylez.family);
        web.css(chat_body_inputbox_rich_editor, 'fontSize', IM_CONSTANT.user_stylez.size + "pt");

        // 字体 字体大小在上面生成文档语句中同时完成了 下面是 粗体 斜体 下划线 颜色的设置
        var bold = web.className('bold', win)[0];
        bold = web.dom.parent(bold);
        if (IM_CONSTANT.user_stylez.weight) {
            web.addClass(bold, 'selected');
            web.css(chat_body_inputbox_rich_editor, 'fontWeight', 'bold');
        }

        var italic = web.className('italic', win)[0];
        italic = web.dom.parent(italic);
        if (IM_CONSTANT.user_stylez.italic) {
            web.addClass(italic, 'selected');
            web.css(chat_body_inputbox_rich_editor, 'fontStyle', 'italic');
        }

        var underline = web.className('underline', win)[0];
        underline = web.dom.parent(underline);
        if (IM_CONSTANT.user_stylez.underline) {
            web.addClass(underline, 'selected');
            web.css(chat_body_inputbox_rich_editor, 'textDecoration', 'underline');
        }

        // 颜色
        web.css(chat_body_inputbox_rich_editor, 'color', IM_CONSTANT.user_stylez.color);
    })();
}

/**
 * 为window添加事件
 * @param win
 * @param o
 */
function im_addEventWindow(win, o) {
    var web = starfish.web;

    // 关闭事件 右上角X
    var window_close = web.className('window_close', win)[0];
    web.event.addEvent(window_close, 'click', function() {
        web.dom.dispose(win);
        IM_CONSTANT.last_chatwindow = null;
    });

    // 关闭事件 关闭按钮
    var chat_body_control_panel_close_button = web.className('chat_body_control_panel_close_button', win)[0];
    web.event.addEvent(chat_body_control_panel_close_button, 'click', function() {
        web.dom.dispose(win);
        IM_CONSTANT.last_chatwindow = null;
    });

    var ex, ey, resizing = false;
    var chat_body_chatboard = web.className('chat_body_chatboard', win)[0];
    var chat_body_toolbar_top = web.className('chat_body_toolbar_top', win)[0];
    var chat_body_toolbar = web.className('chat_body_toolbar', win)[0];
    var chat_body_editor_toolbar = web.className('chat_body_editor_toolbar', win)[0];
    var chat_body_inputbox = web.className('chat_body_inputbox', win)[0];
    // 聊天窗口中间横条改变上下大小 鼠标按下事件
    web.event.addEvent(win, 'mousedown', function(e) {
        ex = web.window.mouseX(e);
        ey = web.window.mouseY(e);
        var src = e.target || e.srcElement;
        if (src === chat_body_toolbar_top) {
            resizing = true;
        }
    });

    web.event.addEvent(win, 'mousemove', function(e) {
        if (resizing) {
            var dy = web.window.mouseY(e) - ey;

            var b2 = parseInt(web.css(chat_body_toolbar_top, 'bottom'));
            var b3 = parseInt(web.css(chat_body_toolbar, 'bottom'));
            var b5 = parseInt(web.css(chat_body_editor_toolbar, 'bottom'));

            var h1 = parseInt(web.css(chat_body_chatboard, 'height'));
            var h4 = parseInt(web.css(chat_body_inputbox, 'height'));

            if (h4 - dy > 20 && h4 - dy < 150) {   // 最小高20px 最大150px
                web.css(chat_body_chatboard, 'height', (h1 + dy) + 'px');
                web.css(chat_body_inputbox, 'height', (h4 - dy) + 'px');

                web.css(chat_body_toolbar_top, 'bottom', (b2 - dy) + 'px');
                web.css(chat_body_toolbar, 'bottom', (b3 - dy) + 'px');
                web.css(chat_body_editor_toolbar, 'bottom', (b5 - dy) + 'px');
            }
            ey += dy;
        }
    });

    web.event.addEvent(win, 'mouseup', function(e) {
        resizing = false;
    });

    // 打开/关闭 设置字体列表
    var chat_body_toolbar_font_button = web.className('chat_body_toolbar_font_button', win)[0];
    web.event.addEvent(chat_body_toolbar_font_button, 'click', function() {
        if (web.css(chat_body_editor_toolbar, 'display') === 'block') {
            web.hide(chat_body_editor_toolbar);
        } else {
            web.show(chat_body_editor_toolbar);
        }
    });

    // 弹出颜色面板
    var colorPanel = web.className('colorPanel', win)[0];
    var color = web.className('color', win)[0];
    color = web.dom.parent(color);
    // 编辑框
    var chat_body_inputbox_rich_editor = web.className('chat_body_inputbox_rich_editor', win)[0];
    web.event.addEvent(color, 'click', function() {
        var html = [];
        for (var s = 0; s < 40; s++) {  // 每次都随机产生颜色
            var r = Number.random(0, 255);
            var g = Number.random(0, 255);
            var b = Number.random(0, 255);
            html.push('<li>');
            html.push('    <a href="#">');
            html.push('        <span style="background:' + "rgb" + '(' + r + ',' + g + ',' + b + ');"></span>');
            html.push('    </a>');
            html.push('</li>');
        }
        colorPanel.innerHTML = html.join('');
        web.show(colorPanel);

        // 取颜色值 单击事件
        var lis = $$(colorPanel, 'li');
        for (var c = 0, d = lis.length; c < d; c++) {
            (function() {
                var li = lis[c];
                web.event.addEvent(li, 'click', function() {
                    var span = $$(li, 'span')[0];
                    var color = web.css(span, 'backgroundColor');
                    web.css(chat_body_inputbox_rich_editor, 'color', color); // 设置编辑框字体颜色
                    IM_CONSTANT.user_stylez.color = color; // 设置用户自选颜色
                    web.hide(colorPanel); // 隐藏colorPanel
                    im_setCookie('userStyle');  // 设置cookie
                });
            })();
        }
        return false;
    });

    // 字体
    var fontFamily = web.className('fontFamily', win)[0];
    web.event.addEvent(fontFamily, 'change', function() {
        var font = fontFamily.options[fontFamily.selectedIndex].value;
        IM_CONSTANT.user_stylez.family = font;
        web.css(chat_body_inputbox_rich_editor, 'fontFamily', font);
        im_setCookie('userStyle');  // 设置cookie
    });

    // 字号
    var fontSize = web.className('fontSize', win)[0];
    web.event.addEvent(fontSize, 'change', function() {
        var size = fontSize.options[fontSize.selectedIndex].value;
        IM_CONSTANT.user_stylez.size = size;
        web.css(chat_body_inputbox_rich_editor, 'fontSize', size + "pt");
        im_setCookie('userStyle');  // 设置cookie
    });

    // 粗体
    var bold = web.className('bold', win)[0];
    bold = web.dom.parent(bold);
    web.event.addEvent(bold, 'click', function() {
        if (web.hasClass(bold, 'selected')) {
            var weight = false;
            web.removeClass(bold, 'selected');
        } else {
            weight = true;
            web.addClass(bold, 'selected');
        }
        IM_CONSTANT.user_stylez.weight = weight;
        web.css(chat_body_inputbox_rich_editor, 'fontWeight', weight ? 'bold' : 'normal');
        im_setCookie('userStyle');  // 设置cookie
        return false;
    });

    // 斜体
    var italic = web.className('italic', win)[0];
    italic = web.dom.parent(italic);
    web.event.addEvent(italic, 'click', function() {
        if (web.hasClass(italic, 'selected')) {
            var italian = false;
            web.removeClass(italic, 'selected');
        } else {
            italian = true;
            web.addClass(italic, 'selected');
        }
        IM_CONSTANT.user_stylez.italic = italian;
        web.css(chat_body_inputbox_rich_editor, 'fontStyle', italian ? 'italic' : 'normal');
        im_setCookie('userStyle');  // 设置cookie
        return false;
    });

    // 下划线
    var underline = web.className('underline', win)[0];
    underline = web.dom.parent(underline);
    web.event.addEvent(underline, 'click', function() {
        if (web.hasClass(underline, 'selected')) {
            var under = false;
            web.removeClass(underline, 'selected');
        } else {
            under = true;
            web.addClass(underline, 'selected');
        }
        IM_CONSTANT.user_stylez.underline = under;
        web.css(chat_body_inputbox_rich_editor, 'textDecoration', under ? 'underline' : 'none');
        im_setCookie('userStyle');  // 设置cookie
        return false;
    });

}
