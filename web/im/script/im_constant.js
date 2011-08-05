var IM_CONSTANT = {
    servlet_path: "../", // servlet路径

    myself_id: null, // 记录自己的user id
    myself_name: '',

    hyphen: "###", // 分隔符

    xml_end_node: 'user', // xml中定义user的最终node name

    width_min: 280,  // im窗体最小宽度
    height_min: 100, // im窗体最小高度

    user_status: {  // 用户状态
        state:   'state',
        online:  1,  // 在线
        away:    2,  // 离开
        silent:  3,  // 请勿打扰
        busy:    4,  // 忙碌
        hidden:  0,  // 隐身
        offline: -1  // 离线
    },

    user_status_desc: {  // 用户状态说明
        state:   'state',
        online:  '我在线上',
        away:    '离开',
        silent:  '请勿打扰',
        busy:    '忙碌',
        hidden:  '不在线', // 这儿~~~
        offline: '离线'
    },

    show_offline_user: true, // 是否显示离线用户

    last_chatwindow: null, // 记录上一次的 chatwindow 对象 使其他chatwindow可以在最上层显示(z-index)

    server_host: '',   // 在im_constant_url.js中定义
    server_port: 2528,

    socket: null, // jsocket 实例对象

    fonts: ['宋体', '黑体', '隶书', '微软雅黑', '楷体_GB2312', '幼圆',
        'Arial', 'Arial Black', 'Times New Roman', 'Verdana'],

    image_type_allowable: ['png', 'jpg', 'jpeg', 'gif', 'bmp'], // 允许的上传图片类型

    image_maxSize_allowable: 1024, // 允许最大的上传图片大小 KB

    file_maxSize_allowable: 100 * 1024, // 允许最大的上传文件大小 KB

    user_stylez: {    // 用户聊天样式(默认值)
        family: "宋体"
        ,size: 10
        ,weight: false
        ,italic: false
        ,underline: false
        ,color: "#000000"
    },

    online_message: {},  // 在线消息队列
    online_message_shake: {}, // 在线消息用户头像晃动

    offline_message: {} // 不在线时的消息队列
};

IM_CONSTANT.command = {
    msg: 'msg',
    group: 'group',
    broadcast: 'broadcast',
    transfer: 'transfer',
    status: IM_CONSTANT.user_status
};
