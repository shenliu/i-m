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
select * from bc_im_group