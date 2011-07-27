package com.dfjq.pojo.im.server;

import flex.messaging.io.SerializationContext;
import flex.messaging.io.amf.ASObject;
import flex.messaging.io.amf.Amf3Input;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.AttributeKey;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.CumulativeProtocolDecoder;
import org.apache.mina.filter.codec.ProtocolDecoderOutput;

import java.io.DataInputStream;
import java.io.EOFException;
import java.io.UnsupportedEncodingException;
import java.util.zip.InflaterInputStream;

public class MyProtocalDecoder extends CumulativeProtocolDecoder {
    private final AttributeKey POLICY = new AttributeKey(getClass(), "policy");
    private final String security = "<policy-file-request/>";
    private final SerializationContext context = new SerializationContext();
    private final Amf3Input amf3in;

    private int remainLen;

    public MyProtocalDecoder() {
        amf3in = new Amf3Input(context);
    }

    protected boolean doDecode(IoSession session, IoBuffer in,
                               ProtocolDecoderOutput out) throws Exception {
        if (isSecurityRequest(session, in)) {
            out.write(security);
            in.free();
            return false;
        } else {
            int len = 0;
            in.position(0);
            while (true) {
                int remaining = in.remaining();
                if (remainLen != 0) {
                    // 上次包是粘包
                    len = remainLen;
                    remainLen = 0;
                } else {
                    if (remaining >= 4) {
                        //读包头里的包长度
                        len = in.getInt();
                    } else {
                        return false;
                    }
                    if (len < remaining - 4) {
                        // 粘包，等下一次进来时一并解决
                        remainLen = len;
                        //in.free();
                        //oldPositon = 0;
                        return false;
                    }
                }
                if (len > remaining - 4) {
                    // 接收到的内容不够
                    // in.free();
                    return false;
                } else {
                    // 开始读取消息内容
                    Object message = null;
                    byte bytes[] = new byte[len];
                    in.get(bytes, 0, len);
                    IoBuffer tempIn = IoBuffer.wrap(bytes);
                    try {
                        amf3in.setInputStream(new InflaterInputStream(new DataInputStream(tempIn.asInputStream())));
                        if (amf3in.available() == 0) {
                            in.free();
                            tempIn = null;
                            bytes = null;
                            return false;
                        }
                        message = amf3in.readObject();
                        if (message != null && (message instanceof ASObject || message instanceof String)) {
                            out.write(message);
                        } else {
                            in.free();
                            tempIn = null;
                            bytes = null;
                            return false;
                        }
                    } catch (EOFException e) {
                        bytes = null;
                        return false;
                    } catch (Exception e1) {
                        return false;
                    }
                    // 读完len指定的长度后，看看当前还有没有内容
                    if (in.remaining() <= 0) {
                        bytes = null;
                        in.free();
                        tempIn = null;
                        return false;
                    }
                }
            }
        }
    }

    private boolean isSecurityRequest(IoSession session, IoBuffer in) {
        Boolean policy = (Boolean) session.getAttribute(POLICY);
        if (policy != null) {
            return false;
        }
        String request = getRequest(in);
        boolean result = false;
        if (request != null) {
            result = request.startsWith(security);
        }
        session.setAttribute(POLICY, new Boolean(result));
        return result;
    }

    private String getRequest(IoBuffer in) {
        byte[] bytes = new byte[in.limit()];
        in.get(bytes);
        String request;
        try {
            request = new String(bytes, "utf-8");
        } catch (UnsupportedEncodingException e) {
            request = null;
        }
        return request;
    }
}
