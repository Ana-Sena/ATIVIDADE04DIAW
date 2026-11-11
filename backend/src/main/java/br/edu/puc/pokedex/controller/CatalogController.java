package br.edu.puc.pokedex.controller;
import br.edu.puc.pokedex.model.*;
import br.edu.puc.pokedex.repository.*;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api")
public class CatalogController {
 private final PokemonTypeRepository types;
 private final TrainerRepository trainers;
 public CatalogController(PokemonTypeRepository types, TrainerRepository trainers) { this.types=types; this.trainers=trainers; }
 @GetMapping("/types") public List<PokemonType> types() { return types.findAll(Sort.by("id")); }
 @GetMapping("/trainers") public List<Trainer> trainers() { return trainers.findAll(Sort.by("id")); }
}
