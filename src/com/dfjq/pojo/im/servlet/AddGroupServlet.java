package com.dfjq.pojo.im.servlet;

import com.dfjq.pojo.im.Operation;
import com.dfjq.pojo.im.bean.Group;
import com.dfjq.pojo.im.util.RandomGUID;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;

public class AddGroupServlet extends HttpServlet {
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

        String gid = request.getParameter("gid");
        String uid = request.getParameter("uid");  // 创建者
        String gname = request.getParameter("gname");
        String a = new String(gname.getBytes("iso-8859-1"), "utf-8");
        String gdesc = request.getParameter("gdesc");

        boolean flag;

        if (gid != null) { // 修改
            Group group = op.getGroupByGid(gid);
            group.setName(gname);
            group.setDesc(gdesc);
            flag = op.updateGroup(group);
        } else {  // 新建
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
            String date = sdf.format(new Date());

            Group group = new Group();
            group.setName(gname);
            group.setDesc(gdesc);
            group.setGid(new RandomGUID(true).getValueAfterMD5());
            group.setCreator(uid);
            group.setDate(date);
            group.setMember(uid);

            flag = op.addGroup(group);
        }
        out.println(flag);
        out.flush();
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

}
