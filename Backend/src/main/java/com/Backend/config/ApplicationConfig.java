package com.Backend.config;

import com.Backend.services.user_service.repository.UserRepository;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
public class ApplicationConfig {
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return email -> userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean(name = "watchlistSyncExecutor")
    public Executor watchlistSyncExecutor(
            @Value("${watchlist.sync.executor.core-pool-size:2}") int corePoolSize,
            @Value("${watchlist.sync.executor.max-pool-size:6}") int maxPoolSize,
            @Value("${watchlist.sync.executor.queue-capacity:200}") int queueCapacity
    ) {
        return buildExecutor(corePoolSize, maxPoolSize, queueCapacity, "watchlist-sync-");
    }

    @Bean(name = "taskExecutor")
    public Executor taskExecutor(
            @Value("${app.async.executor.core-pool-size:1}") int corePoolSize,
            @Value("${app.async.executor.max-pool-size:2}") int maxPoolSize,
            @Value("${app.async.executor.queue-capacity:50}") int queueCapacity,
            @Value("${app.async.executor.thread-name-prefix:app-async-}") String threadNamePrefix
    ) {
        return buildExecutor(corePoolSize, maxPoolSize, queueCapacity, threadNamePrefix);
    }

    @Bean(name = "recommendationFollowupExecutor")
    public Executor recommendationFollowupExecutor(
            @Value("${app.recommendation.followup-executor.core-pool-size:1}") int corePoolSize,
            @Value("${app.recommendation.followup-executor.max-pool-size:2}") int maxPoolSize,
            @Value("${app.recommendation.followup-executor.queue-capacity:30}") int queueCapacity,
            @Value("${app.recommendation.followup-executor.thread-name-prefix:recommendation-followup-}") String threadNamePrefix
    ) {
        return buildExecutor(corePoolSize, maxPoolSize, queueCapacity, threadNamePrefix);
    }

    @Bean(name = "taskScheduler")
    public ThreadPoolTaskScheduler taskScheduler(
            @Value("${app.scheduling.pool-size:2}") int poolSize,
            @Value("${app.scheduling.thread-name-prefix:app-scheduler-}") String threadNamePrefix
    ) {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(Math.max(1, poolSize));
        scheduler.setThreadNamePrefix(threadNamePrefix);
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(20);
        scheduler.initialize();
        return scheduler;
    }

    private Executor buildExecutor(int corePoolSize, int maxPoolSize, int queueCapacity, String threadNamePrefix) {
        int safeCorePoolSize = Math.max(1, corePoolSize);
        int safeMaxPoolSize = Math.max(safeCorePoolSize, maxPoolSize);

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(safeCorePoolSize);
        executor.setMaxPoolSize(safeMaxPoolSize);
        executor.setQueueCapacity(Math.max(0, queueCapacity));
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(20);
        executor.initialize();
        return executor;
    }
}
