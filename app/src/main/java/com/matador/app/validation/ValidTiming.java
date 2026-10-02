package com.matador.app.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.*;
import java.util.Set;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidTimingValidator.class)
public @interface ValidTiming {
    String message() default "Invalid timing. Must be DAY (day order) or GTC (good-til-canceled)";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

class ValidTimingValidator implements ConstraintValidator<ValidTiming, String> {
    private static final Set<String> VALID_TIMINGS = Set.of("DAY", "GTC");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // @NotBlank handles null check
        }
        return VALID_TIMINGS.contains(value.toUpperCase());
    }
}
