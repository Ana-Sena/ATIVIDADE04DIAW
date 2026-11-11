package br.edu.puc.pokedex.controller;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(ResponseStatusException.class)
 public ResponseEntity<?> status(ResponseStatusException e) { return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null ? "Requisição inválida." : e.getReason())); }
 @ExceptionHandler(DuplicateKeyException.class)
 public ResponseEntity<?> duplicate() { return ResponseEntity.status(409).body(Map.of("message","Já existe um Pokémon com este ID.")); }
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
  String message=e.getBindingResult().getFieldErrors().stream().map(f -> f.getField()+": "+f.getDefaultMessage()).collect(Collectors.joining("; "));
  return ResponseEntity.badRequest().body(Map.of("message",message));
 }
 @ExceptionHandler({HttpMessageNotReadableException.class,MethodArgumentTypeMismatchException.class})
 public ResponseEntity<?> malformed() { return ResponseEntity.badRequest().body(Map.of("message","Verifique os campos e os valores numéricos enviados.")); }
 @ExceptionHandler(DataAccessResourceFailureException.class)
 public ResponseEntity<?> unavailable() { return ResponseEntity.status(503).body(Map.of("message","Banco de dados indisponível. Tente novamente.")); }
}
