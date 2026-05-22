package com.gluconoche.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuthCredentialRepository extends JpaRepository<AuthCredential, UUID> {
}
