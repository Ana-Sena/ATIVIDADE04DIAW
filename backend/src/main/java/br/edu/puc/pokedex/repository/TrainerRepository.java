package br.edu.puc.pokedex.repository;
import br.edu.puc.pokedex.model.Trainer;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface TrainerRepository extends MongoRepository<Trainer, Integer> {}
