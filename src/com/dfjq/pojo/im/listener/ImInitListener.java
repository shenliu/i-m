package com.dfjq.pojo.im.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class ImInitListener implements ServletContextListener {
    private static final Logger logger = LoggerFactory
            .getLogger(ImInitListener.class);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        new ClassPathXmlApplicationContext("classpath*:com/dfjq/pojo/im/minaServer.xml");
        logger.debug("******** mina server 启动完毕 *********");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
    }
}
