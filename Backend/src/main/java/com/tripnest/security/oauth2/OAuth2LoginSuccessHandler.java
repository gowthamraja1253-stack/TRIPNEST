package com.tripnest.security.oauth2;

import com.tripnest.security.jwt.JwtTokenProvider;
import com.tripnest.user.entity.Role;
import com.tripnest.user.entity.User;
import com.tripnest.user.entity.UserRole;
import com.tripnest.user.repository.RoleRepository;
import com.tripnest.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String login = oAuth2User.getAttribute("login");
        
        if (email == null) {
            email = (login != null ? login : "user" + System.currentTimeMillis()) + "@tripnest.local";
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;

        if (userOptional.isPresent()) {

            user = userOptional.get();

        } else {

            Role travelerRole = roleRepository.findByName(UserRole.TRAVELER)
                    .orElseThrow(() ->
                            new RuntimeException("TRAVELER role not found"));

            Set<Role> roles = new HashSet<>();
            roles.add(travelerRole);

            user = User.builder()
                    .email(email)
                    .username(email.split("@")[0] + "_" + System.currentTimeMillis())
                    .firstName(name != null ? name.split(" ")[0] : "")
                    .lastName(name != null && name.contains(" ")
                            ? name.substring(name.indexOf(" ") + 1)
                            : "")
                    .password("")
                    .roles(roles)
                    .build();

            user = userRepository.save(user);
        }

        String token = tokenProvider.generateToken(user.getUsername());

        String targetUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("token", token)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}