package com.dfjq.pojo.im.client;

import org.apache.mina.core.future.ConnectFuture;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.filter.codec.textline.TextLineCodecFactory;
import org.apache.mina.transport.socket.nio.NioSocketConnector;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;

public class Client {
    public void start() throws IOException {
        NioSocketConnector connector = new NioSocketConnector();
        // connector.getFilterChain().addLast( "logger", new LoggingFilter() );
        // 设置编码过滤器
        connector.getFilterChain().addLast("codec", new ProtocolCodecFilter(
                new TextLineCodecFactory(Charset.forName("UTF-8"))));
        connector.setConnectTimeoutMillis(10000);
        connector.setHandler(new ClientHandler());
        ConnectFuture cf = connector.connect(new InetSocketAddress("10.0.0.103", 2528));
        // 等待连接创建完成
        cf.awaitUninterruptibly();
        IoSession session = cf.getSession();

        System.out.println("客户端准备完毕");
        //以下是等待控制台的输入
        while (true) {
            BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
            String line = in.readLine();
            try {
                if (!"".equals(line)) {
                    session.write(line);
                } else if ("quit".equals(line)) {
                    break;
                }
            } catch (Exception e) {
                e.printStackTrace();
                System.out.println("服务端关闭了连接");
            }
        }
        session.getCloseFuture().awaitUninterruptibly();
        connector.dispose();
    }

    public static void main(String[] args) {
        try {
            new Client().start();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
