package com.dfjq.pojo.im.bean;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;

import java.sql.ResultSet;
import java.sql.SQLException;

public class GroupResultSetExtractor implements ResultSetExtractor {
    @Override
    public Object extractData(ResultSet resultSet) throws SQLException, DataAccessException {
        Group group = new Group();
        if (resultSet.next()) {
            group.setGid(resultSet.getString("group_id"));
            group.setName(resultSet.getString("group_name"));
            group.setDesc(resultSet.getString("group_desc"));
            group.setDate(resultSet.getString("group_create_date"));
            group.setCreator(resultSet.getString("group_creator"));
            group.setMember(resultSet.getString("group_member"));
        }
        return group;
    }
}
