package com.dfjq.pojo.im.servlet;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class FileDownloadServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getParameter("path");
        int offset = path.lastIndexOf("/") + 1;
        String fileName = path.substring(offset);
        doDownload(request, response, path, fileName);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    private void doDownload(HttpServletRequest req, HttpServletResponse resp,
                            String filename, String original_filename)
            throws IOException {
        String basePath = this.getServletContext().getRealPath("/");
        File f = new File(basePath + filename);
        int length, BUF_SIZE = 1024;
        ServletOutputStream op = resp.getOutputStream();
        ServletContext context = getServletConfig().getServletContext();
        String mimeType = context.getMimeType(basePath + filename);

        resp.setContentType((mimeType != null) ? mimeType : "application/x-msdownload;charset=utf-8");
        resp.setContentLength((int) f.length());
        original_filename = new String(original_filename.getBytes("utf-8"), "iso-8859-1");
        resp.setHeader("Content-Disposition", "attachment;filename=\"" + original_filename + "\"");

        byte[] buf = new byte[BUF_SIZE];
        DataInputStream in = new DataInputStream(new FileInputStream(f));

        while (((length = in.read(buf)) != -1)) {
            op.write(buf, 0, length);
        }

        in.close();
        op.flush();
        op.close();
    }
}
