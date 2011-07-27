package com.dfjq.pojo.im.bean;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class GroupRowMapper implements RowMapper {
    @Override
    public Object mapRow(ResultSet resultSet, int i) throws SQLException {
        Group group = new Group();
        group.setGid(resultSet.getString("group_id"));
        group.setName(resultSet.getString("group_name"));
        group.setDesc(resultSet.getString("group_desc"));
        group.setDate(resultSet.getString("group_create_date"));
        group.setCreator(resultSet.getString("group_creator"));
        group.setMember(resultSet.getString("group_member"));
        return group;
    }
}
