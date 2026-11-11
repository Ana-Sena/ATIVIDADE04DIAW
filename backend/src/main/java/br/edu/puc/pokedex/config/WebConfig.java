package br.edu.puc.pokedex.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class WebConfig implements WebMvcConfigurer {
 @Value("${pokedex.cors.origins}") private String[] origins;
 @Override public void addCorsMappings(CorsRegistry registry) {
  registry.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET","POST","PUT","DELETE","OPTIONS").allowedHeaders("Content-Type");
 }
}
