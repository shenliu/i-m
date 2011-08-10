package com.dfjq.pojo.im.servlet;

import com.dfjq.pojo.im.Operation;
import com.dfjq.pojo.im.bean.OfflineMessage;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

public class OfflineMessageAddServlet extends HttpServlet {
    Operation op = null;

    @Override
    public void init() throws ServletException {
        super.init();
        ServletContext context = getServletContext();
        ApplicationContext ctx = WebApplicationContextUtils.getRequiredWebApplicationContext(context);
        op = (Operation) ctx.getBean("im_operation");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html; charset=utf-8");
        request.setCharacterEncoding("utf-8");
        PrintWriter out = response.getWriter();

        String from_id = request.getParameter("from_id");
        String from_name = request.getParameter("from_name");
        String gid = request.getParameter("gid");
        String gName = request.getParameter("gname");
        String to = request.getParameter("to");
        String date = request.getParameter("date");
        String time = request.getParameter("time");
        String msg = request.getParameter("msg");
        String style = request.getParameter("stylz");
        String file_name = request.getParameter("file_name");
        String file_type = request.getParameter("file_type");
        String file_path = request.getParameter("file_path");

        List<OfflineMessage> oms = new ArrayList<OfflineMessage>();
        String[] tos = to.split(",");
        for (int i = 0; i < tos.length; i++) {
            OfflineMessage om = new OfflineMessage();
            om.setFromId(from_id);
            om.setFromName(from_name);
            om.setGroupId(gid);
            om.setGroupName(gName);
            om.setToId(tos[i]);
            om.setToName("");
            om.setDate(date);
            om.setTime(time);
            om.setMessage(msg);
            om.setStyle(style);
            om.setFileName(file_name);
            om.setFileType(file_type);
            om.setFilePath(file_path);
            oms.add(om);
        }
        boolean flag = op.addOfflineMessages(oms);
        out.println(flag);
        out.flush();
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
}
