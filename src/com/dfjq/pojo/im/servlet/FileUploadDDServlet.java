package com.dfjq.pojo.im.servlet;

import com.dfjq.pojo.im.Constant;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;

public class FileUploadDDServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html; charset=utf-8");
        request.setCharacterEncoding("utf-8");
        PrintWriter out = response.getWriter();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String date = sdf.format(new Date());

        // 如果在应用根目录下没有用于存储上传文件的目录,则创建该目录
        // 目录结构: /im/upload/yyyymmdd/
        String path = getServletContext().getRealPath(Constant.UPLOAD_BASE_PATH + "/" + date);
        File uploadDir = new File(path);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fileName = request.getParameter("fn");
        String callBack = request.getParameter("cb");
        String win = request.getParameter("w");

        BufferedInputStream fileIn = new BufferedInputStream(request.getInputStream());

        byte[] buf = new byte[1024];
        File file = new File(uploadDir.getAbsolutePath() + "/" + fileName);
        BufferedOutputStream fileOut = new BufferedOutputStream(new
                FileOutputStream(file));
        int bytesIn;
        while ((bytesIn = fileIn.read(buf, 0, 1024)) != -1) {
            fileOut.write(buf, 0, bytesIn);
        }
        String serverPath = request.getContextPath() + Constant.UPLOAD_BASE_PATH + "/" + date + "/" + fileName;
        fileOut.flush();
        fileOut.close();

        StringBuilder sb = new StringBuilder("{fn:");
        sb.append(callBack);
        sb.append(",param:['");
        sb.append(win);
        sb.append("','");
        sb.append(serverPath);
        sb.append("']}");

        out.print(sb.toString());
        out.flush();
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
}
