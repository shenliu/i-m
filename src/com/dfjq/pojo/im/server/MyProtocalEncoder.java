package com.dfjq.pojo.im.server;

import flex.messaging.io.SerializationContext;
import flex.messaging.io.amf.Amf3Output;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.session.AttributeKey;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolEncoder;
import org.apache.mina.filter.codec.ProtocolEncoderOutput;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.zip.Deflater;

public class MyProtocalEncoder implements ProtocolEncoder {
    private static int cachesize = 1024;
    private final AttributeKey DEFLATER = new AttributeKey(getClass(), "deflater");
    private final SerializationContext context = new SerializationContext();
    private final Amf3Output amf3out;

    public MyProtocalEncoder() {
        amf3out = new Amf3Output(context);
    }

    public void dispose(IoSession session) throws Exception {
        amf3out.close();
    }

    public void encode(IoSession session, Object message,
                       ProtocolEncoderOutput out) throws Exception {
        IoBuffer buffer;
        if (message instanceof String) {
            byte[] bytes = ((String) message).getBytes("UTF-8");
            buffer = IoBuffer.allocate(bytes.length + 1);
            buffer.put(bytes);
            buffer.put((byte) 0x0);
            buffer.flip();
            out.write(buffer);
        } else {
            Map map = (Map) message;
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            amf3out.setOutputStream(stream);
            amf3out.writeObject(map);
            // amf3out.flush();
            byte bytes[] = compress(session, stream.toByteArray());
            int tempNum = 0;
            while (bytes.length == 0) {
                bytes = compress(session, stream.toByteArray());
                tempNum++;
                if (tempNum >= 20) {
                    return;
                }
            }
            buffer = IoBuffer.allocate(bytes.length + 4, false);
            buffer.putInt(bytes.length);
            buffer.put(bytes);
            buffer.flip();
            try {
                out.write(buffer);
            } catch (Exception e) {
                e.printStackTrace();
            }
            buffer.free();
        }
    }

    private byte[] compress(IoSession session, byte[] inputs) {
        Deflater deflater = (Deflater) session.getAttribute(DEFLATER);
        if (deflater == null) {
            deflater = new Deflater();
            session.setAttribute(DEFLATER, deflater);
        }
        deflater.reset();
        deflater.setInput(inputs);
        deflater.finish();
        byte outputs[] = new byte[0];
        ByteArrayOutputStream stream = new ByteArrayOutputStream(inputs.length);
        byte[] bytes = new byte[cachesize];
        int value = 0;
        while (!deflater.finished()) {
            value = deflater.deflate(bytes);
            stream.write(bytes, 0, value);
        }

        outputs = stream.toByteArray();
        try {
            stream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return outputs;
    }
}
