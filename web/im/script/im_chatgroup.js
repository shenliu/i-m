function im_genGroupChatWindow(container) {
    var web = starfish.web;

    var gid = container.getAttribute('gid');
    var win = im_window({
        // id: window_group_gid
        id: 'window_group_' + gid,
        clazz: {
            width: '495px',
            height: '445px',
            left: Number.random(30, 400) + 'px',
            top: Number.random(20, 200) + 'px',
            'z-index': 25
        }
    });

    im_setWindowFront(win);

    _genTitle(win, container);

    im_genWindowBody(win, container, 'group');

    im_fix_chat_size(win);

    im_addEventWindow(win, container);

    _addEvent(win, container);

    _showGroupMembers(gid);

    _showMessage(win, container);

    // 默认 编辑框获得焦点
    var chat_body_inputbox_rich_editor_div = web.className('chat_body_inputbox_rich_editor_div', win)[0];
    chat_body_inputbox_rich_editor_div.focus();

    ///////////////////////////////

    /**
     * 生成 group chat window窗体
     * @param win
     * @param o
     */
    function _genTitle(win, o) {
        var gname = o.getAttribute('gname');
        var gdesc = o.getAttribute('gdesc');
        var pic = o.getAttribute('pic');
        var html = [];
        // chat window 标头
        html.push('<div class="chat_avatar_area">');
        html.push('  <img class="chat_avatar" src="' + pic + '" />');
        html.push('</div>');
        html.push('<div class="chat_userinfo_area">');
        html.push('  <a class="chat_username titleText" href="#" title="' + gname + '">');
        html.push('    <span>' + gname + '</span>');
        html.push('  </a>');
        html.push('  <div class="chat_user_sign_area">');
        if (gdesc && gdesc.length > 0) {
            html.push('    <span title="' + gdesc + '">(' + gdesc + ')</span>');
        }
        html.push('  </div>');
        html.push('</div>');

        var window_title = web.className('window_title titleText', win)[0];
        window_title.innerHTML = html.join('');
    }

    function _addEvent(win, o) {
        // 分隔竖条 点击事件
        var chat_body_sidebar_2 = web.className('chat_body_sidebar_2', win)[0];
        var chat_body_sidebar = web.className('chat_body_sidebar', win)[0];
        var chat_body_main_area = web.className('chat_body_main_area', win)[0];
        var win_body = web.className('win_body', win)[0];
        var right = web.css(chat_body_sidebar_2, 'right'); // 分隔条原始right值
        web.event.addEvent(chat_body_sidebar_2, 'click', function() {
            var width = web.window.fullWidth(chat_body_sidebar);
            if (width != 0) { // 展开状态
                chat_body_sidebar.setAttribute('oldwidth', width);
                web.css(chat_body_sidebar, 'width', '0px');
                web.css(chat_body_sidebar_2, 'right', '-1px');
                var bodywidth = web.window.fullWidth(chat_body_main_area);
                web.css(chat_body_main_area, 'width', (width + bodywidth - 5) + 'px');
                chat_body_sidebar_2.title = "展开";
                web.css(chat_body_sidebar_2, 'backgroundImage', 'url(css/arrow_left_small.png)');
            } else { // 收起状态
                web.css(chat_body_sidebar, 'width', chat_body_sidebar.getAttribute('oldwidth') + 'px');
                web.css(chat_body_sidebar_2, 'right', right);
                var w = web.window.fullWidth(win_body);
                web.css(chat_body_main_area, 'width', (w - web.window.fullWidth(chat_body_sidebar)) + 'px');
                chat_body_sidebar_2.title = "收起";
                web.css(chat_body_sidebar_2, 'backgroundImage', 'url(css/arrow_right_small.png)');
            }
        });

        // 发送按钮 点击事件
        var chat_body_control_panel_sendmsg_button = web.className('chat_body_control_panel_sendmsg_button', win)[0];
        web.event.addEvent(chat_body_control_panel_sendmsg_button, 'click', function(e) {
            _event(e);
        });

        // 按 ctrl+enter 键盘事件
        var chat_body_inputbox_rich_editor_div = web.className('chat_body_inputbox_rich_editor_div', win)[0];
        web.event.addEvent(chat_body_inputbox_rich_editor_div, 'keydown', function(e) {
            if (e.ctrlKey && e.keyCode == 13) {
                _event(e);
            }
        });

        function _event(e) {
            // 正在上传文件 不能发送消息
            if (win.getAttribute('uploading') != null && win.getAttribute('uploading') === true) {
                im_showBox('有文件正在上传，请等待上传结束后再发送消息。', 'hasAttention', 5);
                return;
            }

            var text = web.className('chat_body_inputbox_rich_editor_div', win)[0];
            var val = text.innerHTML.trim();
            if (val.replace(/(&nbsp;)*/g, '') == "") {  // 空信息
                im_showWarningTips(win, "提示：消息内容不能为空，请输入内容。");
            } else {
                // 对象o为 'div.im_group_list'
                var chat_body_sidebar = web.className('chat_body_sidebar', win)[0];
                var members = web.className('buddy_user_container', chat_body_sidebar);
                var toz = [];
                for (var p = 0, q = members.length; p < q; p++) {
                    var uid = members[p].getAttribute('uid');
                    var username = members[p].getAttribute('username');
                    var status = members[p].getAttribute('status');
                    toz.push(uid + IM_CONSTANT.hyphen + username + IM_CONSTANT.hyphen + status);
                }
                var command = IM_CONSTANT.command.group;

                var from = "<from>" + IM_CONSTANT.myself_id + IM_CONSTANT.hyphen + IM_CONSTANT.myself_name + IM_CONSTANT.hyphen + gid + "<from>";
                var to = "<to>" + toz.join(',') + "<to>";  // 消息发送至
                var msg = "<msg>" + val + "<msg>";
                var style = "<style>" + decodeURIComponent(Object.toQueryString(IM_CONSTANT.user_stylez)) + "<style>";
                // 今后还有<file><file> todo

                var message = command + IM_CONSTANT.hyphen + from + to + msg + style;
                //console.log(message);
                //alert(message);

                // 清空打字区
                var editor_div = web.className('chat_body_inputbox_rich_editor_div', win)[0];
                editor_div.innerHTML = "";

                // 发出消息
                IM_CONSTANT.socket.write(message);

                // 此处 去调用 im_chat.js 中的 im_callback方法  ~~~~
            }
        }
    }

    /**
     * 显示 成员列表
     * @param gid
     */
    function _showGroupMembers(gid) {
        var chat_body_sidebar = web.className('chat_body_sidebar', win)[0];

        var buddy_callme = web.className('buddy_callme', win)[0];
        var buddy_online = web.className('buddy_online', win)[0];
        var buddy_away = web.className('buddy_away', win)[0];
        var buddy_busy = web.className('buddy_busy', win)[0];
        var buddy_silent = web.className('buddy_silent', win)[0];
        var buddy_hidden = web.className('buddy_hidden', win)[0];
        var buddy_offline = web.className('buddy_offline', win)[0];

        var url = IM_CONSTANT.servlet_path + "im/getgroupbygid?gid=" + gid;
        web.ajax.get(encodeURI(url), function(result) {
            var o = eval("(" + result.trim() + ")");
            var s_member = o['member'];
            s_member = s_member.substring(1, s_member.length - 1);
            var members = s_member.split(",");
            for (var i = 0, j = members.length; i < j; i++) {
                (function() {
                    var uid = members[i];
                    var container = im_findByUid('buddy', uid);
                    var node = container.cloneNode(true);  // 克隆原有node块

                    switch (parseInt(node.getAttribute('status'))) {
                        case IM_CONSTANT.user_status.online:
                            web.dom.insert(buddy_online, node);
                            break;
                        case IM_CONSTANT.user_status.away:
                            web.dom.insert(buddy_away, node);
                            break;
                        case IM_CONSTANT.user_status.silent:
                            web.dom.insert(buddy_silent, node);
                            break;
                        case IM_CONSTANT.user_status.busy:
                            web.dom.insert(buddy_busy, node);
                            break;
                        case IM_CONSTANT.user_status.hidden:
                            web.dom.insert(buddy_hidden, node);
                            break;
                        case IM_CONSTANT.user_status.offline:
                            web.dom.insert(buddy_offline, node);
                            break;
                        default:
                            web.dom.insert(buddy_offline, node);
                            break;
                    }

                    // 双击事件 出现单聊窗口
                    web.event.addEvent(node, 'dblclick', function() {
                        var self = this;
                        var uid = self.getAttribute('uid');
                        if (uid == IM_CONSTANT.myself_id) { // 是自己不显示窗口
                            return;
                        }
                        var select_win = $('window_' + IM_CONSTANT.myself_id + "_" + uid);
                        if (!select_win) {
                            im_genChatWindow(self);
                        } else { // 已经存在win 但要把它显示在最前面
                            web.css(select_win, 'zIndex', 30);
                            web.css(win, 'zIndex', 25);
                            IM_CONSTANT.last_chatwindow = select_win;
                        }
                    });

                    // 鼠标 移动到node之上
                    web.event.addEvent(node, 'mouseover', function(e) {
                        web.addClass(node, 'backgroundColor');
                    });

                    // 鼠标 移出node
                    web.event.addEvent(node, 'mouseout', function(e) {
                        web.removeClass(node, 'backgroundColor');
                    });
                })();
            }
        }, {});
    }

    /**
     * 查看是否有留言
     * @param win
     * @param o
     */
    function _showMessage(win, o) {
        var gid = o.getAttribute('gid');
        var msgs = IM_CONSTANT.online_message[gid];
        if (msgs) {
            var chat_body_msglist = web.className('chat_body_msglist', win)[0];
            for (var i = 0; i < msgs.length; i++) {
                var dom = web.dom.parseDOM(msgs[i])[0];
                web.dom.insert(chat_body_msglist, dom);
            }
            // 清理~~ IM_ONLINE_MESSAGE[uid]
            delete IM_CONSTANT.online_message[gid];

            // 删除tbox
            var tbox = web.className('tbox')[0];
            var content = web.className('tcontent', tbox)[0];
            var spans = $$(content, 'span');
            var sp = null;
            for (var j = 0; j < spans.length; j++) {
                if (spans[j].getAttribute('lang') === gid) {
                    sp = spans[j];
                    break;
                }
            }
            web.dom.dispose(sp); // 去除<span>
            var message = $('hasMessage');
            var h = parseInt(web.css(message, 'height'));
            web.css(message, 'height', (h - 22) + 'px');

            if (content.innerHTML.trim() === "") { // 没有内容了则 隐藏tbox
                starfish.toolkit.box.hide();
            }
        }
    }

}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

/**
 * 群组发送/接收消息
 * @param  {String}  data  消息
 */
function im_group_message(data) {
    //console.log(data);
    var web = starfish.web;

    var obj = eval("(" + data + ")");
    /*
     * 窗口 判断各方是否打开了此窗口 id为 window_group_gid
     */
    var win = null;
    var gid = obj.from.split(IM_CONSTANT.hyphen)[2];
    var to = obj.to;
    if (to == "*") {
        // 广播 todo
    } else {
        var toes = to.split(",");
        for (var x = 0, y = toes.length; x < y; x++) {
            var _to = toes[x];
            var uid = _to.split(IM_CONSTANT.hyphen)[0];
            win = $("window_group_" + gid);
            var html = im_makeChatList(obj);
            if (win) {   // 双方都打开了对话窗口
                if (uid === IM_CONSTANT.myself_id) { // 只显示对应自己的 因为循环只显示一次
                    // 得到的返回字符串转成对象
                    var msglist_div = web.className('chat_body_msglist', win)[0];
                    var dom = web.dom.parseDOM(html)[0];
                    web.dom.insert(msglist_div, dom);
                    msglist_div.scrollTop = msglist_div.scrollHeight;
                }
            } else { // 对方没有打开对话窗口
                if (uid === IM_CONSTANT.myself_id) {
                    // 判断是否有多条消息
                    if (IM_CONSTANT.online_message[gid]) {
                        IM_CONSTANT.online_message[gid].push(html);
                    } else {
                        IM_CONSTANT.online_message[gid] = [html];
                    }
                    var container = im_findByUid('group', gid);
                    // 显示提示
                    _displayTips(container);
                }
            }
        }
    }

    /**
     * 显示 有留言 提示
     * @param parent
     */
    function _displayTips(parent) {
        var tbox = web.className('tbox')[0];
        var gid = parent.getAttribute('gid');
        var gname = parent.getAttribute('gname');
        if (!tbox) {  // 第一次接收消息
            im_showBox(_gen(), 'hasMessage');
        } else {  // 已经接收过
            var content = web.className('tcontent', tbox)[0];
            if (content.innerHTML.trim() == "") {  // 没有提示正在显示
                im_showBox(_gen(), 'hasMessage');
            } else {  // 有消息正在显示
                var spans = $$(content, 'span');
                var sp = null;
                for (var i = 0; i <spans.length; i++) {
                    if (spans[i].getAttribute('lang') === gid) {
                        sp = spans[i];
                        break;
                    }
                }

                if (sp) {  // 有此用户发来的消息提示正在显示 只是简单的数字+1
                    var strong = $$(sp, 'strong')[0];
                    var n = parseInt(strong.innerHTML);
                    strong.innerHTML = ++n;
                } else {  // 没有次用户的消息提示 只是增加一行新的提示就可以了
                    var s = _gen();
                    web.dom.insert(content, web.dom.parseDOM(s)[0]);
                    var message = $('hasMessage');
                    var h = parseInt(web.css(message, 'height'));
                    web.css(message, 'height', (h + 22) + 'px');
                }
            }
        }

        function _gen() {
            var html = [];
            html.push('<span lang="' + gid + '">群组 <b>');
            html.push(gname);
            html.push('</b> 给您发来消息(<strong>1</strong>)。<a href="#" onclick="im_showGroupMessage(\'' + gid + '\');">点击查看</a>');
            return html.join('');
        }

    }
}

function im_showGroupMessage(gid) {
    var container = im_findByUid('group', gid);
    im_genGroupChatWindow(container);
}
