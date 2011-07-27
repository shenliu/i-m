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
import java.util.List;

public class GetGroupsByUidServlet extends HttpServlet {
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

        String uid = request.getParameter("uid");
        List groups = op.getGroupsByUid(uid);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < groups.size(); i++) {
            Group g = (Group) groups.get(i);
            sb.append("{gid:'");
            sb.append(g.getGid());
            sb.append("',gname:'");
            sb.append(g.getName());
            sb.append("',desc:'");
            sb.append(g.getDesc());
            sb.append("',date:'");
            sb.append(g.getDate());
            sb.append("',creator:'");
            sb.append(g.getCreator());
            sb.append("',member:'");
            sb.append(g.getMember());
            sb.append("'}");
            if (i != groups.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        out.println(sb.toString());
        out.flush();
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
}
