package br.edu.puc.pokedex;
import br.edu.puc.pokedex.controller.PokemonRequest;
import br.edu.puc.pokedex.model.*;
import br.edu.puc.pokedex.repository.*;
import br.edu.puc.pokedex.service.PokemonService;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class PokemonServiceTest {
 PokemonRepository pokemons=mock(PokemonRepository.class);
 PokemonTypeRepository types=mock(PokemonTypeRepository.class);
 MongoTemplate mongo=mock(MongoTemplate.class);
 PokemonService service=new PokemonService(pokemons,types,mongo);
 Stats stats=new Stats(35,55,30,50,40,90);
 @Test void unknownTypeAndRepeatedTypesAreRejected() {
  assertThrows(ResponseStatusException.class,()->service.create(new PokemonRequest(25,"Pikachu",stats,List.of(5,5))));
  when(types.findById(99)).thenReturn(Optional.empty());
  assertThrows(ResponseStatusException.class,()->service.create(new PokemonRequest(25,"Pikachu",stats,List.of(99))));
  verify(pokemons,never()).insert(any(Pokemon.class));
 }
 @Test void updateCannotCreateMissingPokemonOrChangeId() {
  when(pokemons.findById(25)).thenReturn(Optional.empty());
  assertThrows(ResponseStatusException.class,()->service.update(25,new PokemonRequest(25,"Pikachu",stats,List.of())));
  when(pokemons.findById(25)).thenReturn(Optional.of(new Pokemon(25,"Pikachu",stats,List.of())));
  assertThrows(ResponseStatusException.class,()->service.update(25,new PokemonRequest(26,"Raichu",stats,List.of())));
  verify(pokemons,never()).save(any());
 }
}
