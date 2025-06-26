package com.parkease.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parkease.beans.RefreshToken;
import com.parkease.beans.User;



public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
	Optional<RefreshToken> findByUser(User user);
}
