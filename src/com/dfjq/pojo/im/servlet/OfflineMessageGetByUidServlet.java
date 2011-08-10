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
        List<OfflineMessage> oms = op.getOfflineMessagesByUid(uid);

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
}