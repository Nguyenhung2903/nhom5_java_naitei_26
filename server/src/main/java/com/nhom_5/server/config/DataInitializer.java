package com.nhom_5.server.config;

import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.init-admin.enabled:true}")
    private boolean initAdminEnabled;

    @Value("${app.init-admin.username:admin}")
    private String adminUsername;

    @Value("${app.init-admin.password:Admin@123456}")
    private String adminPassword;

    @Value("${app.init-admin.email:admin@cinemanest.vn}")
    private String adminEmail;

    @Value("${app.init-admin.full-name:System Administrator}")
    private String adminFullName;

    @Override
    public void run(String... args) {
        if (!initAdminEnabled) {
            log.info("DataInitializer: Auto-initialization is disabled.");
            return;
        }

        initializeAdminUser();
        initializeTestUser();
    }

    private void initializeAdminUser() {
        if (!userRepository.existsByUsername(adminUsername) && !userRepository.existsByRole(Role.ADMIN)) {
            log.info("DataInitializer: Initializing default ADMIN account [{}]...", adminUsername);
            User admin = User.builder()
                    .username(adminUsername.trim().toLowerCase())
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail.trim().toLowerCase())
                    .fullName(adminFullName)
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .phone("0900000001")
                    .build();

            userRepository.save(admin);
            log.info("DataInitializer: Default ADMIN account created successfully! (Username: {}, Password: {})", adminUsername, adminPassword);
        } else {
            log.info("DataInitializer: ADMIN account already exists, skipping initialization.");
        }
    }

    private void initializeTestUser() {
        String testUsername = "user";
        if (!userRepository.existsByUsername(testUsername)) {
            log.info("DataInitializer: Initializing default test USER account [{}]...", testUsername);
            User testUser = User.builder()
                    .username(testUsername)
                    .password(passwordEncoder.encode("User@123456"))
                    .email("user@cinemanest.vn")
                    .fullName("Standard Test User")
                    .role(Role.USER)
                    .status(UserStatus.ACTIVE)
                    .phone("0900000002")
                    .build();

            userRepository.save(testUser);
            log.info("DataInitializer: Default test USER account created successfully! (Username: user, Password: User@123456)");
        }
    }
}
