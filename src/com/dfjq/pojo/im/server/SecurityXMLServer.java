package com.dfjq.pojo.im.server;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class SecurityXMLServer implements Runnable {
    private ServerSocket server;
    private BufferedReader reader;
    private BufferedWriter writer;
    private String xml;

    public SecurityXMLServer() {
        xml = "<cross-domain-policy> "
                + "<allow-access-from domain=\"*\" to-ports=\"1025-9999\" />"
                + "</cross-domain-policy> ";
        //启动843端口
        createServerSocket(843);
        new Thread(this).start();
    }

    //启动服务器
    private void createServerSocket(int port) {
        try {
            server = new ServerSocket(port);
            System.out.println("服务监听端口：" + port);
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    //启动服务器线程
    public void run() {
        while (true) {
            Socket client = null;
            try {
                //接收客户端的连接
                client = server.accept();

                InputStreamReader input = new InputStreamReader(client.getInputStream(), "UTF-8");
                reader = new BufferedReader(input);
                OutputStreamWriter output = new OutputStreamWriter(client.getOutputStream(), "UTF-8");
                writer = new BufferedWriter(output);

                //读取客户端发送的数据
                StringBuilder data = new StringBuilder();
                int c = 0;
                while ((c = reader.read()) != -1) {
                    if (c != '\0')
                        data.append((char) c);
                    else
                        break;
                }
                String info = data.toString();
                System.out.println("输入的请求: " + info);

                //接收到客户端的请求之后，将策略文件发送出去
                if (info.indexOf("<policy-file-request/>") >= 0) {
                    writer.write(xml + "\0");
                    writer.flush();
                    System.out.println("将安全策略文件发送至: " + client.getInetAddress());
                } else {
                    writer.write("请求无法识别\0");
                    writer.flush();
                    System.out.println("请求无法识别: " + client.getInetAddress());
                }
                client.close();
            } catch (Exception e) {
                e.printStackTrace();
                try {
                    //发现异常关闭连接
                    if (client != null) {
                        client.close();
                        client = null;
                    }
                } catch (IOException ex) {
                    ex.printStackTrace();
                } finally {
                    //调用垃圾收集方法
                    System.gc();
                }
            }
        }
    }

    //测试主函数
    public static void main(String[] args) {
        new SecurityXMLServer();
    }
}
