package org.example.multi_level_cache;

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
            return (T) kryo.readClassAndObject(input);
        } catch (Exception e) {
            throw new SerializationException("Kryo deserialization failed", e);
        }
    }
}

