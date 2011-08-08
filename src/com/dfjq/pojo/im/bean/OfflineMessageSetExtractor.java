package com.dfjq.pojo.im.bean;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;

import java.sql.ResultSet;
import java.sql.SQLException;

public class OfflineMessageSetExtractor implements ResultSetExtractor {
    @Override
    public Object extractData(ResultSet resultSet) throws SQLException, DataAccessException {
        OfflineMessage om = new OfflineMessage();
        if (resultSet.next()) {
            om.setId(resultSet.getInt("om_id"));
            om.setGroupId(resultSet.getString("om_group_id"));
            om.setGroupName(resultSet.getString("om_group_name"));
            om.setFromId(resultSet.getString("om_from_id"));
            om.setFromName(resultSet.getString("om_from_name"));
            om.setToId(resultSet.getString("om_to_id"));
            om.setToName(resultSet.getString("om_to_name"));
            om.setDate(resultSet.getString("om_date"));
            om.setTime(resultSet.getString("om_time"));
            om.setMessage(resultSet.getString("om_message"));
            om.setFileName(resultSet.getString("om_file_name"));
            om.setFileType(resultSet.getString("om_file_type"));
            om.setFilePath(resultSet.getString("om_file_path"));
        }
        return om;
    }
}
