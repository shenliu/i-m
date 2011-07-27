var IM_CONSTANT = {
    servlet_path: "../", // servlet路径

    myself_id: null, // 记录自己的user id
    myself_name: '',

    hyphen: "#*#", // 分隔符

    xml_end_node: 'user', // xml中定义user的最终node name

    width_min: 280,  // im窗体最小宽度
    height_min: 100, // im窗体最小高度

    user_status: {  // 用户状态
        online:  1,  // 在线
        away:    2,  // 离开
        silent:  3,  // 请勿打扰
        busy:    4,  // 忙碌
        hidden:  0,  // 隐身
        offline: -1  // 离线
    },

    show_offline_user: true, // 是否显示离线用户

    last_chatwindow: null, // 记录上一次的 chatwindow 对象 使其他chatwindow可以在最上层显示(z-index)

    server_host: '192.168.0.164',
    server_port: 2528,

    socket: null, // jsocket 实例对象

    fonts: ['宋体', '黑体', '隶书', '微软雅黑', '楷体_GB2312', '幼圆',
        'Arial', 'Arial Black', 'Times New Roman', 'Verdana'],

    user_stylez: {    // 用户聊天样式
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
    status: IM_CONSTANT.user_status
};
