package com.dfjq.pojo.im.server;

import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IoSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetSocketAddress;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ServerHandler extends IoHandlerAdapter {
    /**
     * String: session.getRemoteAddress()
     * Map<String, IoSession>:
     *      String: uid
     *      IoSession: ioisession
     */
    private ConcurrentMap<String, Map<String, IoSession>> sessions = new ConcurrentHashMap<String, Map<String, IoSession>>();

    private final String HYPHEN = "#\\*#";

    private static final Logger logger = LoggerFactory
            .getLogger(ServerHandler.class);

    @Override
    public void sessionCreated(IoSession session) throws Exception {
        InetSocketAddress isa = (InetSocketAddress) session.getRemoteAddress();
        //logger.info("客户端(sessionCreated):" + isa.getAddress().getHostAddress() + ":" + isa.getPort());
    }

    @Override
    public void sessionOpened(IoSession session) throws Exception {
        InetSocketAddress isa = (InetSocketAddress) session.getRemoteAddress();
        //logger.info("客户端(sessionOpened):" + isa.getAddress().getHostAddress() + ":" + isa.getPort());
    }

    @Override
    public void sessionClosed(IoSession session) throws Exception {
        InetSocketAddress isa = (InetSocketAddress) session.getRemoteAddress();
        logger.info("sessionClosed:" + isa.getAddress().getHostAddress() + ":" + isa.getPort());
        sessions.remove(session.getRemoteAddress().toString());
    }

    @Override
    public void exceptionCaught(IoSession session, Throwable cause) {
        try {
            logger.info("客户端(exceptionCaught):" + session.getRemoteAddress() + " 出现错误: " + cause.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void messageReceived(IoSession session, Object message)
            throws Exception {
        String msg = message.toString();
        if (msg.equals("")) {
            return;
        }
        //logger.info("-- messageReceived -- : " + msg);

        if (msg.indexOf("<policy-file-request/>") != -1) {
            String xml = "<cross-domain-policy> "
                    + "<allow-access-from domain=\"*\" to-ports=\"1025-9999\" />"
                    + "</cross-domain-policy> ";
            logger.info("policy sent~~");
            session.write(xml + "\0");
            return;
        }

        // 记录session.
        if (msg.indexOf("#*#USERID#*#:") != -1) {
            Map<String, IoSession> map = new HashMap<String, IoSession>();
            int offset = msg.indexOf("#*#USERID#*#:") + "#*#USERID#*#:".length();
            map.put(msg.substring(offset), session);
            sessions.put(session.getRemoteAddress().toString(), map);
            logger.info("userid added~~: " + msg.substring(offset));
            return;
        }

        String[] result = msg.split(HYPHEN, 2);
        String command = result[0];

        if ("msg".equals(command)) {
            msg(command, msg);
        } else if ("group".equals(command)) {
            msg(command, msg);
        } else if ("broadcast".equals(command)) {
            msg(command, msg);
        } else { // 状态改变

        }

    }

    private void msg(String command, String msg) {
        //对客户端做出的响应
        String from = find("<from>", msg);
        String to = find("<to>", msg);
        String words = find("<msg>", msg);
        String files = find("<file>", msg);
        String style = find("<style>", msg);

        String my_id = from.split(HYPHEN)[0];

        String[] uids = null;
        String[] usernames = null;
        String[] statuz = null;

        if (!to.equals("*")) {  // 不是全体(广播)
            String[] tos = to.split(",");
            uids = new String[tos.length];
            usernames = new String[tos.length];
            statuz = new String[tos.length];
            for (int i = 0; i < tos.length; i++) {
                String _tos = tos[i];
                String[] infos = _tos.split(HYPHEN);
                uids[i] = infos[0];
                usernames[i] = infos[1];
                statuz[i] = infos[2];
            }
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String date = sdf.format(new Date());

        StringBuilder sb = new StringBuilder(command);
        sb.append(HYPHEN);
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

        for (Map.Entry<String, Map<String, IoSession>> outEntry : sessions.entrySet()) {
            String outKey = outEntry.getKey();
            Map<String, IoSession> map = outEntry.getValue();

            for (Map.Entry<String, IoSession> innerEntry : map.entrySet()) {
                String innerKey = innerEntry.getKey();
                IoSession sess = innerEntry.getValue();
                if (to.equals("*")) {
                    sess.write(sb.toString());  // 广播
                } else {
                    if (Arrays.binarySearch(uids, innerKey) >= 0 || my_id.equals(innerKey)) {
                        sess.write(sb.toString());
                    }
                }
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
