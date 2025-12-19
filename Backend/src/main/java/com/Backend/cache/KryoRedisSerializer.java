package com.Backend.cache;

import com.esotericsoftware.kryo.Kryo;
import com.esotericsoftware.kryo.io.Input;
import com.esotericsoftware.kryo.io.Output;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.SerializationException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class KryoRedisSerializer<T> implements RedisSerializer<T> {

    private final Class<T> type;
    private final ThreadLocal<Kryo> kryoThreadLocal = ThreadLocal.withInitial(() -> {
        Kryo kryo = new Kryo();
        kryo.setReferences(true);
        kryo.setRegistrationRequired(false);
        return kryo;
    });

    public KryoRedisSerializer(Class<T> type) {
        this.type = type;
    }

    @Override
    public byte[] serialize(T value) {
        if (value == null) return new byte[0];
        Kryo kryo = kryoThreadLocal.get();
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             Output output = new Output(bos)) {
            kryo.writeClassAndObject(output, value);
            output.close();
            return bos.toByteArray();
        } catch (IOException e) {
            throw new SerializationException("Kryo serialization failed", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public T deserialize(byte[] bytes) {
        if (bytes == null || bytes.length == 0) return null;

        Kryo kryo = kryoThreadLocal.get();

        try (Input input = new Input(new ByteArrayInputStream(bytes))) {
            Object obj = kryo.readClassAndObject(input);

            if (obj == null) return null;

            return (T) obj;

        } catch (Exception e) {
            throw new SerializationException(buildKryoErrorMessage(bytes, e), e);
        }
    }
    private String buildKryoErrorMessage(byte[] bytes, Exception e) {
        StringBuilder sb = new StringBuilder();

        sb.append("Kryo deserialization failed.\n");

        sb.append("Exception type: ")
                .append(e.getClass().getName())
                .append("\n");

        sb.append("Message: ")
                .append(e.getMessage())
                .append("\n");

        if (e.getCause() != null) {
            sb.append("Cause: ")
                    .append(e.getCause().getClass().getName())
                    .append(" - ")
                    .append(e.getCause().getMessage())
                    .append("\n");
        }

        sb.append("Payload size: ")
                .append(bytes.length)
                .append(" bytes\n");

        sb.append("First 32 bytes (hex): ")
                .append(toHex(bytes, 32));

        return sb.toString();
    }
    private String toHex(byte[] bytes, int limit) {
        StringBuilder hex = new StringBuilder();
        for (int i = 0; i < Math.min(bytes.length, limit); i++) {
            hex.append(String.format("%02x ", bytes[i]));
        }
        return hex.toString().trim();
    }
}

