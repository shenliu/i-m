package com.dfjq.pojo.im.servlet;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

public class FileUploadServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory
            .getLogger(FileUploadServlet.class);

    @SuppressWarnings("unchecked")
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html; charset=utf-8");
        request.setCharacterEncoding("utf-8");
        PrintWriter out = response.getWriter();

        long max_file_size = 10 * 1024 * 1024; // 10MB

        String upload_path = "/im/upload";

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String date = sdf.format(new Date());

        // 如果在应用根目录下没有用于存储上传文件的目录,则创建该目录
        // 目录结构: /im/upload/yyyymmdd/
        String path = getServletContext().getRealPath(upload_path + "/" + date);
        File uploadDir = new File(path);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        DiskFileItemFactory factory = new DiskFileItemFactory();
        // 小于指定尺寸（默认10KB）的文件直接保存在内存中，否则保存在磁盘临时文件夹
        factory.setSizeThreshold(DiskFileItemFactory.DEFAULT_SIZE_THRESHOLD);
        // 设置处理上传文件时保存临时文件的临时文件夹，没有指定则采用系统默认临时文件夹
        File tempDir = new File(getServletContext().getRealPath(upload_path + "/temp"));
        if (!tempDir.exists()) {
            tempDir.mkdirs();
        }
        factory.setRepository(tempDir);

        ServletFileUpload uploader = new ServletFileUpload(factory);

        // 设置单个上传文件的最大尺寸限制，参数为以字节为单位的long型数字
        uploader.setFileSizeMax(max_file_size);

        // 上传总尺寸
        uploader.setSizeMax(max_file_size);

        // 设置字符编码
        uploader.setHeaderEncoding("UTF-8");

        // 解析请求
        List<FileItem> list;
        try {
            list = uploader.parseRequest(request);
        } catch (FileUploadException e) {
            logger.error(e.getMessage());
            return;
        }

        String callBack = null;
        String win = null;
        String serverPath = null;
        // 循环处理每一个文件项
        for (FileItem item : list) {
            if (item.isFormField()) { // 普通表单域
                if (item.getFieldName().equals("callback")) {
                    callBack = item.getString("UTF-8");
                }
                if (item.getFieldName().equals("win")) {
                    win = item.getString("UTF-8");
                }
            } else {
                // 将临时文件保存到指定目录
                String fileName = item.getName();
                fileName = FilenameUtils.getName(fileName);
                String filePath = uploadDir.getAbsolutePath() + "/" + fileName;
                try {
                    item.write(new File(filePath));
                } catch (Exception e) {
                    logger.error(e.getMessage());
                    return;
                }
                serverPath = request.getContextPath() + upload_path + "/" + date + "/" + fileName;
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("<script type=\"text/javascript\">");
        sb.append("parent.");
        sb.append(callBack);
        sb.append(".apply(null, ['" + win + "','" + serverPath + "']);");
        sb.append("</script>");

        out.print(sb.toString());
        out.flush();
        out.close();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
}
