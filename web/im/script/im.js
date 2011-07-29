// im启动~~
starfish.web.event.addEvent(window, 'load', function(){
    var web = starfish.web;

    IM_CONSTANT.myself_id = location.search.getParamter('userid'); // 这里 '本人' 的Id暂为传进来的参数 todo

    // jSocket
    IM_CONSTANT.socket = new jSocket();

    IM_CONSTANT.socket.onReady = function() {
        IM_CONSTANT.socket.connect(IM_CONSTANT.server_host, IM_CONSTANT.server_port);
    };

    IM_CONSTANT.socket.onData = im_callback;

    IM_CONSTANT.socket.setup('im_socket');

    IM_CONSTANT.socket.onConnect = function(success, msg) {
        if (success) {
            IM_CONSTANT.socket.write("###USERID###:" + IM_CONSTANT.myself_id);
            IM_CONSTANT.socket.write("state" + IM_CONSTANT.hyphen
                    + IM_CONSTANT.myself_id + IM_CONSTANT.hyphen + "online");
        }
    };

    ////////////////////////////////////////////

    var window = im_window({
        id: 'im_window',
        clazz: {
            width: '280px',
            height: '550px',
            right: '20px',
            top: '20px'
        }
    });

    var window_title = web.className('window_title titleText', window)[0];
    web.dom.addText("I'm", window_title);

    var win_body = web.className('win_body', window)[0];
    var html = [];
    html.push('<div class="my_panel">');
    html.push('  <div class="my_panel_avatar"></div>');
    html.push('    <div class="my_panel_info">');
    html.push('      <div class="my_panel_info_state" title="更改在线状态">');
    html.push('        <div class="my_panel_info_state_show">状态</div>');
    html.push('        <div class="my_panel_info_state_down">下</div>');
    html.push('      </div>');
    html.push('    <div class="my_panel_info_nickname"></div>');
    html.push('  </div>');
    html.push('  <div class="my_panel_service">');
    html.push('    <div class="my_panel_signature_wraper">');
    html.push('      <input class="my_panel_signature" readonly="readonly" type="text" title="" />');
    html.push('    </div>');
    html.push('  </div>');
    html.push('</div>');

    html.push('<div class="my_toolbar"></div>');
    html.push('<div class="my_mainPanel">');
    html.push('  <div class="main_searchBar">');
    html.push('    <label class="main_search_label">查找成员...</label>');
    html.push('    <input class="main_search_input" type="text" title="查找成员..." value="" />');
    html.push('    <div class="main_search_bt" title="查找...">查找按钮</div>');
    html.push('    <div class="main_search_result"></div>');
    html.push('  </div>');
    html.push('  <ul class="main_tab">');
    html.push('    <li class="main_tab_buddy" title="联系人">');
    html.push('      <a class="main_tab_menu_icon" href="#"></a>');
    html.push('      <div class="main_tab_buddy_icon"></div>');
    html.push('    </li>');
    html.push('    <li class="main_tab_group" title="群/讨论组">');
    html.push('      <a class="main_tab_menu_icon" href="#"></a>');
    html.push('      <div class="main_tab_group_icon"></div>');
    html.push('    </li>');
    html.push('    <li class="main_tab_recent" title="最近联系人">');
    html.push('      <a class="main_tab_menu_icon" href="#"></a>');
    html.push('      <div class="main_tab_recent_icon"></div>');
    html.push('    </li>');
    html.push('  </ul>');
    html.push('  <div class="main_tab_container">');
    html.push('    <div class="main_tab_buddy_panel">');
    html.push('      <div class="buddy_list"></div>');
    html.push('    </div>');
    html.push('    <div class="main_tab_group_panel">');
    html.push('      <ul class="group_tab">');
    html.push('        <li class="group_tab_selected" title="点击刷新群组列表">我的群</li>');
    //html.push('      <li>讨论组</li>');
    html.push('      </ul>');
    html.push('      <div class="group_box">');
    html.push('        <div class="group_list_outer"><div class="group_list_inner"></div></div>');
    html.push('        <div class="group_list_bottom">');
    html.push('          <a href="#" class="create_group" title="创建群">');
    html.push('            <div class="create_group_div"></div>创建');
    html.push('          </a>');
    html.push('        </div>');
    html.push('      </div>');
    html.push('    </div>');
    html.push('    <div class="main_tab_recent_panel"></div>');
    html.push('  </div>');
    html.push('</div>');
    win_body.innerHTML = html.join('');

    // 为 im_button 添加点击事件
    web.event.addEvent($('im_button'), 'click', function() {
        var window = $('im_window');
        if (web.css(window, 'display') == 'none') {
            web.show(window);
        } else {
            web.hide(window);
        }
    });

    // 窗口最小化 事件
    var window_min = web.className('window_min', window)[0];
    web.event.addEvent(window_min, 'click', function() {
        var window = $('im_window');
        web.hide(window);
    });

    // 窗口关闭 事件
    // todo

    // 为main tab的li添加点击事件 切换tab
    var main_tab = web.className('main_tab')[0];
    var lis = $$(main_tab, 'li');
    for (var i = 0; i < lis.length; i++) {
        (function() {
            var li = lis[i];
            var a = web.dom.first(li);
            web.event.addEvent(li, 'click', function() {
                // 全部隐藏 tab栏容器 中的div
                var main_tab_container = web.className('main_tab_container')[0];
                //var divs = $$(main_tab_container, 'div');
                for (var k = 0; k < main_tab_container.childNodes.length; k++) {
                    var node = main_tab_container.childNodes[k];
                    if (node.nodeType != 1) {
                        continue;
                    }
                    web.hide(node);
                }

                // 先去除各个li的'main_tab_current'样式 隐藏其中的<a></a>
                for (var j = 0; j < lis.length; j++) {
                    var _li = lis[j];
                    var _a = web.dom.first(_li);
                    web.removeClass(_li, 'main_tab_current');
                    if (_li === li) {
                        web.show(_a);
                    } else {
                        web.hide(_a);
                    }
                }

                web.addClass(li, 'main_tab_current');
                // 显示本li对应的'tab栏容器'中的div
                var className = li.className.split(" ")[0];
                web.show(web.className(className + '_panel')[0]);
            });

            // 为<a></a>添加点击事件 显示菜单
            web.event.addEvent(a, 'click', function() {
                // todo
                return false;
            });
        })();
    }

    // 初始时 触发'联系人'
    if (lis[0].click) {
        lis[0].click();
    } else {  // chrome
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        lis[0].dispatchEvent(evt);
    }

    // 在线状态初始化
    im_state();

    // 查找框 初始化
    im_search_init();

    // 构建 联系人 列表  在im_userlist.js中
    im_userlist();

    // 确定 main_tab_container 的高度,使得可以出现纵向滚动条 在im_resize.js中
    im_fix_mainTabContainer_height(window);

    // 显示 mypanel 中的内容
    im_showMyself();

    // 群组初始化
    im_initGroup();

    // user style 等
    im_getCookie('userStyle');

    // 表情初始化
    im_face();
});

/**
 *  显示 mypanel 中的内容
 */
function im_showMyself() {
    var web = starfish.web;

    // 取自己的名字
    var myself = im_findByUid('buddy', IM_CONSTANT.myself_id);
    IM_CONSTANT.myself_name = myself.getAttribute('username');

    var myIcon = myself.getAttribute('picture');

    // 头像
    var my_panel_avatar = web.className('my_panel_avatar')[0];
    var html = [];
    html.push('<img src="' + myIcon + '" title="' + IM_CONSTANT.myself_name + '" />');
    my_panel_avatar.innerHTML = html.join('');

    // 在线状态
    var my_panel_info_state_show = web.className('my_panel_info_state_show')[0];
    web.addClass(my_panel_info_state_show, 'state_online');

    // 名字
    var my_panel_info_nickname = web.className('my_panel_info_nickname')[0];
    web.dom.addText(IM_CONSTANT.myself_name, my_panel_info_nickname);

    // 签名
    var mySign = myself.getAttribute('sign');
    var my_panel_signature = web.className('my_panel_signature')[0];
    my_panel_signature.value = mySign;
}

// 屏蔽 右键菜单
document.oncontextmenu = function() {
    return false;
};

// ie 拖拽不选择
if (starfish.client.browser.ie) {
    starfish.web.event.addEvent(document, 'selectstart', function() {
        return false;
    });
}
