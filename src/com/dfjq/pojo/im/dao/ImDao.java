package com.dfjq.pojo.im.dao;

import com.dfjq.pojo.im.bean.Group;

import java.util.List;

public interface ImDao {
    public boolean addGroup(Group group);

    public boolean updateGroup(Group group);

    public Group getGroupByGid(String gid);

    public List getGroupsByUid(String uid);

    public boolean deleteGroup(String gid);
}
