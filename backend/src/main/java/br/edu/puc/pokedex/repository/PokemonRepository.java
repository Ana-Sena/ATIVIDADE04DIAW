package br.edu.puc.pokedex.repository;
import br.edu.puc.pokedex.model.Pokemon;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface PokemonRepository extends MongoRepository<Pokemon, Integer> {}
