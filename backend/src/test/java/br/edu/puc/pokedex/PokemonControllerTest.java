package br.edu.puc.pokedex;
import br.edu.puc.pokedex.controller.*;
import br.edu.puc.pokedex.model.*;
import br.edu.puc.pokedex.service.PokemonService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(PokemonController.class)
class PokemonControllerTest {
 @Autowired MockMvc mvc;
 @MockitoBean PokemonService service;
 private final Pokemon pikachu=new Pokemon(25,"Pikachu",new Stats(35,55,30,50,40,90),List.of(new PokemonType(5,"Electric")));
 private final String body="""
 {"id":25,"name":"Pikachu","stats":{"hp":35,"attack":55,"defense":30,"specialAttack":50,"specialDefense":40,"speed":90},"typeIds":[5]}
 """;
 @Test void listsAndFindsDetails() throws Exception {
  when(service.list(null,null)).thenReturn(List.of(pikachu)); when(service.get(25)).thenReturn(pikachu);
  mvc.perform(get("/api/pokemons")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(25));
  mvc.perform(get("/api/pokemons/25")).andExpect(status().isOk()).andExpect(jsonPath("$.stats.hp").value(35));
 }
 @Test void createsUpdatesAndDeletes() throws Exception {
  when(service.create(any())).thenReturn(pikachu); when(service.update(eq(25),any())).thenReturn(pikachu);
  mvc.perform(post("/api/pokemons").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andExpect(header().string("Location","/api/pokemons/25"));
  mvc.perform(put("/api/pokemons/25").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk());
  mvc.perform(delete("/api/pokemons/25")).andExpect(status().isNoContent()); verify(service).delete(25);
 }
 @Test void rejectsInvalidAndMissingFieldsBeforePersistence() throws Exception {
  mvc.perform(post("/api/pokemons").contentType(MediaType.APPLICATION_JSON).content(body.replaceFirst("35","-1"))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/pokemons").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isBadRequest());
  mvc.perform(get("/api/pokemons/abc")).andExpect(status().isBadRequest()); verifyNoInteractions(service);
 }
 @Test void returnsNotFoundAndConflict() throws Exception {
  when(service.get(999)).thenThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND,"Pokémon não encontrado."));
  when(service.create(any())).thenThrow(new org.springframework.dao.DuplicateKeyException("duplicate"));
  mvc.perform(get("/api/pokemons/999")).andExpect(status().isNotFound()).andExpect(jsonPath("$.message").value("Pokémon não encontrado."));
  mvc.perform(post("/api/pokemons").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
 }
}
