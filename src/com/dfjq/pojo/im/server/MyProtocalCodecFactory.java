package com.dfjq.pojo.im.server;

import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolCodecFactory;
import org.apache.mina.filter.codec.ProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolEncoder;

import java.nio.charset.Charset;

public class MyProtocalCodecFactory implements ProtocolCodecFactory {
    private final MyProtocalEncoder encoder;
    private final MyProtocalDecoder decoder;

    public MyProtocalCodecFactory() {
        encoder = new MyProtocalEncoder();
        decoder = new MyProtocalDecoder();
    }

    public ProtocolEncoder getEncoder(IoSession session) {
        return encoder;
    }

    public ProtocolDecoder getDecoder(IoSession session) {
        return decoder;
    }

}
