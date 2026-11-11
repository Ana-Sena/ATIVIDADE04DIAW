package br.edu.puc.pokedex.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document("types")
public record PokemonType(@Id Integer id, String name) {}
