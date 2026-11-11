package br.edu.puc.pokedex.model;
import jakarta.validation.constraints.*;
public record Stats(
 @NotNull @Min(0) @Max(999) Integer hp,
 @NotNull @Min(0) @Max(999) Integer attack,
 @NotNull @Min(0) @Max(999) Integer defense,
 @NotNull @Min(0) @Max(999) Integer specialAttack,
 @NotNull @Min(0) @Max(999) Integer specialDefense,
 @NotNull @Min(0) @Max(999) Integer speed
) {}
