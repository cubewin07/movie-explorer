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
        Object obj;

        try (Input input = new Input(new ByteArrayInputStream(bytes))) {
            obj = kryo.readClassAndObject(input);
        }
        catch (com.esotericsoftware.kryo.KryoException e) {
            throw new SerializationException(
                    "Kryo failed while reading object (possibly incompatible class or corrupted bytes)",
                    e
            );
        }
        catch (Exception e) {
            throw new SerializationException(
                    "Unexpected error during Kryo deserialization",
                    e
            );
        }

        try {
            return (T) obj;
        }
        catch (ClassCastException e) {
            throw new SerializationException(
                    "Type mismatch during deserialization. " +
                            "Expected type: " + type.getName() +
                            ", but actual type: " + obj.getClass().getName(),
                    e
            );
        }
    }
}

