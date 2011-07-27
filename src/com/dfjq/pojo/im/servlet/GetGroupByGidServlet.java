package com.dfjq.pojo.im.servlet;

import com.dfjq.pojo.im.Operation;
import com.dfjq.pojo.im.bean.Group;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class GetGroupByGidServlet extends HttpServlet {
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
        Group group = op.getGroupByGid(gid);

        String oper = request.getParameter("oper");
        if (oper != null && oper.equals("quitgroup")) { // 有操作 且为 退出群组操作
            String uid = request.getParameter("uid");
            String members = group.getMember();
            String reg = "," + uid + ",";
            members = members.replaceFirst(reg, "");
            group.setMember(members);
            op.updateGroup(group);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("{gid:'");
        sb.append(group.getGid());
        sb.append("',gname:'");
        sb.append(group.getName());
        sb.append("',desc:'");
        sb.append(group.getDesc());
        sb.append("',date:'");
        sb.append(group.getDate());
        sb.append("',creator:'");
        sb.append(group.getCreator());
        sb.append("',member:'");
        sb.append(group.getMember());
        sb.append("'}");
        out.println(sb.toString());
        out.flush();
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
}
