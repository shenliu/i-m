package com.dfjq.pojo.im.dao;

import com.dfjq.pojo.im.bean.Group;
import com.dfjq.pojo.im.bean.OfflineMessage;

import java.util.List;

public interface ImDao {
    // 群组
    public boolean addGroup(Group group);

    public boolean updateGroup(Group group);

    public Group getGroupByGid(String gid);

    public List<Group> getGroupsByUid(String uid);

    public boolean deleteGroup(String gid);

    // 离线消息
    public boolean addOfflineMessage(OfflineMessage om);

    public boolean addOfflineMessages(List<OfflineMessage> oms);

    public List<OfflineMessage> getOfflineMessagesByUid(String uid);

    public boolean deleteOfflineMessage(String uid, String date, String time);
}
