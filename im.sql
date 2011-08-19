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
--drop table bc_im_offlineMessage
create table bc_im_offlineMessage(
    om_id int identity(1,1) primary key,
    om_group_id varchar(50), --群组id
    om_group_name varchar(500), --群组名称
    om_from_id varchar(50) not null, --消息发送者id
    om_from_name varchar(500), --消息发送者名�?
    om_to_id varchar(50) not null, --消息接收者id
    om_to_name varchar(500), --消息接收者名�?
    om_date char(8) not null, --发送日�?
    om_time char(6) not null, --发送时�?
    om_message text, --消息
    om_style varchar(1000), --样式
    om_file_name varchar(1000), --文件名称
    om_file_type varchar(50), --文件类型
    om_file_path varchar(2000) --文件路径
);
