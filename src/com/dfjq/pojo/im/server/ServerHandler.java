package com.dfjq.pojo.im.server;

import com.dfjq.pojo.im.Constant;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IoSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ServerHandler extends IoHandlerAdapter {
    private static final Logger logger = LoggerFactory
            .getLogger(ServerHandler.class);

    /**
     * String: session.getRemoteAddress()
     * Map<String, IoSession>:
     * String: uid
     * IoSession: ioisession
     */
    private ConcurrentMap<String, Map<String, IoSession>> sessions = new ConcurrentHashMap<String, Map<String, IoSession>>();

    @Override
    public void sessionCreated(IoSession session) throws Exception {
        //InetSocketAddress isa = (InetSocketAddress) session.getRemoteAddress();
        //logger.info("客户端(sessionCreated):" + isa.getAddress().getHostAddress() + ":" + isa.getPort());
    }

    @Override
    public void sessionOpened(IoSession session) throws Exception {
        //InetSocketAddress isa = (InetSocketAddress) session.getRemoteAddress();
        //logger.info("客户端(sessionOpened):" + isa.getAddress().getHostAddress() + ":" + isa.getPort());
    }

    @Override
    public void sessionClosed(IoSession session) throws Exception {
        //InetSocketAddress isa = (InetSocketAddress) session.getRemoteAddress();
        //logger.info("sessionClosed:" + isa.getAddress().getHostAddress() + ":" + isa.getPort());
        sessions.remove(session.getRemoteAddress().toString());
    }

    @Override
    public void exceptionCaught(IoSession session, Throwable cause) {
        logger.error("客户端(exceptionCaught):" + session.getRemoteAddress() + " 出现错误: " + cause.toString());
    }

    @Override
    public void messageReceived(IoSession session, Object message) throws Exception {
        String msg = message.toString();
        if (msg.equals("")) {
            return;
        }
        //logger.info("-- messageReceived -- : " + msg);

        if (msg.indexOf("<policy-file-request/>") != -1) {
            String xml = "<cross-domain-policy> "
                    + "<allow-access-from domain=\"*\" to-ports=\"1025-9999\" />"
                    + "</cross-domain-policy> ";
            //logger.info("policy sent~~");
            session.write(xml);
            return;
        }

        // 记录session.
        if (msg.indexOf("###USERID###:") != -1) {
            Map<String, IoSession> map = new HashMap<String, IoSession>();
            int offset = msg.indexOf("###USERID###:") + "###USERID###:".length();
            String id = msg.substring(offset);
            map.put(id, session);
            sessions.put(session.getRemoteAddress().toString(), map);
            return;
        }

        String[] result = msg.split(Constant.HYPHEN, 2);
        /**
         * 消息:
         *      msg     group      broadcast
         * 状态:
         *      state
         * 请求:
         *      req
         * 执行:
         *      exec
         * 传输:
         *      transfer
         * 离线:
         *      offline
         */
        String command = result[0];

        if ("msg".equals(command)) {
            msg(command, msg, session);
        } else if ("group".equals(command)) {
            msg(command, msg, session);
        } else if ("broadcast".equals(command)) {
            msg(command, msg, session);
        } else if ("state".equals(command)) { // 状态改变
            state(msg);
        } else if ("transfer".equals(command)) {
            transfer(command, msg, session);
        }

    }

    /**
     * 改变 用户状态 通知每一个用户
     *
     * @param msg uid#*#state
     */
    private void state(String msg) {
        for (Map.Entry<String, Map<String, IoSession>> outEntry : sessions.entrySet()) {
            Map<String, IoSession> map = outEntry.getValue();
            for (Map.Entry<String, IoSession> innerEntry : map.entrySet()) {
                IoSession sess = innerEntry.getValue();
                sess.write(msg);
            }
        }
    }

    /**
     * 传输文件
     *
     * @param command 命令 'transfer'
     * @param msg     形如:
     *                <p/>
     *                transfer###<from>1###张三疯###online<from><to>2###李四###online<to><msg>/im/upload/20110805/female.png<msg>
     * @param session session
     */
    private void transfer(String command, String msg, IoSession session) {
        String from = find("<from>", msg);
        String to = find("<to>", msg);
        String path = find("<msg>", msg);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String date = sdf.format(new Date());

        boolean hasOffline = false;

        String[] tos = to.split(",");
        for (int i = 0; i < tos.length; i++) {
            String _to = tos[i];
            String[] infos = _to.split(Constant.HYPHEN);
            String uid = infos[0];

            StringBuilder sb = new StringBuilder(command);
            sb.append(Constant.HYPHEN);
            sb.append("{from:'");
            sb.append(from);
            sb.append("',");

            sb.append("to:'");
            sb.append(to);
            sb.append("',");

            sb.append("date:'");
            sb.append(date);
            sb.append("',");

            sb.append("msg:'");
            sb.append(path);
            sb.append("'}");

            for (Map.Entry<String, Map<String, IoSession>> outEntry : sessions.entrySet()) {
                Map<String, IoSession> map = outEntry.getValue();
                if (map.containsKey(uid)) { // 用户在线
                    IoSession sess = map.get(uid);
                    if (sess != session) { // 不发给发送文件的'自己'
                        sess.write(sb.toString());
                    }
                } else { // 用户不在线
                    hasOffline = true;
                }
            }
        }

        if (hasOffline) { // 离线消息
            StringBuilder back = new StringBuilder("offline");
            back.append(Constant.HYPHEN);
            back.append("{from:'");
            back.append(from);
            back.append("',to:'");
            back.append(to);
            back.append("',date:'");
            back.append(date);
            back.append("',file:'");
            back.append(path);
            back.append("'}");
            session.write(back.toString());
        }
    }

    /**
     * 发送消息 给对话人
     *
     * @param command {String}  命令
     * @param msg     {String}  消息
     * @param session session
     */
    private void msg(String command, String msg, IoSession session) {
        //对客户端做出的响应
        String from = find("<from>", msg);
        String to = find("<to>", msg);
        String words = find("<msg>", msg);
        String files = find("<file>", msg);    // 没用了~~ 2011.08.05
        String style = find("<style>", msg);

        String my_id = from.split(Constant.HYPHEN)[0];

        String[] uidArr = null;

        if (!to.equals("*")) {  // 不是全体(广播)
            String[] tos = to.split(",");
            uidArr = new String[tos.length];
            for (int i = 0; i < tos.length; i++) {
                String _tos = tos[i];
                String[] infos = _tos.split(Constant.HYPHEN);
                uidArr[i] = infos[0];
            }
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String date = sdf.format(new Date());

        StringBuilder sb = new StringBuilder(command);
        sb.append(Constant.HYPHEN);
        sb.append("{from:'");
        sb.append(from);
        sb.append("',");

        sb.append("to:'");
        sb.append(to);
        sb.append("',");

        sb.append("date:'");
        sb.append(date);
        sb.append("',");

        sb.append("msg:'");
        sb.append(words);
        sb.append("',");

        sb.append("file:'");
        sb.append(files);
        sb.append("',");

        sb.append("stylz:'");
        sb.append(style);

        sb.append("'}");

        List<String> onlineList = new ArrayList<String>();  // 记录在线用户id
        for (Map.Entry<String, Map<String, IoSession>> outEntry : sessions.entrySet()) {
            //String outKey = outEntry.getKey();
            Map<String, IoSession> map = outEntry.getValue();

            for (Map.Entry<String, IoSession> innerEntry : map.entrySet()) {
                String uid = innerEntry.getKey();
                IoSession sess = innerEntry.getValue();
                if (to.equals("*")) {
                    sess.write(sb.toString());  // 广播
                } else {
                    // 此人是接收者
                    if (Arrays.binarySearch(uidArr, uid) >= 0) {
                        sess.write(sb.toString());
                        onlineList.add(uid);
                    } else if (my_id.equals(uid)) {  // 是本人
                        sess.write(sb.toString());
                        sess.resumeWrite();
                    }
                }
            }
        }

        // 离线消息存储 发回前台 用ajax调用servlet执行~~
        if (uidArr != null) {
            List<String> offlineList = new ArrayList<String>();
            List uidList = Arrays.asList(uidArr);
            for (Object o : uidList) {
                String u = o.toString();
                if (!onlineList.contains(u)) {
                    offlineList.add(u);
                }
            }
            if (offlineList.size() > 0) {
                StringBuilder back = new StringBuilder("offline");
                back.append(Constant.HYPHEN);
                back.append("{from:'");
                back.append(from);
                back.append("',to:'");
                back.append(to);
                back.append("',date:'");
                back.append(date);
                back.append("',msg:'");
                back.append(words);
                back.append("',stylz:'");
                back.append(style);
                back.append("',user:");
                back.append(offlineList.toString()); // 真实数据时可能会为字符串 到时要留意此处~~ todo
                back.append("}");
                session.write(back.toString());
            }
        }

    }

    @Override
    public void messageSent(IoSession session, Object message) throws Exception {
        //logger.info("客户端(messageSent):" + session.getRemoteAddress());
    }

    private String find(String lab, String str) {
        Pattern p = Pattern.compile(lab + "(.+?)" + lab);
        Matcher m = p.matcher(str);
        while (m.find()) {
            return m.group(1);
        }
        return "";
    }

}
