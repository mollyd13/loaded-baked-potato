package com.matador.app.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidCurrencyCodeValidator.class)
public @interface ValidCurrencyCode {
    String message() default "Currency must be a valid 3-letter code (e.g., USD, EUR, BTC)";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

class ValidCurrencyCodeValidator implements ConstraintValidator<ValidCurrencyCode, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // @NotBlank handles null check
        }
        String upperValue = value.toUpperCase();
        return upperValue.length() == 3 && upperValue.matches("[A-Z]{3}");
    }
}
