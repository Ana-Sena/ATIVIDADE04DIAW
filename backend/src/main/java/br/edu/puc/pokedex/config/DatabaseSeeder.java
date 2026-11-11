package br.edu.puc.pokedex.config;
import br.edu.puc.pokedex.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.bson.Document;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty(name="pokedex.seed.enabled",havingValue="true",matchIfMissing=true)
public class DatabaseSeeder implements CommandLineRunner {
 private final MongoTemplate mongo;
 private final ObjectMapper mapper;
 public DatabaseSeeder(MongoTemplate mongo,ObjectMapper mapper) { this.mongo=mongo; this.mapper=mapper; }
 record Seed(List<Pokemon> pokemon,List<PokemonType> types,List<Trainer> trainers) {}
 @Override public void run(String... args) throws Exception {
  // O marcador preserva edições e exclusões em reinícios posteriores.
  if (mongo.findById("sql-v1",Document.class,"seed_history") != null) return;
  try (var input=new ClassPathResource("seed/pokedex.json").getInputStream()) {
   Seed seed=mapper.readValue(input,Seed.class);
   for (var type:seed.types()) insertIfMissing(type.id(),type,PokemonType.class);
   for (var pokemon:seed.pokemon()) insertIfMissing(pokemon.id(),pokemon,Pokemon.class);
   for (var trainer:seed.trainers()) insertIfMissing(trainer.id(),trainer,Trainer.class);
   mongo.insert(new Document("_id","sql-v1").append("source","Script_Pokedex.sql"),"seed_history");
  }
 }
 private void insertIfMissing(Integer id,Object value,Class<?> model) {
  if (!mongo.exists(Query.query(Criteria.where("_id").is(id)),model)) mongo.insert(value);
 }
}
