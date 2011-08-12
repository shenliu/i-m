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
import java.util.List;

public class OfflineMessageGetByUidServlet extends HttpServlet {
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
        StringBuilder sb = new StringBuilder("[");
        List<OfflineMessage> oms = op.getOfflineMessagesByUid(uid);
        for (OfflineMessage om : oms) {
            sb.append("{");

            sb.append("from_id:'");
            sb.append(om.getFromId());
            sb.append("',");

            sb.append("from_name:'");
            sb.append(om.getFromName());
            sb.append("',");

            sb.append("gid:'");
            sb.append(om.getGroupId());
            sb.append("',");

            sb.append("gName:'");
            sb.append(om.getGroupName());
            sb.append("',");

            sb.append("to_id:'");
            sb.append(om.getToId());
            sb.append("',");

            sb.append("to_name:'");
            sb.append(om.getToName());
            sb.append("',");

            sb.append("date:'");
            sb.append(om.getDate());
            sb.append("',");

            sb.append("time:'");
            sb.append(om.getTime());
            sb.append("',");

            sb.append("msg:'");
            sb.append(om.getMessage());
            sb.append("',");

            sb.append("stylz:'");
            sb.append(om.getStyle());
            sb.append("',");

            sb.append("file_name:'");
            sb.append(om.getFileName());
            sb.append("',");

            sb.append("file_type:'");
            sb.append(om.getFileType());
            sb.append("',");

            sb.append("file_path:'");
            sb.append(om.getFilePath());
            sb.append("'},");
        }
        sb = sb.deleteCharAt(sb.length() - 1);
        sb.append("]");
        out.println(sb.toString());
        out.flush();
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
}
