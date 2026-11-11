package br.edu.puc.pokedex.repository;
import br.edu.puc.pokedex.model.PokemonType;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface PokemonTypeRepository extends MongoRepository<PokemonType, Integer> {}
