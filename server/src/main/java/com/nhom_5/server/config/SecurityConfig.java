package com.nhom_5.server.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Kích hoạt CORS Filter sử dụng Bean CorsConfigurationSource đã cấu hình
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // Vô hiệu hóa CSRF vì ứng dụng sử dụng kiến trúc RESTful Stateless
                .csrf(AbstractHttpConfigurer::disable)
                // Cấu hình Session Stateless (sẽ tích hợp JWT Token sau)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Vô hiệu hóa Form Login và Basic Auth mặc định của Spring Security
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                // Tạm thời permitAll cho các endpoint công khai để client dev và gọi API dễ dàng
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/test/**",
                                "/health/**",
                                "/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .anyRequest().permitAll() // Permit all for active feature development phase
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
