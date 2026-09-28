package com.matador.app.exception;


public class OrderRejectedException extends RuntimeException {

    public OrderRejectedException(String message) {
        super(message);
    }

}
