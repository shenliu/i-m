package com.dfjq.pojo.im.server;

import org.apache.mina.filter.codec.textline.LineDelimiter;
import org.apache.mina.filter.codec.textline.TextLineCodecFactory;

import java.nio.charset.Charset;

public class ImCodecFactory extends TextLineCodecFactory {
    public ImCodecFactory() {
        super(Charset.forName("UTF-8"), LineDelimiter.NUL, LineDelimiter.NUL);
    }
}
