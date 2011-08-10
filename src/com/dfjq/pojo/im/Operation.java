package com.dfjq.pojo.im;

import com.dfjq.pojo.im.bean.Group;
import com.dfjq.pojo.im.bean.OfflineMessage;
import com.dfjq.pojo.im.dao.ImDao;

import java.util.List;

public class Operation {
    private ImDao imDao;

    public void setImDao(ImDao imDao) {
        this.imDao = imDao;
    }

    public Operation() {
    }

    // 群组
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

    // 离线消息
    public boolean addOfflineMessage(OfflineMessage om) {
        return imDao.addOfflineMessage(om);
    }

    public boolean addOfflineMessages(List<OfflineMessage> oms) {
        return  imDao.addOfflineMessages(oms);
    }

    public List<OfflineMessage> getOfflineMessagesByUid(String uid) {
        return imDao.getOfflineMessagesByUid(uid);
    }

    public boolean deleteOfflineMessage(String uid, String date, String time) {
        return imDao.deleteOfflineMessage(uid, date, time);
    }

}
