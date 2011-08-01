/**
 *  查找成员
 */

/**
 * 查找框 初始化
 */
function im_search_init() {
    var web = starfish.web;

    var search_input = web.className('main_search_input')[0];
    var main_search_bt = web.className('main_search_bt')[0];
    var search_result = web.className('main_search_result')[0];
    var wrap = "<div class='hover-wrap'></div>";

    wrap = web.dom.wrap(search_input, wrap);
    var label = web.dom.prev(wrap); // 得到包裹元素前面的<label>元素
    label = web.dom.parent(label).removeChild(label); // 移除<label>元素
    web.dom.insert(wrap, label, 'top');

    // 如果search_input的value有值则隐藏<label>
    if (search_input.value) {
        web.hide(label);
    }

    web.event.addEvent(search_input, "focus", function() {
        web.hide(label);
        web.addClass(search_input, 'main_search_input_focus');
        web.addClass(main_search_bt, 'main_search_bt_hightlight');
        this.select();
    });

    web.event.addEvent(search_input, "blur", function() {
        if (!this.value) {
            web.show(label);
        }
        web.removeClass(search_input, 'main_search_input_focus');
        web.removeClass(main_search_bt, 'main_search_bt_hightlight');
    });

    // 解决鼠标点击在label上不进入input的问题
    web.event.addEvent(label, "click", function() {
        web.hide(label);
        web.addClass(search_input, 'main_search_input_focus');
        web.addClass(main_search_bt, 'main_search_bt_hightlight');
        search_input.focus();
    });

    // 搜索栏 键盘事件
    web.event.addEvent(search_input, "keyup", function(e) {
        // 非 回车 向上 向下
        if (e.keyCode != 13 && e.keyCode != 38 && e.keyCode != 40) {
            var v = this.value.toString().trim();
            search_result.innerHTML = "";
            if (v.length > 0) {
                var result = _findByUsername(v);
                if (result.length === 0) {
                    search_result.innerHTML = "<span>没有找到相关成员</span>";
                } else {
                    var ul = web.dom.elem('ul');
                    for (var i = 0, j = result.length; i < j; i++) {
                        (function() {
                            var o = result[i];
                            var li = web.dom.elem('li');
                            li.setAttribute('uid', o['uid']);
                            web.dom.addText(o['name'], li);

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
                                im_showMessage(o['uid']);
                                web.hide(search_result);
                            });

                            web.dom.insert(ul, li);
                        })();
                    }
                    web.dom.insert(search_result, ul);
                }
                web.show(search_result);
            } else {
                web.hide(search_result);
            }
        }
    });

    var curli = null; // 当前的li
    web.event.addEvent(search_input, "keyup", function(e) {
        var lis = $$(search_result, "li");

        if (lis.length > 0 && web.css(search_result, "display") === "block") {  // search_result显示时
            if (e.keyCode == 13) {    // 回车
                if (curli) {
                    im_showMessage(curli.getAttribute('uid'));
                    web.hide(search_result);
                }
                return false;
            } else if (e.keyCode == 38) {    // 上箭头
                return _curli((curli && curli.previousSibling) || lis[lis.length - 1]);
            } else if (e.keyCode == 40) {    // 下箭头
                return _curli((curli && curli.nextSibling) || lis[0]);
            }
        }

        function _curli(elem) {
            if (!elem) {
                return false;
            }
            curli = elem;
            for (var i = 0, j = lis.length; i < j; i++) {
                web.removeClass(lis[i], 'backgroundColor');
            }
            web.addClass(elem, 'backgroundColor');
            return false;
        }
    });

    function _findByUsername(name) {
        var result = [];
        var list = starfish.web.className('buddy_list')[0];
        var containers = starfish.web.className('buddy_user_container', list, 'div');
        for (var ii = 0, jj = containers.length; ii < jj; ii++) {
            var container = containers[ii];
            var _name = container.getAttribute('username');
            if (_name.indexOf(name) != -1) {
                var uid = container.getAttribute('uid');
                result.push({
                    uid: uid,
                    name: _name
                });
            }
        }
        return result;
    }

}