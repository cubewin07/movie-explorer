package com.Backend.services.friend_service.model;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class FriendIdEb implements Serializable{
    private Long user1;
    private Long user2;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FriendIdEb that = (FriendIdEb) o;
        return user1.equals(that.user1) && user2.equals(that.user2);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user1, user2);
    }
}
