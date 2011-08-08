function im_initGroup() {
    var web = starfish.web;

    // 添加 创建群 点击事件
    var create_group = web.className('create_group')[0];
    web.event.addEvent(create_group, 'click', function() {
        im_createGroup();
        return false;
    });

    // 为 '我的群' 添加点击事件 可以刷新群组列表
    var group_tab = web.className('group_tab')[0];
    web.event.addEvent(group_tab, 'click', im_displayGroup);

    // 显示群组列表
    im_displayGroup();
}

/**
 * 创建群
 * @param  {String}  gid    gid
 * @param  {String}  gname  群组名称
 * @param  {String}  gdesc  群组描述
 */
function im_createGroup(gid, gname, gdesc) {
    var web = starfish.web;

    var border = im_showDialog(400, 300, true);

    var html = [];
    html.push('<div class="im_dialog_form_icon">群组</div>');
    html.push('<div class="im_dialog_form">');
    html.push('  <div class="im_dialog_form_error"></div>');
    html.push('  <div class="im_dialog_form_line">');
    html.push('    <label class="required">群名称:<span>*</span></label>');
    html.push('    <span><input class="im_dialog_form_input" /></span>');
    html.push('  </div>');
    html.push('  <div class="im_dialog_form_line">');
    html.push('    <label>群描述:</label>');
    html.push('    <span><textarea></textarea></span>');
    html.push('  </div>');
    html.push('  <div class="im_dialog_form_line a_right" style="padding-right: 60px;">');
    html.push('    <input type="button" class="im_dialog_form_ok" value="确定" />');
    html.push('  </div>');
    html.push('</div>');

    var content = web.className('im_dialog_content', border)[0];
    content.innerHTML = html.join('');

    var input = web.className('im_dialog_form_input', border)[0];
    var textarea = $$(border, 'textarea')[0];

    // 传递gid 为修改群组 只有该组创建人才能修改该组
    if (gid) {
        // 添加 删除 链接
        /*
         var div = web.className('im_dialog_form_line', content); // 最后一个
         div = div[div.length - 1];
         html.length = 0;
         html.push('<div class="im_dialog_form_delete f_left">');
         html.push('  <a href="#" title="删除该群组" onclick="im_deleteGroup(\'' + gid + '\',\'' + gname + '\')">删除群组</a>');
         html.push('</div>');
         web.dom.insert(div, web.dom.parseDOM(html.join(''))[0], 'top'); */
        input.value = gname;
        textarea.value = gdesc;
    }
    web.addClass(input, 'borderfocus'); // 默认焦点在其上
    input.focus();

    // 当input得到焦点时 隐藏warning
    web.event.addEvent(input, 'focus', function(e) {
        var warning = web.className('im_dialog_form_error', content)[0];
        web.hide(warning);
        web.addClass(input, 'borderfocus');
    });

    web.event.addEvent(input, 'blur', function(e) {
        web.removeClass(input, 'borderfocus');
    });

    web.event.addEvent(textarea, 'focus', function(e) {
        web.addClass(textarea, 'borderfocus');
    });

    web.event.addEvent(textarea, 'blur', function(e) {
        web.removeClass(textarea, 'borderfocus');
    });

    // 确定 按钮点击事件
    var ok = web.className('im_dialog_form_ok', content)[0];
    web.event.addEvent(ok, 'click', function() {
        var input = web.className('im_dialog_form_input', content)[0];
        if (input.value.trim() == "") {
            var warning = web.className('im_dialog_form_warning', content)[0];
            warning.innerHTML = "请输入群组名称";
            web.show(warning);
            return false;
        }
        // 添加/修改群组
        var gname = input.value.trim();
        var gdesc = $$(content, 'textarea')[0].value;
        var param = "uid=" + IM_CONSTANT.myself_id + "&gname=" + gname + "&gdesc=" + gdesc;
        var url = IM_CONSTANT.servlet_path + "im/modifygroup";
        if (gid) {
            url += "?gid=" + gid + "&" + param;
        } else {
            url += "?" + param;
        }
        web.ajax.get(encodeURI(url), function(result) {
            if (result.trim() == 'true') {
                // 移除 im_dialog div
                var im_dialog = web.className('im_dialog')[0];
                web.dom.dispose(im_dialog);

                // 移除 overlay
                starfish.toolkit.overlay.hide();

                // 显示 添加成功
                im_showBox('群组 <b>' + gname + '</b> 已经创建', 'hasMessage', 5);

                // 重新显示 群组列表
                im_displayGroup();
            }
        }, {});

    });
}

/**
 * 显示 群组列表
 */
function im_displayGroup() {
    var web = starfish.web;

    var group_list_inner = web.className('group_list_inner')[0];

    function _order(o) {
        for (var i = 0; i < o.length; i++) {
            var obj = o[i];
            var uid = obj['creator'];
            if (uid === IM_CONSTANT.myself_id) {
                o.erase(obj);
                o.unshift(obj);
            }
        }
    }

    // 取得自己加入的群组
    var url = IM_CONSTANT.servlet_path + "im/getgroupsbyuid?uid=" + IM_CONSTANT.myself_id + "&t=" + String.uniqueID();
    web.ajax.get(encodeURI(url), function(result) {
        // 清除原有列表
        group_list_inner.innerHTML = "";

        var o = JSON.parse("(" + result.trim() + ")");
        _order(o);
        var html = [];
        for (var i = 0; i < o.length; i++) {
            var g = o[i];
            var gid = g['gid'], uid = g['creator'],
                    gname = g['gname'], gdesc = g['desc'],
                    date = starfish.timez.parseDate(g['date'], "cn", "ymd"), member = g['member'];
            var container = im_findByUid('buddy', uid);
            var gender = container.getAttribute('gender');
            var username = container.getAttribute('username');
            var img = IM_CONSTANT.myself_id == uid ?
                    (gender == 1 ? 'images/group_creator_male.png' : 'images/group_creator_female.png') :
                    'images/group_list_normal.png';

            html.push('<div class="im_group_list group_user_container" gid="' + gid + '" uid="' + uid +
                    '" uname="' + username + '" gname="' + gname + '" title="创建人:'
                    + username + '(' + date + ')" pic="' + img + '" gdesc="' + gdesc + '">');
            html.push('  <div class="im_group_list_avatar_container">');
            html.push('    <img class="im_group_list_avatar" src="' + img + '" />');
            html.push('  </div>');
            html.push('  <div class="im_group_list_info_container">');
            html.push('    <div class="im_group_list_info_name" title="' + gname + '">' + gname + '</div>');
            html.push('    <div class="im_group_list_info_desc" title="' + gdesc + '">' + gdesc + '</div>');
            html.push('  </div>');
            html.push('</div>');
        }
        group_list_inner.innerHTML = html.join('');

        // 添加 右键菜单 ~~
        var groups = web.className('im_group_list', group_list_inner);
        var menus = null, size = null;
        for (var x = 0, y = groups.length; x < y; x++) {
            (function() {
                var group = groups[x];

                // 鼠标 移动到im_group_list之上
                web.event.addEvent(group, 'mouseover', function(e) {
                    web.addClass(group, 'backgroundColor');
                });

                // 鼠标 移出im_group_list
                web.event.addEvent(group, 'mouseout', function(e) {
                    web.removeClass(group, 'backgroundColor');
                });

                // 双击 出现群聊窗口
                web.event.addEvent(group, 'dblclick', function(e) {
                    var that = this;
                    var gid = that.getAttribute('gid');
                    // id: window_group_gid
                    var win = $('window_group_' + gid);
                    if (!win) {
                        im_genGroupChatWindow(that);
                    }
                });

                // 右键菜单 内容及其调用函数
                if (group.getAttribute('uid') == IM_CONSTANT.myself_id) {
                    menus = { // 本人是该群组创建者
                        '编辑组员': im_memberGroup,
                        '编辑群组': im_modifyGroup,
                        '删除群组': im_deleteGroup
                    };
                    size = {
                        width: 120,
                        height: 90
                    };
                } else { // 本人是普通群组成员
                    menus = {
                        '退出群组': im_quitGroup
                    };
                    size = {
                        width: 120,
                        height: 30
                    };
                }

                // 添加 右键菜单 ~~
                im_rightMenu(group, menus, size);
            })();
        }
    }, {});
}

/**
 * 删除群组
 * @param  {String}  gid  gid
 * @param  {String}  gname  群组名称
 */
function im_deleteGroup(gid, gname) {
    var web = starfish.web;

    var w = 350, h = 200;
    var border = im_showDialog(w, h, false);
    var html = im_confirmDialog("删除 " + gname + " 群组", {
        width: w,
        height: h
    });
    var content = web.className('im_dialog_content', border)[0];
    content.innerHTML = html.join('');

    var im_confirm_ok = web.className('im_confirm_ok', border)[0];
    web.event.addEvent(im_confirm_ok, 'click', function() {
        var url = IM_CONSTANT.servlet_path + "im/deletegroup?gid=" + gid;
        web.ajax.get(encodeURI(url), function(result) {
            if (result.trim() == 'true') {
                _cancel();

                // 如果有打开着的本群组窗口 则关闭之
                var win = $('window_group_' + gid);
                if (win) {
                    web.dom.dispose(win);
                }

                // 显示 删除成功
                im_showBox('群组 <b>' + gname + '</b> 已经删除', 'hasMessage', 5);

                // 重新显示 群组列表
                im_displayGroup();
            }
        }, {});
    });

    var im_confirm_cancel = web.className('im_confirm_cancel', border)[0];
    web.event.addEvent(im_confirm_cancel, 'click', function() {
        _cancel();
    });

    function _cancel() {
        web.dom.dispose(border);
        starfish.toolkit.overlay.hide();
    }

}

/**
 * 编辑群组
 * @param  {String}  gid    gid
 * @param  {String}  gname  群组名称
 * @param  {String}  gdesc  群组描述
 */
function im_modifyGroup(gid, gname, gdesc) {
    im_createGroup(gid, gname, gdesc);
}

/**
 * 编辑群组成员
 * @param gid
 * @param gname
 */
function im_memberGroup(gid, gname) {
    var web = starfish.web;

    var w = web.window.vpWidth() - 50, h = web.window.vpHeight() - 50;
    var border = im_showDialog(w, h, false);

    function showMember() {
        var html = [];
        html.push('<div class="im_member_icon">成员</div>');
        html.push('<div class="im_member" style="width:' + (w - 20) + 'px;height:' + (h - 10) + 'px">');
        html.push('  <div class="im_member_line">');
        html.push('    <div class="im_member_border">');
        html.push('      <div class="im_member_group_name f_left">');
        html.push('        <b>' + gname + '</b> 群组');
        html.push('      </div>');
        html.push('      <div class="im_member_total a_right">已选择了 <span></span> 位成员</div>');
        html.push('      <div class="im_member_list"></div>');
        html.push('    <div/>');
        html.push('  </div>');
        html.push('  <div class="im_member_line">');
        html.push('    <input type="button" class="im_member_ok" value="我选好了!" title="确定" />');
        html.push('    <input type="button" class="im_member_cancel" value="还是算了~~" title="取消" />');
        html.push('  </div>');
        html.push('</div>');
        return html;
    }

    var content = web.className('im_dialog_content', border)[0];
    content.innerHTML = showMember().join('');

    // 设置图片位置
    var im_member_icon = web.className('im_member_icon', content)[0];
    web.css(im_member_icon, 'background', 'url("images/members.png") no-repeat scroll ' + (w / 2 - 70) + 'px center');

    // 设置list的高度
    var im_member_list = web.className('im_member_list', content)[0];
    web.css(im_member_list, 'height', (h - 50 - 64 - 60) + 'px');
    var allMembers = [];
    var selectedMembers = [];
    // 得到所有人员
    (function() {
        // 以下模拟从ajax中得到的xml字符串  todo
        var xmlDom = starfish.xml.load('userlist.xml?t=' + String.uniqueID());

        var users = starfish.xml.getNodes(xmlDom.documentElement, '//' + IM_CONSTANT.xml_end_node);
        var last_pid = "";
        var ul = null;
        for (var i = 0, j = users.length; i < j; i++) {
            (function() {
                var user = users[i];
                var pid = user.getAttribute('pid');
                var uid = user.getAttribute('uid');
                var username = starfish.xml.getNode(user, 'name').firstChild.data;
                var dept = starfish.xml.getNode(user, 'dept').firstChild;
                var duty = starfish.xml.getNode(user, 'duty').firstChild;

                if (allMembers.contains(uid)) {
                    return;   // 已经包换了本uid
                } else {
                    allMembers.push(uid);
                }

                dept = dept ? dept.data : "";
                duty = duty ? duty.data : "";

                var offset = pid.lastIndexOf("_");
                var _pid = pid.substring(0, offset);
                if (last_pid !== _pid) {
                    last_pid = _pid;
                    if (ul != null) {
                        web.dom.insert(im_member_list, ul);
                    }
                    ul = web.dom.elem('ul');
                    ul.className = "im_member_list_ul";
                }
                var li = web.dom.elem('li');
                li.className = 'im_member_list_ul_li';
                li.setAttribute('uid', uid);
                var span = web.dom.elem('span');
                span.title = dept + " " + duty;
                web.dom.addText(username, span);
                web.dom.insert(li, span);
                web.dom.insert(ul, li);
                // 最后一项 加入ul
                if (i == users.length - 1) {
                    web.dom.insert(im_member_list, ul);
                }

                // 鼠标 移动到li内 改变背景
                web.event.addEvent(li, 'mouseover', function(e) {
                    web.addClass(li, 'im_member_list_member_hover');
                });

                // 鼠标 移出li
                web.event.addEvent(li, 'mouseout', function(e) {
                    web.removeClass(li, 'im_member_list_member_hover');
                });

                // 点击li 事件
                web.event.addEvent(li, 'click', function(e) {
                    var uid = li.getAttribute('uid');
                    if (web.hasClass(li, 'im_member_list_member_selected')) {
                        if (uid === IM_CONSTANT.myself_id) { // 不能移除群组创建人
                            im_showBox('不能移除群组创建人', 'hasWarning', 5);
                        } else {
                            web.removeClass(li, 'im_member_list_member_selected');
                            selectedMembers.erase(uid);
                        }
                    } else {
                        web.addClass(li, 'im_member_list_member_selected');
                        selectedMembers.push(uid);
                    }
                    // 显示 选定了几个成员
                    var im_member_total = web.className('im_member_total')[0];
                    var span = $$(im_member_total, 'span')[0];
                    span.innerHTML = selectedMembers.length;
                });
            })();
        }
    })();

    // ajax查询这个群组已经包含的成员
    var url = IM_CONSTANT.servlet_path + "/im/getgroupbygid?gid=" + gid;
    web.ajax.get(encodeURI(url), function(result) {
        var o = JSON.parse("(" + result.trim() + ")");
        var members = o['member'];
        var im_member_list = web.className('im_member_list')[0];
        var lis = $$(im_member_list, 'li');
        for (var x = 0, y = lis.length; x < y; x++) {
            var li = lis[x];
            var uid = li.getAttribute('uid');
            var reg = new RegExp("," + uid + ",");
            if (reg.test(members)) {
                web.addClass(li, 'im_member_list_member_selected');
                selectedMembers.push(uid);
            }
        }
        var im_member_total = web.className('im_member_total')[0];
        var span = $$(im_member_total, 'span')[0];
        span.innerHTML = selectedMembers.length;
    }, {});

    // 维护成员确定 事件
    var im_member_ok = web.className('im_member_ok', content)[0];
    web.event.addEvent(im_member_ok, 'click', function(e) {
        var members = "," + selectedMembers.join(',') + ",";
        var url = IM_CONSTANT.servlet_path + "im/modifygroup";
        web.ajax.post(encodeURI(url), {gid: gid, member: members}, function(result) {
            if (result.trim() == 'true') {
                _cancel();
                // 显示 成功
                im_showBox('群组成员已经修改', 'hasMessage', 5);
            }
        }, null);
    });

    // cancel 事件
    var im_member_cancel = web.className('im_member_cancel', content)[0];
    web.event.addEvent(im_member_cancel, 'click', function(e) {
        _cancel();
    });

    function _cancel() {
        web.dom.dispose(border);
        starfish.toolkit.overlay.hide();
    }
}

/**
 * 成员退出群组
 * @param gid
 * @param gname
 */
function im_quitGroup(gid, gname) {
    var web = starfish.web;

    var w = 350, h = 200;
    var border = im_showDialog(w, h, false);
    var html = im_confirmDialog("退出 " + gname + " 群组", {
        width: w,
        height: h
    });
    var content = web.className('im_dialog_content', border)[0];
    content.innerHTML = html.join('');

    var im_confirm_ok = web.className('im_confirm_ok', border)[0];
    web.event.addEvent(im_confirm_ok, 'click', function() {
        var url = IM_CONSTANT.servlet_path + "im/getgroupbygid?oper=quitgroup&gid="
                + gid + "&uid=" + IM_CONSTANT.myself_id;
        web.ajax.get(encodeURI(url), function(result) {
            if (result.trim() != 'null') {
                _cancel();

                // 如果有打开着的本群组窗口 则关闭之
                var win = $('window_group_' + gid);
                if (win) {
                    web.dom.dispose(win);
                }

                // 显示 退出成功
                im_showBox('您已经退出了 <b>' + gname + '</b> 群组', 'hasMessage', 5);

                // 重新显示 群组列表
                im_displayGroup();
            }
        }, {});
    });

    var im_confirm_cancel = web.className('im_confirm_cancel', border)[0];
    web.event.addEvent(im_confirm_cancel, 'click', function() {
        _cancel();
    });

    function _cancel() {
        web.dom.dispose(border);
        starfish.toolkit.overlay.hide();
    }
}

// ************************************* //
