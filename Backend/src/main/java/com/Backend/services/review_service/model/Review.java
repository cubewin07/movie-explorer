package com.Backend.services.review_service.model;

import com.Backend.services.user_service.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    private Long id;

    private String content;

    private long filmId;

    @ManyToOne
    @JoinColumn(name = "answer_to_id")
    private Review answerTo;

    @OneToMany(mappedBy = "answerTo", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> replies = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;


}
