package com.matador.app.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.*;
import java.util.Set;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidActionTypeValidator.class)
public @interface ValidActionType {
    String message() default "Invalid actionType. Must be BUY or SELL";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

class ValidActionTypeValidator implements ConstraintValidator<ValidActionType, String> {
    private static final Set<String> VALID_ACTION_TYPES = Set.of("BUY", "SELL");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // @NotBlank handles null check
        }
        return VALID_ACTION_TYPES.contains(value.toUpperCase());
    }
}
