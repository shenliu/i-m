function im_userlist() {
    var web = starfish.web;

    // 以下模拟从ajax中得到的xml字符串  todo
    var xmlDom = starfish.xml.load('userlist.xml?t=' + String.uniqueID());

    var buddy_list = web.className('buddy_list')[0];
    web.show(buddy_list);

    _parse(buddy_list, xmlDom.documentElement, 0);

    function _parse(container, dom, indent) {
        var children = dom.childNodes;
        for (var i = 0, j = children.length; i < j; i++) {
            var child = children[i];

            if (child.nodeType === 3) {
                continue;
            }
            if (child.tagName !== IM_CONSTANT.xml_end_node) {
                var buddy_list_collapsed = _genDiv(child);

                // 点击事件
                web.event.addEvent(buddy_list_collapsed, 'click', function() {
                    _showhide(this);
                });

                var buddy_list_body = web.dom.elem('div');
                buddy_list_body.className = 'buddy_list_body';
                //indent++;
                web.addClass(buddy_list_body, "buddy_list_body_indent");
                //web.css(buddy_list_body, 'paddingLeft', (20 * indent) + 'px');

                _parse(buddy_list_body, child, indent);
                //indent = 0;

                web.dom.insert(container, buddy_list_collapsed);
                web.dom.insert(container, buddy_list_body);
            } else {
                if (container.innerHTML === "") {  // 只添加一次
                    var buddy_callme = web.dom.elem('div');
                    buddy_callme.className = 'buddy_callme';

                    var buddy_online = web.dom.elem('div');
                    buddy_online.className = 'buddy_online';

                    var buddy_away = web.dom.elem('div');
                    buddy_away.className = 'buddy_away';

                    var buddy_busy = web.dom.elem('div');
                    buddy_busy.className = 'buddy_busy';

                    var buddy_silent = web.dom.elem('div');
                    buddy_silent.className = 'buddy_silent';

                    var buddy_hidden = web.dom.elem('div');
                    buddy_hidden.className = 'buddy_hidden';

                    var buddy_offline = web.dom.elem('div');
                    buddy_offline.className = 'buddy_offline';

                    web.dom.insert(container, buddy_callme);
                    web.dom.insert(container, buddy_online);
                    web.dom.insert(container, buddy_away);
                    web.dom.insert(container, buddy_busy);
                    web.dom.insert(container, buddy_silent);
                    web.dom.insert(container, buddy_hidden);
                    web.dom.insert(container, buddy_offline);
                }

                var uid = child.getAttribute('uid');
                //var status = child.getAttribute('status');
                var status = -1;
                // 注意: name gender转成字符串 其他为Node对象
                var name = starfish.xml.getNode(child, 'name').firstChild.data;
                var gender = starfish.xml.getNode(child, 'gender').firstChild.data;
                var sign = starfish.xml.getNode(child, 'sign').firstChild;
                var picture = starfish.xml.getNode(child, 'picture').firstChild;
                var telephone = starfish.xml.getNode(child, 'telephone').firstChild;
                var mobile = starfish.xml.getNode(child, 'mobile').firstChild;
                var dept = starfish.xml.getNode(child, 'dept').firstChild;
                var duty = starfish.xml.getNode(child, 'duty').firstChild;

                sign = sign ? sign.data : "";
                telephone = telephone ? telephone.data : "";
                mobile = mobile ? mobile.data : "";
                dept = dept ? dept.data : "";
                duty = duty ? duty.data : "";

                var buddy_user_container = web.dom.elem('div');
                buddy_user_container.className = 'buddy_user_container';

                var buddy_user_avatar_container = web.dom.elem('div');
                buddy_user_avatar_container.className = 'buddy_user_avatar_container';

                var buddy_user_avatar = web.dom.elem('img');
                buddy_user_avatar.className = 'buddy_user_avatar';

                // 在列表中只显示 male/female的头像
                if (picture === null) {
                    picture = "images/nopic.png";
                } else {
                    picture = picture.data;
                    // todo
                }
                buddy_user_avatar.src = gender === "1" ? "images/male.png" : "images/female.png";;

                var buddy_user_state = web.dom.elem('div');
                buddy_user_state.className = 'buddy_user_state';

                var buddy_user_info_container = web.dom.elem('div');
                buddy_user_info_container.className = 'buddy_user_info_container';

                var buddy_user_info_name = web.dom.elem('div');
                buddy_user_info_name.className = 'buddy_user_info_name';
                web.dom.addText(name, buddy_user_info_name);

                var buddy_user_info_sign = web.dom.elem('div');
                buddy_user_info_sign.className = 'buddy_user_info_sign';
                buddy_user_info_sign.title = sign;
                web.dom.addText(sign, buddy_user_info_sign);

                // 状态样式
                //var statusClass = '';

                switch (parseInt(status)) {
                    case IM_CONSTANT.user_status.online:
                        buddy_user_avatar_container.title = '在线';
                        buddy_user_info_name.title = name + " - 在线";
                        web.dom.insert(buddy_online, buddy_user_container);
                        break;
                    case IM_CONSTANT.user_status.away:
                        buddy_user_avatar_container.title = '离开';
                        web.addClass(buddy_user_state, 'buddy_user_state_away');
                        //statusClass = 'buddy_user_state_away';
                        buddy_user_info_name.title = name + " - 离开";
                        web.dom.insert(buddy_away, buddy_user_container);
                        break;
                    case IM_CONSTANT.user_status.silent:
                        buddy_user_avatar_container.title = '请勿打扰';
                        web.addClass(buddy_user_state, 'buddy_user_state_silent');
                        //statusClass = 'buddy_user_state_silent';
                        buddy_user_info_name.title = name + " - 请勿打扰";
                        web.dom.insert(buddy_silent, buddy_user_container);
                        break;
                    case IM_CONSTANT.user_status.busy:
                        buddy_user_avatar_container.title = '忙碌';
                        web.addClass(buddy_user_state, 'buddy_user_state_busy');
                        //statusClass = 'buddy_user_state_busy';
                        buddy_user_info_name.title = name + " - 忙碌";
                        web.dom.insert(buddy_busy, buddy_user_container);
                        break;
                    case IM_CONSTANT.user_status.hidden:
                        buddy_user_avatar_container.title = '';
                        web.dom.insert(buddy_hidden, buddy_user_container);
                        break;
                    case IM_CONSTANT.user_status.offline:
                        buddy_user_avatar_container.title = '离线';
                        buddy_user_info_name.title = name + " - 离线";
                        web.dom.insert(buddy_offline, buddy_user_container);
                        break;
                }

                web.dom.insert(buddy_user_avatar_container, buddy_user_avatar);
                web.dom.insert(buddy_user_avatar_container, buddy_user_state);

                web.dom.insert(buddy_user_info_container, buddy_user_info_name);
                web.dom.insert(buddy_user_info_container, buddy_user_info_sign);

                web.dom.insert(buddy_user_container, buddy_user_avatar_container);
                web.dom.insert(buddy_user_container, buddy_user_info_container);

                // 添加属性 在打开对话窗口时使用
                buddy_user_container.setAttribute('uid', uid);
                //buddy_user_container.setAttribute('status', status);
                buddy_user_container.setAttribute('username', name);
                buddy_user_container.setAttribute('gender', gender);
                buddy_user_container.setAttribute('sign', sign);
                buddy_user_container.setAttribute('picture', picture);
                buddy_user_container.setAttribute('telephone', telephone);
                buddy_user_container.setAttribute('mobile', mobile);
                buddy_user_container.setAttribute('dept', dept);
                buddy_user_container.setAttribute('duty', duty);
                //buddy_user_container.setAttribute('statusClass', statusClass);

                // 双击事件 开始对话窗口
                web.event.addEvent(buddy_user_container, 'dblclick', function() {
                    var that = this;
                    var uid = that.getAttribute('uid');
                    if (uid === IM_CONSTANT.myself_id) { // 是自己不显示窗口
                        return;
                    }
                    var win = $('window_' + IM_CONSTANT.myself_id + "_" + uid);
                    if (!win) {
                        im_genChatWindow(that);
                    }
                });

                // 鼠标 移动到buddy_user_container之上
                web.event.addEvent(buddy_user_container, 'mouseover', function(e) {
                    web.addClass(this, 'backgroundColor');
                });

                // 鼠标 移出buddy_user_container
                web.event.addEvent(buddy_user_container, 'mouseout', function(e) {
                    web.removeClass(this, 'backgroundColor');
                });

            }
        }
    }

    /**
     * 生成 div
     */
    function _genDiv(obj) {
        var buddy_list_collapsed = web.dom.elem('div');
        buddy_list_collapsed.className = 'buddy_list_collapsed';

        var buddy_list_head_icon = web.dom.elem('div');
        buddy_list_head_icon.className = 'buddy_list_head_icon';

        var buddy_list_head_container = web.dom.elem('div');
        buddy_list_head_container.className = 'buddy_list_head_container';
        buddy_list_head_container.title = obj.getAttribute('name');

        var buddy_list_name = web.dom.elem('div');
        buddy_list_name.className = 'buddy_list_name';
        web.dom.addText(obj.getAttribute('name'), buddy_list_name);

        web.dom.insert(buddy_list_head_container, buddy_list_name);

        if (obj.getAttribute('total') !== null) {
            var span = web.dom.elem('span');
            span.innerHTML = "[<span class='onlineNumber'>0</span>/" + obj.getAttribute('total') + "]";
            web.dom.insert(buddy_list_head_container, span);
        }

        web.dom.insert(buddy_list_collapsed, buddy_list_head_icon);
        web.dom.insert(buddy_list_collapsed, buddy_list_head_container);

        return buddy_list_collapsed;
    }

    /**
     * 层次结构 点击事件
     */
    function _showhide(o) {
        var buddy_list_body = web.dom.next(o);
        if (o.className === 'buddy_list_collapsed') {
            web.show(buddy_list_body);
            web.css(buddy_list_body, 'height', 'auto');
            o.className = 'buddy_list_expanded';
        } else {
            web.hide(buddy_list_body);
            web.css(buddy_list_body, 'height', '0');
            o.className = 'buddy_list_collapsed';
        }
    }

}
