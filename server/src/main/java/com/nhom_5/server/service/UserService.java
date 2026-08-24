package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.AdminUpdateUserRequest;
import com.nhom_5.server.dto.request.CreateUserRequest;
import com.nhom_5.server.dto.request.UpdateProfileRequest;
import com.nhom_5.server.dto.response.PageResponse;
import com.nhom_5.server.dto.response.UserProfileDto;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    UserProfileDto getCurrentProfile();

    UserProfileDto updateCurrentProfile(UpdateProfileRequest request);

    PageResponse<UserProfileDto> getUsers(String keyword, Role role, UserStatus status, Pageable pageable);

    UserProfileDto getUserById(UUID id);

    UserProfileDto createUser(CreateUserRequest request);

    UserProfileDto updateUser(UUID id, AdminUpdateUserRequest request);

    void deleteUser(UUID id);
}
