package com.matador.app.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.*;
import java.util.Set;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidOrderTypeValidator.class)
public @interface ValidOrderType {
    String message() default "Invalid orderType. Must be MARKET or LIMIT";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

class ValidOrderTypeValidator implements ConstraintValidator<ValidOrderType, String> {
    private static final Set<String> VALID_ORDER_TYPES = Set.of("MARKET", "LIMIT");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // @NotBlank handles null check
        }
        return VALID_ORDER_TYPES.contains(value.toUpperCase());
    }
}
