package br.edu.puc.pokedex.controller;
import br.edu.puc.pokedex.model.Stats;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
public record PokemonRequest(
 @NotNull @Positive Integer id,
 @NotBlank @Size(max=80) String name,
 @NotNull @Valid Stats stats,
 @NotNull @Size(max=2) List<@NotNull @PositiveOrZero Integer> typeIds
) {}
