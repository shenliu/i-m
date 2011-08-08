package com.dfjq.pojo.im.dao.impl;

import com.dfjq.pojo.im.bean.*;
import com.dfjq.pojo.im.dao.ImDao;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.List;

public class ImDaoImpl implements ImDao {
    private JdbcTemplate jdbcTemplate;

    public void setDataSource(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public boolean addGroup(Group group) {
        String sql = "insert into bc_im_group(group_id,group_name,group_desc,group_create_date,group_creator,group_member) " +
                "values (?,?,?,?,?,?)";
        Object[] params = new Object[]{
                group.getGid(),
                group.getName(),
                group.getDesc(),
                group.getDate(),
                group.getCreator(),
                "," + group.getMember() + ","
        };
        int result = jdbcTemplate.update(sql, params);
        return result > 0;
    }

    @Override
    public boolean updateGroup(Group group) {
        String sql = "update bc_im_group set group_name=?,group_desc=?,group_member=? where group_id=?";
        Object[] params = new Object[]{
                group.getName(),
                group.getDesc(),
                group.getMember(),
                group.getGid()
        };
        int result = jdbcTemplate.update(sql, params);
        return result > 0;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Group getGroupByGid(String gid) {
        String sql = "select * from bc_im_group where group_id=?";
        Group group = (Group) jdbcTemplate.query(sql, new Object[]{gid}, new GroupResultSetExtractor());
        return group;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List getGroupsByUid(String uid) {
        String sql = "select * from bc_im_group where group_member like '%," + uid + ",%'";
        return jdbcTemplate.query(sql, new GroupRowMapper());
    }

    @Override
    @SuppressWarnings("unchecked")
    public boolean deleteGroup(String gid) {
        String sql = "delete from bc_im_group where group_id=?";
        int result = jdbcTemplate.update(sql, gid);
        return result > 0;
    }

    @Override
    public boolean saveOfflineMessage(OfflineMessage om) {
        String sql = "insert into bc_im_offlineMessage(om_group_id,om_group_name,om_from_id,om_from_name,om_to_id,om_to_name,om_date,om_time,om_message,om_file_name,om_file_type,om_file_path) " +
                "values (?,?,?,?,?,?,?,?,?,?,?,?)";
        Object[] params = new Object[]{
                om.getGroupId(),
                om.getGroupName(),
                om.getFromId(),
                om.getFromName(),
                om.getToId(),
                om.getToName(),
                om.getDate(),
                om.getTime(),
                om.getMessage(),
                om.getFileName(),
                om.getFileType(),
                om.getFilePath()
        };
        int result = jdbcTemplate.update(sql, params);
        return result > 0;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<OfflineMessage> getOfflineMessagesByUid(String uid) {
        String sql = "select * from bc_im_offlineMessage where om_to_id='" + uid + "' order by om_date,om_time desc";
        return jdbcTemplate.query(sql, new OfflineMessageRowMapper());
    }

    @Override
    public boolean deleteOfflineMessage(String uid, String date, String time) {
        String sql = "delete from bc_im_offlineMessage where om_to_id=? and om_date=? and om_time=?";
        int result = jdbcTemplate.update(sql, uid, date, time);
        return result > 0;
    }

}
