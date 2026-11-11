package br.edu.puc.pokedex.service;
import br.edu.puc.pokedex.controller.PokemonRequest;
import br.edu.puc.pokedex.model.*;
import br.edu.puc.pokedex.repository.*;
import java.util.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
@Service
public class PokemonService {
 private final PokemonRepository pokemons;
 private final PokemonTypeRepository types;
 private final MongoTemplate mongo;
 public PokemonService(PokemonRepository pokemons, PokemonTypeRepository types, MongoTemplate mongo) {
  this.pokemons=pokemons; this.types=types; this.mongo=mongo;
 }
 public List<Pokemon> list(String name, Integer type) {
  return pokemons.findAll(Sort.by("id")).stream()
   .filter(p -> name == null || p.name().toLowerCase(Locale.ROOT).contains(name.trim().toLowerCase(Locale.ROOT)))
   .filter(p -> type == null || p.types().stream().anyMatch(t -> t.id().equals(type))).toList();
 }
 public Pokemon get(Integer id) {
  return pokemons.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Pokémon não encontrado."));
 }
 private Pokemon document(PokemonRequest request) {
  if (new HashSet<>(request.typeIds()).size() != request.typeIds().size())
   throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecione tipos diferentes.");
  List<PokemonType> selected = request.typeIds().stream().map(id -> types.findById(id)
   .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Tipo não encontrado: " + id))).toList();
  return new Pokemon(request.id(),request.name().trim(),request.stats(),selected);
 }
 public Pokemon create(PokemonRequest request) { return pokemons.insert(document(request)); }
 public Pokemon update(Integer id, PokemonRequest request) {
  get(id);
  if (!id.equals(request.id())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"O ID não pode ser alterado.");
  return pokemons.save(document(request));
 }
 public void delete(Integer id) {
  get(id);
  mongo.updateMulti(Query.query(Criteria.where("pokemonIds").is(id)), new Update().pull("pokemonIds",id), Trainer.class);
  pokemons.deleteById(id);
 }
}
