--drop table bc_im_group
-- 群组
create table bc_im_group(
	group_id varchar(40) primary key,
    group_name varchar(100) not null, --群组名称
    group_desc varchar(1000), --群组描述
	group_create_date char(8), --创建时间
	group_creator varchar(50), --创建�?uid
	group_member text --群组成员
);

-- 离线消息存储
create table bc_im_offlineMessage(
    om_id int identity(1,1) primary key,
    om_group_id varchar(40), --群组id
    om_group_name varchar(100), --群组名称
    om_from_id varchar(20) not null, --消息发送者id
    om_from_name varchar(20), --消息发送者名称
    om_to_id varchar(20) not null, --消息接收者id
    om_to_name varchar(20), --消息接收者名称
    om_date char(8) not null, --发送日期
    om_time char(6) not null, --发送时间
    om_message text, --消息
    om_file_name varchar(100), --文件名称
    om_file_type varchar(20), --文件类型
    om_file_path varchar(2000) --文件路径
);
