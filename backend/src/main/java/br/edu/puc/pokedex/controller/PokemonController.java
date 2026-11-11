package br.edu.puc.pokedex.controller;
import br.edu.puc.pokedex.model.Pokemon;
import br.edu.puc.pokedex.service.PokemonService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/pokemons")
public class PokemonController {
 private final PokemonService service;
 public PokemonController(PokemonService service) { this.service=service; }
 @GetMapping public List<Pokemon> list(@RequestParam(required=false) String name, @RequestParam(required=false) Integer type) { return service.list(name,type); }
 @GetMapping("/{id}") public Pokemon get(@PathVariable Integer id) { return service.get(id); }
 @PostMapping public ResponseEntity<Pokemon> create(@Valid @RequestBody PokemonRequest request) {
  Pokemon pokemon=service.create(request);
  return ResponseEntity.created(URI.create("/api/pokemons/"+pokemon.id())).body(pokemon);
 }
 @PutMapping("/{id}") public Pokemon update(@PathVariable Integer id, @Valid @RequestBody PokemonRequest request) { return service.update(id,request); }
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Integer id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
