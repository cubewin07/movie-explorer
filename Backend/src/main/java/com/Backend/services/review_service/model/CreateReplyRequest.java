package com.Backend.services.review_service.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateReplyRequest {
    private String content;
    private long replyToId;
}
