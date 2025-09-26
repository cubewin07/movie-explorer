package com.Backend.services.friend_service.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class FriendIdEb implements Serializable {

    @EqualsAndHashCode.Include
    private Long user1Id;

    @EqualsAndHashCode.Include
    private Long user2Id;
}
