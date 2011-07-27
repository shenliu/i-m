package com.dfjq.pojo.im;

import com.dfjq.pojo.im.bean.Group;
import com.dfjq.pojo.im.dao.ImDao;

import java.util.List;

public class Operation {
    private ImDao imDao;

    public void setImDao(ImDao imDao) {
        this.imDao = imDao;
    }

    public Operation() {
    }

    public boolean addGroup(Group group) {
        return imDao.addGroup(group);
    }

    public boolean updateGroup(Group group) {
        return imDao.updateGroup(group);
    }

    public Group getGroupByGid(String gid) {
        return imDao.getGroupByGid(gid);
    }

    public List getGroupsByUid(String uid) {
        return imDao.getGroupsByUid(uid);
    }

    public boolean deleteGroup(String gid) {
        return imDao.deleteGroup(gid);
    }

}
