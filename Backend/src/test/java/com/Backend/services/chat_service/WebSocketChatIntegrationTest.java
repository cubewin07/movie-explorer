package com.Backend.services.chat_service;

import com.Backend.services.chat_service.message.dto.MessageWebSocketDTO;
import com.Backend.services.notification_service.model.Notification;
import com.Backend.services.notification_service.repository.NotificationRepo;
import com.Backend.services.user_service.model.DTO.AuthenticateDTO;
import com.Backend.services.user_service.model.DTO.RegisterDTO;
import com.Backend.services.user_service.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.http.*;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;


import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@EnableCaching
class WebSocketChatIntegrationTest {

    private static final Logger log = LoggerFactory.getLogger(WebSocketChatIntegrationTest.class);

    @LocalServerPort
    private int port;
    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String baseUrl(String path) {
        return "http://localhost:" + port + path;
    }

    private String register(String username, String email, String password) throws Exception {
        RegisterDTO dto = new RegisterDTO(username, email, password);
        ResponseEntity<String> response = restTemplate.postForEntity(baseUrl("/user/register"), dto, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> map = objectMapper.readValue(Objects.requireNonNull(response.getBody()), Map.class);
        return (String) map.get("token");
    }

    private String authenticate(String email, String password) throws Exception {
        AuthenticateDTO dto = new AuthenticateDTO(email, password);
        ResponseEntity<String> response = restTemplate.postForEntity(baseUrl("/user/authenticate"), dto, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> map = objectMapper.readValue(Objects.requireNonNull(response.getBody()), Map.class);
        return (String) map.get("token");
    }

    private HttpHeaders bearerHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private long getUserId(String token) throws Exception {
        HttpEntity<Void> entity = new HttpEntity<>(bearerHeaders(token));
        ResponseEntity<String> response = restTemplate.exchange(baseUrl("/user/me"), HttpMethod.GET, entity, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> map = objectMapper.readValue(Objects.requireNonNull(response.getBody()), Map.class);
        Number id = (Number) map.get("id");
        return id.longValue();
    }

    private long createPrivateChat(String token, long user1Id, long user2Id) throws Exception {
        Map<String, Long> payload = Map.of(
                "user1Id", user1Id,
                "user2Id", user2Id
        );
        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(payload), bearerHeaders(token));
        ResponseEntity<String> response = restTemplate.exchange(baseUrl("/chats/private"), HttpMethod.POST, entity, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        return Long.parseLong(Objects.requireNonNull(response.getBody()));
    }

    private WebSocketStompClient buildStompClient() {
        WebSocketStompClient client = new WebSocketStompClient(new StandardWebSocketClient());
        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        messageConverter.setObjectMapper(objectMapper);
        client.setMessageConverter(messageConverter);
        client.setTaskScheduler(new ConcurrentTaskScheduler(Executors.newSingleThreadScheduledExecutor()));
        return client;
    }

    private StompSession connectStomp(WebSocketStompClient client, String token, long userId) throws Exception {
        String url = String.format("ws://localhost:%d/ws?userId=%d", port, userId);
        StompHeaders headers = new StompHeaders();
        headers.add("Authorization", "Bearer " + token);
        StompSession session = client.connectAsync(url, new WebSocketHttpHeaders(), headers, new StompSessionHandlerAdapter() {})
                .get(5, TimeUnit.SECONDS);
        log.debug("STOMP connection opened for user {} with session {}", userId, session.getSessionId());
        return session;
    }

    private Notification awaitNotification(long userId, String expectedContent) throws InterruptedException {
        var user = userRepository.findById(userId).orElseThrow();
        for (int attempt = 0; attempt < 20; attempt++) {
            List<Notification> notifications = notificationRepo.findByUserAndType(user, "chat");
            Optional<Notification> match = notifications.stream()
                    .filter(n -> n.getMessage() != null && n.getMessage().contains(expectedContent))
                    .findFirst();
            if (match.isPresent()) {
                Notification notification = match.get();
                log.debug("Notification retrieved for user {}: id={}, message={} ", userId, notification.getId(), notification.getMessage());
                return notification;
            }
            Thread.sleep(200);
        }
        log.error("Notification not retrieved for user {} within timeout for expected content '{}'", userId, expectedContent);
        return null;
    }

    @Test
    @DisplayName("WebSocket chat broadcasts message and stores notification")
    void websocket_chat_flow_persists_notification() throws Exception {
        String aliceToken = register("wsAlice", "wsAlice@example.com", "password123");
        String bobToken = register("wsBob", "wsBob@example.com", "password123");

        bobToken = authenticate("wsBob@example.com", "password123");

        long aliceId = getUserId(aliceToken);
        long bobId = getUserId(bobToken);

        long chatId = createPrivateChat(aliceToken, aliceId, bobId);

        WebSocketStompClient stompClient = buildStompClient();

        CompletableFuture<MessageWebSocketDTO> payloadFuture = new CompletableFuture<>();

        StompSession bobSession = connectStomp(stompClient, bobToken, bobId);
        String destination = "/topic/chat/" + chatId;
        log.info("Creating subscription for user {} on destination {}", bobId, destination);
        bobSession.subscribe(destination, new StompFrameHandler() {
            @Override
            public @NonNull Type getPayloadType(@NonNull StompHeaders headers) {
                return MessageWebSocketDTO.class;
            }

            @Override
            public void handleFrame(@NonNull StompHeaders headers, @Nullable Object payload) {
                log.debug("Received raw payload in handleFrame: {}", payload);
                if (payload == null) {
                    log.error("Received null payload in handleFrame (headers: {})", headers);
                    payloadFuture.completeExceptionally(new IllegalArgumentException("Received null payload"));
                    return;
                }
                if (!(payload instanceof MessageWebSocketDTO)) {
                    log.error("Payload is not an instance of MessageWebSocketDTO. Type: {}, Headers: {}", payload.getClass(), headers);
                    payloadFuture.completeExceptionally(new IllegalArgumentException("Payload is not a MessageWebSocketDTO instance"));
                    return;
                }
                MessageWebSocketDTO msg = (MessageWebSocketDTO) payload;
                log.debug("Deserialized MessageWebSocketDTO payload: {}", msg);
                payloadFuture.complete(msg);
            }
        });

        StompSession aliceSession = connectStomp(stompClient, aliceToken, aliceId);
        Thread.sleep(250);

        String messageContent = "Hello via STOMP!";
        String sendDestination = "/app/chat/" + chatId + "/send";
        log.info("Sending message from Alice (userId={}) to destination {}: {}", aliceId, sendDestination, messageContent);
        aliceSession.send(sendDestination, messageContent);

        MessageWebSocketDTO payload = payloadFuture.get(5, TimeUnit.SECONDS);
        assertThat(payload.getContent()).isEqualTo(messageContent);

        Notification notification = awaitNotification(bobId, messageContent);
        assertThat(notification).isNotNull();
        assertThat(notification.getType()).isEqualTo("chat");
        assertThat(notification.getRelatedId()).isEqualTo(chatId);

        aliceSession.disconnect();
        bobSession.disconnect();
        stompClient.stop();
    }
}
