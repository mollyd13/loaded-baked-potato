package com.matador.app.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.*;
import java.util.Set;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidAssetTypeValidator.class)
public @interface ValidAssetType {
    String message() default "Invalid assetType. Must be EQUITY, CRYPTO, or FX";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

class ValidAssetTypeValidator implements ConstraintValidator<ValidAssetType, String> {
    private static final Set<String> VALID_ASSET_TYPES = Set.of("EQUITY", "CRYPTO", "FX");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // @NotNull handles null check
        }
        return VALID_ASSET_TYPES.contains(value.toUpperCase());
    }
}
