package com.Backend.services.friend_service.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class FriendIdEb implements Serializable{
    private Long user1Id;
    private Long user2Id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FriendIdEb that = (FriendIdEb) o;
        return user1Id.equals(that.user1Id) && user2Id.equals(that.user2Id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user1Id, user2Id);
    }
}
