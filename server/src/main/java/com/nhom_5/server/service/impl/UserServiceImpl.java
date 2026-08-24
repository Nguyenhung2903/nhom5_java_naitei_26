package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.AdminUpdateUserRequest;
import com.nhom_5.server.dto.request.CreateUserRequest;
import com.nhom_5.server.dto.request.UpdateProfileRequest;
import com.nhom_5.server.dto.response.PageResponse;
import com.nhom_5.server.dto.response.UserProfileDto;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.UserRepository;
import com.nhom_5.server.service.UserService;
import com.nhom_5.server.util.SecurityUtil;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getCurrentProfile() {
        User currentUser = SecurityUtil.getCurrentUser();
        User freshUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return UserProfileDto.fromEntity(freshUser);
    }

    @Override
    @Transactional
    public UserProfileDto updateCurrentProfile(UpdateProfileRequest request) {
        User currentUser = SecurityUtil.getCurrentUser();
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String newUsername = request.getUsername().trim().toLowerCase();

        // Nếu người dùng thay đổi username, kiểm tra xem username mới đã bị user khác chiếm chưa
        if (!newUsername.equalsIgnoreCase(user.getUsername())) {
            if (userRepository.existsByUsernameAndIdNot(newUsername, user.getId())) {
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }
            user.setUsername(newUsername);
        }

        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone());
        user.setBirthday(request.getBirthday());
        user.setGender(request.getGender());
        user.setAvatar(request.getAvatar());

        User savedUser = userRepository.save(user);
        log.info("User [{}] updated their personal profile successfully", savedUser.getId());
        return UserProfileDto.fromEntity(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserProfileDto> getUsers(String keyword, Role role, UserStatus status, Pageable pageable) {
        Specification<User> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Tìm kiếm theo keyword
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate usernameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), pattern);
                Predicate fullNameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), pattern);
                Predicate emailMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), pattern);
                Predicate phoneMatch = criteriaBuilder.like(root.get("phone"), pattern);

                predicates.add(criteriaBuilder.or(usernameMatch, fullNameMatch, emailMatch, phoneMatch));
            }

            // 2. Lọc theo role
            if (role != null) {
                predicates.add(criteriaBuilder.equal(root.get("role"), role));
            }

            // 3. Lọc theo status
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);
        Page<UserProfileDto> dtoPage = userPage.map(UserProfileDto::fromEntity);
        return PageResponse.fromPage(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return UserProfileDto.fromEntity(user);
    }

    @Override
    @Transactional
    public UserProfileDto createUser(CreateUserRequest request) {
        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();

        log.info("Admin creating user: username [{}], email [{}]", username, email);

        if (userRepository.existsByUsername(username)) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User newUser = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .birthday(request.getBirthday())
                .gender(request.getGender())
                .avatar(request.getAvatar())
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("User created successfully by admin with ID: [{}]", savedUser.getId());
        return UserProfileDto.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public UserProfileDto updateUser(UUID id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String newUsername = request.getUsername().trim().toLowerCase();

        if (!newUsername.equalsIgnoreCase(user.getUsername())) {
            if (userRepository.existsByUsernameAndIdNot(newUsername, id)) {
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }
            user.setUsername(newUsername);
        }

        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone());
        user.setBirthday(request.getBirthday());
        user.setGender(request.getGender());
        user.setAvatar(request.getAvatar());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        // Đặt lại mật khẩu mới nếu được cung cấp
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            log.info("Password reset by admin for user ID: [{}]", id);
        }

        User updatedUser = userRepository.save(user);
        log.info("User [{}] updated successfully by admin", id);
        return UserProfileDto.fromEntity(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Soft delete / Lock account
        user.setStatus(UserStatus.LOCKED);
        userRepository.save(user);
        log.info("User [{}] has been locked/soft-deleted by admin", id);
    }
}
