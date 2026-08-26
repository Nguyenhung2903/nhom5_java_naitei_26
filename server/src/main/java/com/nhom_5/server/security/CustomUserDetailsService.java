package com.nhom_5.server.security;

import com.nhom_5.server.entity.User;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(identifier.trim().toLowerCase())
                .orElseGet(() -> userRepository.findByEmail(identifier.trim().toLowerCase())
                        .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với identifier: " + identifier)));

        return new CustomUserDetails(user);
    }
}
