package com.Backend.test;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

public class DotenvTestInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
        String redisUrl = System.getProperty("REDIS_URL");
        if (redisUrl != null && redisUrl.startsWith("rediss://")) {
            if (System.getProperty("REDIS_SSL_ENABLED") == null) {
                System.setProperty("REDIS_SSL_ENABLED", "true");
            }
        }
    }
}
